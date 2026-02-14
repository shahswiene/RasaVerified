import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

// --- Weight constants from README spec ---
const WEIGHTS = {
  reviewerCredibility: 0.30,
  ratingStability: 0.25,
  languageAuthenticity: 0.20,
  burstPattern: 0.15,
  reviewDiversity: 0.10,
} as const;

// --- Suspicion thresholds ---
const THRESHOLDS = {
  burstWindowMs: 24 * 60 * 60 * 1000,
  burstPercent: 0.40,
  phraseSimilarity: 0.60,
  fiveStarSpike: 0.70,
  minReviewsForReliable: 2,
  shortReviewLength: 30,
} as const;

// --- Verdict boundaries ---
function deriveVerdict(score: number): string {
  if (score >= 75) return "Highly Authentic";
  if (score >= 45) return "Mixed Credibility";
  return "High Manipulation Risk";
}

// --- Sub-score helpers ---

function scoreReviewerCredibility(reviewers: Doc<"reviewers">[]): number {
  if (reviewers.length === 0) return 50;

  let total = 0;
  for (const r of reviewers) {
    let s = 50;
    if (r.totalReviews >= 10) s += 20;
    else if (r.totalReviews >= 5) s += 10;
    else if (r.totalReviews <= 1) s -= 25;

    if (r.accountAge >= 365) s += 15;
    else if (r.accountAge >= 90) s += 5;
    else if (r.accountAge < 30) s -= 15;

    s -= r.suspiciousScore * 0.5;
    total += Math.max(0, Math.min(100, s));
  }
  return total / reviewers.length;
}

function scoreRatingStability(reviews: Doc<"reviews">[]): number {
  if (reviews.length < 2) return 50;

  const ratings = reviews.map((r) => r.rating);
  const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const variance =
    ratings.reduce((sum, r) => sum + (r - mean) ** 2, 0) / ratings.length;
  const stdDev = Math.sqrt(variance);

  // Low variance → high stability → high score
  if (stdDev < 0.5) return 95;
  if (stdDev < 1.0) return 80;
  if (stdDev < 1.5) return 60;
  if (stdDev < 2.0) return 40;
  return 20;
}

function scoreLanguageAuthenticity(reviews: Doc<"reviews">[]): number {
  if (reviews.length === 0) return 50;

  const genericPhrases = [
    "amazing", "best ever", "highly recommend", "must try",
    "so good", "love it", "great food", "nice place",
    "delicious", "yummy", "awesome", "fantastic",
    "perfect", "wonderful", "excellent service",
  ];

  let totalScore = 0;
  for (const review of reviews) {
    const lower = review.reviewText.toLowerCase();
    let s = 80;

    // Penalise short reviews
    if (lower.length < THRESHOLDS.shortReviewLength) s -= 30;

    // Count generic phrase hits
    let genericHits = 0;
    for (const phrase of genericPhrases) {
      if (lower.includes(phrase)) genericHits++;
    }
    if (genericHits >= 4) s -= 35;
    else if (genericHits >= 2) s -= 15;

    // Reward detail (mentions specific dishes, numbers, etc.)
    if (/\d/.test(lower) || lower.length > 150) s += 10;

    totalScore += Math.max(0, Math.min(100, s));
  }
  return totalScore / reviews.length;
}

function scoreBurstPattern(reviews: Doc<"reviews">[], flags: string[]): number {
  if (reviews.length < 3) return 85;

  const sorted = [...reviews].sort((a, b) => a.createdAt - b.createdAt);
  const total = sorted.length;

  let maxInWindow = 0;
  let windowStart = 0;
  for (let windowEnd = 0; windowEnd < total; windowEnd++) {
    while (
      sorted[windowEnd].createdAt - sorted[windowStart].createdAt >
      THRESHOLDS.burstWindowMs
    ) {
      windowStart++;
    }
    const count = windowEnd - windowStart + 1;
    if (count > maxInWindow) maxInWindow = count;
  }

  const burstRatio = maxInWindow / total;
  if (burstRatio >= THRESHOLDS.burstPercent) {
    flags.push(`${Math.round(burstRatio * 100)}% of reviews arrived within 24 hours`);
  }

  // 5-star spike detection
  const fiveStars = reviews.filter((r) => r.rating === 5).length;
  const fiveStarRatio = fiveStars / total;
  if (fiveStarRatio >= THRESHOLDS.fiveStarSpike) {
    flags.push(`${Math.round(fiveStarRatio * 100)}% are 5-star ratings`);
  }

  if (burstRatio >= 0.6) return 15;
  if (burstRatio >= 0.4) return 35;
  if (burstRatio >= 0.25) return 60;
  return 90;
}

