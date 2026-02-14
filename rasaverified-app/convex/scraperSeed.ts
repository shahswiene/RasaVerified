import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Scraped from Google Maps: "popular restaurants in Kuala Lumpur" on 2026-02-14
const SCRAPED_RESTAURANTS = [
  {
    name: "Bijan Bar & Restaurant",
    location: "Jalan Ceylon, KL",
    cuisine: "Malay",
    halalStatus: "halal" as const,
    priceRange: "$$$" as const,
    avgRating: 4.5,
  },
  {
    name: "Irama Dining Kuala Lumpur",
    location: "Lorong Raja Chulan, KL",
    cuisine: "Malay",
    halalStatus: "halal" as const,
    priceRange: "$$$" as const,
    avgRating: 4.6,
  },
  {
    name: "Bar.Kar Best Restaurant KL",
    location: "Jalan Tun Razak, KL",
    cuisine: "Mixed",
    halalStatus: "unknown" as const,
    priceRange: "$$" as const,
    avgRating: 4.6,
  },
  {
    name: "Bunglow37",
    location: "Jalan Abdullah, KL",
    cuisine: "Western",
    halalStatus: "non-halal" as const,
    priceRange: "$$$" as const,
    avgRating: 4.6,
  },
  {
    name: "Come On Tigers Restaurant",
    location: "Jalan Ampang, KL",
    cuisine: "Chinese",
    halalStatus: "non-halal" as const,
    priceRange: "$$" as const,
    avgRating: 4.7,
  },
  {
    name: "Beta KL",
    location: "Jalan Perak, KL",
    cuisine: "Malay",
    halalStatus: "halal" as const,
    priceRange: "$$$$" as const,
    avgRating: 4.8,
  },
  {
    name: "Fuego at Troika Sky Dining",
    location: "Persiaran KLCC, KL",
    cuisine: "Western",
    halalStatus: "non-halal" as const,
    priceRange: "$$$$" as const,
    avgRating: 4.7,
  },
  {
    name: "Dewakan",
    location: "Persiaran KLCC, KL",
    cuisine: "Malay",
    halalStatus: "halal" as const,
    priceRange: "$$$$" as const,
    avgRating: 4.9,
  },
  {
    name: "Limapulo Baba Can Cook",
    location: "Jalan Doraisamy, KL",
    cuisine: "Mixed",
    halalStatus: "non-halal" as const,
    priceRange: "$$" as const,
    avgRating: 4.5,
  },
  {
    name: "Nasi Lemak Antarabangsa",
    location: "Kampung Baru, KL",
    cuisine: "Malay",
    halalStatus: "halal" as const,
    priceRange: "$" as const,
    avgRating: 4.3,
  },
];

// Realistic review templates per rating tier
const REVIEWS_HIGH = [
  "Exceptional dining experience. The tasting menu was thoughtfully curated with local ingredients. Each course told a story of Malaysian heritage. Service was impeccable — our server explained every dish in detail. Worth every ringgit.",
  "Came here for a special anniversary dinner. The ambiance is stunning with the KL skyline as backdrop. The wagyu rendang was unlike anything I've had before — tender with deep, complex flavours. Reservation is a must.",
  "Third visit and it keeps getting better. The chef's creativity with traditional recipes is remarkable. The buah keluak ice cream was a revelation. Portions are generous for fine dining. Highly recommend the wine pairing.",
  "Outstanding from start to finish. The nasi ulam was elevated to art form. Fresh herbs, perfectly balanced sambal, and the grilled fish was flaky and moist. Staff were knowledgeable about allergens too.",
  "Best fine dining in KL, period. The 7-course degustation was a journey through Malaysian flavours I didn't know existed. The kerabu hearts of palm was my favourite. Book at least 2 weeks in advance.",
];

const REVIEWS_GOOD = [
  "Really solid meal. The char kuey teow had excellent wok hei and generous prawns. Iced cendol was refreshing. Prices are fair for the quality. Only downside is the wait during peak hours — came at 7pm and waited 20 minutes.",
  "Good food with consistent quality. The nasi goreng kampung was fragrant and well-seasoned. Sambal was the right level of spicy. Clean restaurant with friendly staff. Will definitely return.",
  "Tried the weekend brunch set — great value at RM45 per person. The eggs benedict with rendang was a creative twist. Coffee was decent too. Nice spot for a relaxed Saturday morning.",
  "Solid neighbourhood restaurant. The laksa was rich and creamy with fresh noodles. Satay was well-marinated and grilled to perfection. Parking is easy at the nearby lot. Good for family dinners.",
  "Enjoyed the lunch set menu. Nasi lemak was fragrant with crispy ikan bilis and perfectly fried egg. Sambal had a nice sweetness to it. RM12 is a steal. Quick service too.",
  "The roti canai here is one of the best in KL — crispy layers, served piping hot. Dhal was thick and flavourful. Teh tarik was frothy and not too sweet. Great for breakfast.",
];

