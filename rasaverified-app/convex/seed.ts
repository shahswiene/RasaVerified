import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Malaysian restaurant mock data with varied credibility profiles
const RESTAURANTS: {
  name: string; location: string; cuisine: string;
  halalStatus: "halal" | "non-halal" | "unknown";
  priceRange: "$" | "$$" | "$$$" | "$$$$";
}[] = [
  { name: "Nasi Kandar Pelita", location: "Kuala Lumpur", cuisine: "Malay", halalStatus: "halal", priceRange: "$" },
  { name: "Din Tai Fung KLCC", location: "Kuala Lumpur", cuisine: "Chinese", halalStatus: "non-halal", priceRange: "$$$" },
  { name: "Restoran Rebung", location: "Bangsar", cuisine: "Malay", halalStatus: "halal", priceRange: "$$" },
  { name: "Jalan Alor Street Food", location: "Bukit Bintang", cuisine: "Mixed", halalStatus: "unknown", priceRange: "$" },
  { name: "Village Park Restaurant", location: "Damansara Utama", cuisine: "Malay", halalStatus: "halal", priceRange: "$" },
  { name: "MyBurgerLab", location: "Seapark PJ", cuisine: "Western", halalStatus: "non-halal", priceRange: "$$" },
  { name: "Raju's Banana Leaf", location: "Bangsar", cuisine: "Indian", halalStatus: "halal", priceRange: "$" },
  { name: "Sushi Zanmai", location: "Pavilion KL", cuisine: "Japanese", halalStatus: "non-halal", priceRange: "$$$" },
];

// Reviewer archetypes with varied credibility
const REVIEWER_PROFILES = [
  // Authentic long-term reviewers
  { name: "FoodieAzman", totalReviews: 87, accountAge: 730, suspiciousScore: 5 },
  { name: "MakanQueen", totalReviews: 142, accountAge: 1095, suspiciousScore: 2 },
  { name: "KLBitesBlog", totalReviews: 203, accountAge: 1460, suspiciousScore: 3 },
  { name: "SambalLover99", totalReviews: 56, accountAge: 540, suspiciousScore: 8 },
  { name: "TehTarikAddict", totalReviews: 34, accountAge: 365, suspiciousScore: 10 },
  // Moderate credibility
  { name: "NewFoodExplorer", totalReviews: 12, accountAge: 120, suspiciousScore: 20 },
  { name: "WeekendMakan", totalReviews: 8, accountAge: 90, suspiciousScore: 25 },
  { name: "HalalHunter", totalReviews: 15, accountAge: 180, suspiciousScore: 15 },
  // Suspicious accounts
  { name: "review_bot_388", totalReviews: 1, accountAge: 7, suspiciousScore: 85 },
  { name: "bestfood_promo", totalReviews: 1, accountAge: 3, suspiciousScore: 90 },
  { name: "newuser_20260101", totalReviews: 1, accountAge: 14, suspiciousScore: 80 },
  { name: "sponsored_taste", totalReviews: 2, accountAge: 10, suspiciousScore: 75 },
  { name: "5star_always", totalReviews: 1, accountAge: 5, suspiciousScore: 95 },
  { name: "quickreview_my", totalReviews: 1, accountAge: 2, suspiciousScore: 92 },
];