function scoreReviewDiversity(
  reviews: Doc<"reviews">[],
  reviewers: Doc<"reviewers">[],
  flags: string[],
): number {
  if (reviews.length === 0) return 50;

  const uniqueReviewers = new Set(reviews.map((r) => r.reviewerId)).size;
  const ratio = uniqueReviewers / reviews.length;

  // Single-review accounts
  const singleReviewAccounts = reviewers.filter((r) => r.totalReviews <= 1);
  if (singleReviewAccounts.length > reviewers.length * 0.5) {
    flags.push(
      `${singleReviewAccounts.length}/${reviewers.length} reviewers have only 1 review`,
    );
  }

  // Phrase similarity (simple Jaccard on bigrams)
  const texts = reviews.map((r) => r.reviewText.toLowerCase());
  let similarPairs = 0;
  let comparedPairs = 0;
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      comparedPairs++;
      const bigramsA = toBigrams(texts[i]);
      const bigramsB = toBigrams(texts[j]);
      const intersection = bigramsA.filter((b) => bigramsB.includes(b)).length;
      const union = new Set([...bigramsA, ...bigramsB]).size;
      if (union > 0 && intersection / union >= THRESHOLDS.phraseSimilarity) {
        similarPairs++;
      }
    }
  }
  if (comparedPairs > 0 && similarPairs / comparedPairs >= 0.3) {
    flags.push("High phrase similarity detected across reviews");
  }

  if (ratio >= 0.9) return 90;
  if (ratio >= 0.7) return 70;
  if (ratio >= 0.5) return 50;
  return 25;
}

function toBigrams(text: string): string[] {
  const words = text.split(/\s+/);
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  return bigrams;
}

// --- Main scoring mutation ---

export const computeTrustScore = internalMutation({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    console.log(`[scoring] Computing trust score for restaurant ${restaurantId}`);

    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect();
    // Only score active reviews (deduped community reviews are set inactive)
    const reviews = allReviews.filter((r) => r.active);

    const reviewerIds = [...new Set(reviews.map((r) => r.reviewerId))];
    const reviewers: Doc<"reviewers">[] = [];
    for (const id of reviewerIds) {
      const reviewer = await ctx.db.get(id);
      if (reviewer) reviewers.push(reviewer);
    }

    const flags: string[] = [];

    const reviewerCred = scoreReviewerCredibility(reviewers);
    const ratingStab = scoreRatingStability(reviews);
    const langAuth = scoreLanguageAuthenticity(reviews);
    const burst = scoreBurstPattern(reviews, flags);
    const diversity = scoreReviewDiversity(reviews, reviewers, flags);

    const overall = Math.round(
      WEIGHTS.reviewerCredibility * reviewerCred +
        WEIGHTS.ratingStability * ratingStab +
        WEIGHTS.languageAuthenticity * langAuth +
        WEIGHTS.burstPattern * burst +
        WEIGHTS.reviewDiversity * diversity,
    );

    const verdict = deriveVerdict(overall);

    console.log(
      `[scoring] restaurant=${restaurantId} overall=${overall} verdict="${verdict}" flags=${flags.length}`,
    );

    // Upsert trust_scores row
    const existing = await ctx.db
      .query("trust_scores")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .first();

    const payload = {
      restaurantId,
      overallScore: overall,
      reviewerCredibility: Math.round(reviewerCred),
      ratingStability: Math.round(ratingStab),
      languageAuthenticity: Math.round(langAuth),
      burstScore: Math.round(burst),
      reviewDiversity: Math.round(diversity),
      flags,
      verdict,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("trust_scores", payload);
    }

    return { overall, verdict, flags };
  },
});