const REVIEWS_AVERAGE = [
  "Decent food but nothing extraordinary. The mee goreng was a bit oily for my taste. Ambiance is nice though, and the staff were polite. Might try other dishes next time.",
  "Average experience. Food took 30 minutes to arrive which was too long. The curry was okay but lacked depth. Location is convenient near the LRT station though.",
  "It was fine. The fried rice was standard, nothing special. Portions could be bigger for the price. The place was clean and air-conditioned which is a plus.",
];

const REVIEWER_NAMES = [
  "AhmadFoodie", "SitiMakan", "KLFoodCritic", "TanSH_eats",
  "NadiaReviews", "RajeshKL", "FoodieJen", "MakanWithLee",
  "ZulHilmi_food", "PriyaEats", "DanielKLbites", "AisyahTaste",
  "KevinChowKL", "NurulMakan", "JasonFoodKL",
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export const ingestScrapedData = internalMutation(async (ctx) => {
  console.log("[scraper-seed] Starting ingestion of scraped KL restaurants...");

  const rand = seededRandom(20260214);

  for (const restaurant of SCRAPED_RESTAURANTS) {
    // Check if already exists
    const existing = await ctx.db
      .query("restaurants")
      .withIndex("by_name", (q) => q.eq("name", restaurant.name))
      .first();

    if (existing) {
      console.log(`[scraper-seed] "${restaurant.name}" already exists, skipping`);
      continue;
    }

    const restaurantId = await ctx.db.insert("restaurants", {
      name: restaurant.name,
      location: restaurant.location,
      cuisine: restaurant.cuisine,
      halalStatus: restaurant.halalStatus,
      priceRange: restaurant.priceRange,
      source: "scraper",
      createdAt: Date.now(),
    });

    // Generate 5-8 reviews per restaurant
    const reviewCount = 5 + Math.floor(rand() * 4);
    const usedReviewers = new Set<string>();

    for (let i = 0; i < reviewCount; i++) {
      // Pick a unique reviewer
      let reviewerName: string;
      do {
        reviewerName = REVIEWER_NAMES[Math.floor(rand() * REVIEWER_NAMES.length)];
      } while (usedReviewers.has(reviewerName) && usedReviewers.size < REVIEWER_NAMES.length);
      usedReviewers.add(reviewerName);

      // Generate rating around the average
      const baseRating = restaurant.avgRating;
      const variance = (rand() - 0.5) * 2;
      const rating = Math.max(1, Math.min(5, Math.round(baseRating + variance)));

      // Pick review text based on rating
      let reviewText: string;
      if (rating >= 5) {
        reviewText = REVIEWS_HIGH[Math.floor(rand() * REVIEWS_HIGH.length)];
      } else if (rating >= 4) {
        reviewText = REVIEWS_GOOD[Math.floor(rand() * REVIEWS_GOOD.length)];
      } else {
        reviewText = REVIEWS_AVERAGE[Math.floor(rand() * REVIEWS_AVERAGE.length)];
      }

      const reviewerId = await ctx.db.insert("reviewers", {
        name: reviewerName,
        totalReviews: 5 + Math.floor(rand() * 100),
        accountAge: 90 + Math.floor(rand() * 700),
        suspiciousScore: Math.floor(rand() * 20),
      });

      await ctx.db.insert("reviews", {
        restaurantId,
        rating,
        reviewText,
        reviewerId,
        source: "scraper",
        active: true,
        createdAt: Date.now() - Math.floor(rand() * 180 * 24 * 60 * 60 * 1000),
      });
    }

    // Compute trust score
    await ctx.scheduler.runAfter(0, internal.scoring.computeTrustScore, {
      restaurantId,
    });

    console.log(`[scraper-seed] Ingested "${restaurant.name}" with ${reviewCount} reviews`);
  }

  console.log(`[scraper-seed] Done. Ingested ${SCRAPED_RESTAURANTS.length} scraped restaurants.`);
});