// Review templates by credibility tier
const AUTHENTIC_REVIEWS = [
  { rating: 4, text: "Went here on a Tuesday evening, ordered the nasi kandar with ayam goreng berempah and dhal. The chicken was crispy on the outside but juicy inside. Kuah campur was rich but could use a bit more kick. RM12.50 for the set, fair pricing for the portion. Will come back for the fish head curry next time." },
  { rating: 5, text: "This place has been consistently good for the past 3 years I've been coming here. The roti canai is fluffy and layered perfectly. Staff remembers my usual order which is a nice touch. Parking can be tricky during peak hours though — suggest going before 12pm." },
  { rating: 3, text: "Food quality has dipped compared to my last visit 6 months ago. The rendang was too dry this time and lacked the coconut richness it used to have. Service was slow — waited 25 minutes for mains. Still decent for the area but not the best it can be." },
  { rating: 4, text: "Ordered the set lunch — nasi lemak with sambal sotong, fried egg, and ikan bilis. Sambal was the right balance of sweet and spicy. Portion size was generous. The iced teh tarik was perfectly frothy. RM9.90 is a steal for this quality." },
  { rating: 2, text: "Disappointed with this visit. The mee goreng mamak was overly oily and the prawns tasted like they'd been frozen for a while. Ambiance was okay but the AC wasn't working properly on a 35°C day. Wouldn't prioritize a return visit." },
  { rating: 5, text: "Best banana leaf rice in KL hands down. The rasam is complex with tamarind and pepper notes. Fish curry has generous chunks. Unlimited rice refills. Been coming here every other week for 2 years. Pro tip: go at 11:30am before the lunch rush." },
  { rating: 4, text: "Tried the chef's special tasting menu — 5 courses for RM88. The laksa course was outstanding, rich coconut broth with perfectly al dente noodles. Dessert cendol was a nice finish. Service was attentive without being intrusive." },
  { rating: 3, text: "Average experience overall. The char kuey teow had good wok hei but was underseasoned. Could use more cockles and prawns for the price they charge (RM15). Location is convenient though, right next to the LRT station." },
];

const MODERATE_REVIEWS = [
  { rating: 4, text: "Good food and nice ambiance. The staff were friendly. Would recommend trying the specialty dishes." },
  { rating: 5, text: "Really enjoyed the meal here. Everything was fresh and tasty. Good value for money in this area." },
  { rating: 3, text: "It was okay. Nothing special but nothing bad either. Decent place for a quick lunch." },
  { rating: 4, text: "Came with family last weekend. Kids loved the fried rice. Portions are big enough to share. Clean restaurant." },
];

const SUSPICIOUS_REVIEWS = [
  { rating: 5, text: "Amazing! Best ever! Must try!" },
  { rating: 5, text: "So good love it highly recommend" },
  { rating: 5, text: "Delicious food amazing service perfect place" },
  { rating: 5, text: "Best food great taste yummy" },
  { rating: 5, text: "Highly recommend amazing delicious fantastic" },
  { rating: 5, text: "Love it so good must try amazing" },
  { rating: 5, text: "Perfect wonderful excellent amazing food" },
  { rating: 5, text: "Best restaurant ever highly recommend" },
];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgoMax: number): number {
  const now = Date.now();
  const daysAgo = Math.floor(Math.random() * daysAgoMax);
  return now - daysAgo * 24 * 60 * 60 * 1000;
}

function burstDate(baseTime: number): number {
  // Within a 6-hour window of the base time
  return baseTime + Math.floor(Math.random() * 6 * 60 * 60 * 1000);
}

