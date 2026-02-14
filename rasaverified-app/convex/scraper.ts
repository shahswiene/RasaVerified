import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Ingest a single scraped restaurant with its reviews
export const ingestRestaurant = internalMutation({
  args: {
    name: v.string(),
    location: v.string(),
    cuisine: v.string(),
    halalStatus: v.union(v.literal("halal"), v.literal("non-halal"), v.literal("unknown")),
    priceRange: v.union(v.literal("$"), v.literal("$$"), v.literal("$$$"), v.literal("$$$$")),
    reviews: v.array(
      v.object({
        reviewerName: v.string(),
        rating: v.number(),
        text: v.string(),
        totalReviews: v.number(),
        accountAgeDays: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    console.log(`[scraper] Ingesting restaurant: "${args.name}"`);

    // Check if restaurant already exists by name + location
    const existing = await ctx.db
      .query("restaurants")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing && existing.location.toLowerCase() === args.location.toLowerCase()) {
      console.log(`[scraper] Restaurant "${args.name}" already exists, skipping`);
      return existing._id;
    }

    // Insert restaurant
    const restaurantId = await ctx.db.insert("restaurants", {
      name: args.name,
      location: args.location,
      cuisine: args.cuisine,
      halalStatus: args.halalStatus,
      priceRange: args.priceRange,
      source: "scraper",
      createdAt: Date.now(),
    });

    // Insert reviews
    for (const review of args.reviews) {
      // Create or find reviewer
      const reviewerId = await ctx.db.insert("reviewers", {
        name: review.reviewerName,
        totalReviews: review.totalReviews,
        accountAge: review.accountAgeDays,
        suspiciousScore: review.totalReviews <= 1 ? 60 : review.totalReviews <= 3 ? 30 : 10,
      });

      await ctx.db.insert("reviews", {
        restaurantId,
        rating: review.rating,
        reviewText: review.text,
        reviewerId,
        source: "scraper",
        active: true,
        createdAt: Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000),
      });
    }

    // Trigger trust score computation
    await ctx.scheduler.runAfter(0, internal.scoring.computeTrustScore, {
      restaurantId,
    });

    console.log(
      `[scraper] Ingested "${args.name}" with ${args.reviews.length} reviews`,
    );
    return restaurantId;
  },
});