export const seedAll = internalMutation(async (ctx) => {
  console.log("[seed] Starting full seed...");

  // Clear existing data
  const existingRestaurants = await ctx.db.query("restaurants").collect();
  for (const r of existingRestaurants) await ctx.db.delete(r._id);

  const existingReviews = await ctx.db.query("reviews").collect();
  for (const r of existingReviews) await ctx.db.delete(r._id);

  const existingReviewers = await ctx.db.query("reviewers").collect();
  for (const r of existingReviewers) await ctx.db.delete(r._id);

  const existingScores = await ctx.db.query("trust_scores").collect();
  for (const s of existingScores) await ctx.db.delete(s._id);

  const existingUsers = await ctx.db.query("users").collect();
  for (const u of existingUsers) await ctx.db.delete(u._id);

  // Insert reviewers
  const reviewerIds = [];
  for (const profile of REVIEWER_PROFILES) {
    const id = await ctx.db.insert("reviewers", profile);
    reviewerIds.push({ id, ...profile });
  }

  const authenticReviewerIds = reviewerIds.filter((r) => r.suspiciousScore < 20);
  const moderateReviewerIds = reviewerIds.filter(
    (r) => r.suspiciousScore >= 15 && r.suspiciousScore < 50,
  );
  const suspiciousReviewerIds = reviewerIds.filter((r) => r.suspiciousScore >= 70);

  // Insert restaurants and reviews with different credibility profiles
  for (let i = 0; i < RESTAURANTS.length; i++) {
    const restaurantId = await ctx.db.insert("restaurants", {
      ...RESTAURANTS[i],
      source: "seed" as const,
      createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    });

    // Profile mix varies per restaurant to create different trust scores
    if (i < 3) {
      // High credibility restaurants: mostly authentic reviews
      for (let j = 0; j < 8; j++) {
        const reviewer = randomPick(authenticReviewerIds);
        const review = randomPick(AUTHENTIC_REVIEWS);
        await ctx.db.insert("reviews", {
          restaurantId,
          rating: review.rating,
          reviewText: review.text,
          reviewerId: reviewer.id,
          source: "seed" as const,
          active: true,
          createdAt: randomDate(365),
        });
      }
      for (let j = 0; j < 2; j++) {
        const reviewer = randomPick(moderateReviewerIds);
        const review = randomPick(MODERATE_REVIEWS);
        await ctx.db.insert("reviews", {
          restaurantId,
          rating: review.rating,
          reviewText: review.text,
          reviewerId: reviewer.id,
          source: "seed" as const,
          active: true,
          createdAt: randomDate(180),
        });
      }
    } else if (i < 5) {
      // Mixed credibility: some authentic, some suspicious
      for (let j = 0; j < 4; j++) {
        const reviewer = randomPick(authenticReviewerIds);
        const review = randomPick(AUTHENTIC_REVIEWS);
        await ctx.db.insert("reviews", {
          restaurantId,
          rating: review.rating,
          reviewText: review.text,
          reviewerId: reviewer.id,
          source: "seed" as const,
          active: true,
          createdAt: randomDate(300),
        });
      }
      for (let j = 0; j < 3; j++) {
        const reviewer = randomPick(moderateReviewerIds);
        const review = randomPick(MODERATE_REVIEWS);
        await ctx.db.insert("reviews", {
          restaurantId,
          rating: review.rating,
          reviewText: review.text,
          reviewerId: reviewer.id,
          source: "seed" as const,
          active: true,
          createdAt: randomDate(90),
        });
      }
      const burstBase = Date.now() - 7 * 24 * 60 * 60 * 1000;
      for (let j = 0; j < 3; j++) {
        const reviewer = randomPick(suspiciousReviewerIds);
        const review = randomPick(SUSPICIOUS_REVIEWS);
        await ctx.db.insert("reviews", {
          restaurantId,
          rating: review.rating,
          reviewText: review.text,
          reviewerId: reviewer.id,
          source: "seed" as const,
          active: true,
          createdAt: burstDate(burstBase),
        });
      }
    } else {
      // High manipulation: mostly suspicious reviews with burst pattern
      for (let j = 0; j < 2; j++) {
        const reviewer = randomPick(authenticReviewerIds);
        const review = randomPick(AUTHENTIC_REVIEWS);
        await ctx.db.insert("reviews", {
          restaurantId,
          rating: review.rating,
          reviewText: review.text,
          reviewerId: reviewer.id,
          source: "seed" as const,
          active: true,
          createdAt: randomDate(200),
        });
      }
      const burstBase = Date.now() - 3 * 24 * 60 * 60 * 1000;
      for (let j = 0; j < 8; j++) {
        const reviewer = randomPick(suspiciousReviewerIds);
        const review = randomPick(SUSPICIOUS_REVIEWS);
        await ctx.db.insert("reviews", {
          restaurantId,
          rating: review.rating,
          reviewText: review.text,
          reviewerId: reviewer.id,
          source: "seed" as const,
          active: true,
          createdAt: burstDate(burstBase),
        });
      }
    }

    // Compute trust score for this restaurant
    await ctx.scheduler.runAfter(0, internal.scoring.computeTrustScore, {
      restaurantId,
    });
  }

  console.log(
    `[seed] Seeded ${RESTAURANTS.length} restaurants, ${REVIEWER_PROFILES.length} reviewers`,
  );
});
