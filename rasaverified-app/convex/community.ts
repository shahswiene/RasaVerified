import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Add a new restaurant (logged-in users only) with an initial review
export const addRestaurant = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    location: v.string(),
    cuisine: v.string(),
    halalStatus: v.union(v.literal("halal"), v.literal("non-halal"), v.literal("unknown")),
    priceRange: v.union(v.literal("$"), v.literal("$$"), v.literal("$$$"), v.literal("$$$$")),
    // Initial review from the submitter
    rating: v.number(),
    reviewText: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`[community] addRestaurant by user=${args.userId} name="${args.name}"`);

    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Check for duplicate restaurant name in same location
    const existing = await ctx.db
      .query("restaurants")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing && existing.location.toLowerCase() === args.location.toLowerCase()) {
      throw new Error("Restaurant already exists in this location. Use 'Add Review' instead.");
    }

    // Create restaurant
    const restaurantId = await ctx.db.insert("restaurants", {
      name: args.name,
      location: args.location,
      cuisine: args.cuisine,
      halalStatus: args.halalStatus,
      priceRange: args.priceRange,
      source: "community",
      addedByUserId: args.userId,
      createdAt: Date.now(),
    });

    // Find or create a community reviewer profile for this user
    // Check if user already has reviews (and thus a reviewer profile)
    const userReviews = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("addedByUserId", args.userId))
      .first();

    let reviewerId;
    if (userReviews) {
      // Reuse existing reviewer profile
      reviewerId = userReviews.reviewerId;
      const reviewer = await ctx.db.get(reviewerId);
      if (reviewer) {
        console.log(`[community] Reusing reviewer profile: id=${reviewerId}, current totalReviews=${reviewer.totalReviews}`);
        await ctx.db.patch(reviewerId, {
          totalReviews: reviewer.totalReviews + 1,
          accountAge: Math.floor((Date.now() - user.createdAt) / (24 * 60 * 60 * 1000)),
        });
        console.log(`[community] Updated totalReviews to ${reviewer.totalReviews + 1}`);
      }
    } else {
      // Create new reviewer profile for first-time reviewer
      console.log(`[community] Creating new reviewer profile for user=${args.userId}`);
      reviewerId = await ctx.db.insert("reviewers", {
        name: user.name,
        totalReviews: 1,
        accountAge: Math.floor((Date.now() - user.createdAt) / (24 * 60 * 60 * 1000)),
        suspiciousScore: 10,
      });
      console.log(`[community] Created reviewer profile: id=${reviewerId}`);
    }

    // Insert the initial review
    await ctx.db.insert("reviews", {
      restaurantId,
      rating: args.rating,
      reviewText: args.reviewText,
      reviewerId,
      source: "community",
      addedByUserId: args.userId,
      active: true,
      createdAt: Date.now(),
    });

    // Trigger trust score computation
    await ctx.scheduler.runAfter(0, internal.scoring.computeTrustScore, {
      restaurantId,
    });

    console.log(`[community] Restaurant created: id=${restaurantId}`);
    return restaurantId;
  },
});

// Add a review to an existing restaurant (logged-in users only)
// If user already has a review for this restaurant, deactivate the old one
export const addReview = mutation({
  args: {
    userId: v.id("users"),
    restaurantId: v.id("restaurants"),
    rating: v.number(),
    reviewText: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(
      `[community] addReview by user=${args.userId} restaurant=${args.restaurantId}`,
    );

    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Verify restaurant exists
    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    // Check for existing review by this user on this restaurant
    const existingReviews = await ctx.db
      .query("reviews")
      .withIndex("by_user_restaurant", (q) =>
        q.eq("addedByUserId", args.userId).eq("restaurantId", args.restaurantId),
      )
      .collect();

    // Rate limiting: check if user has reviewed this restaurant in the last 3 hours
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
    const now = Date.now();
    const recentReview = existingReviews.find(
      (r) => now - r.createdAt < THREE_HOURS_MS
    );
    if (recentReview) {
      const waitTimeMs = THREE_HOURS_MS - (now - recentReview.createdAt);
      const waitHours = Math.ceil(waitTimeMs / (60 * 60 * 1000));
      const waitMinutes = Math.ceil(waitTimeMs / (60 * 1000));
      const waitMsg = waitHours >= 1 
        ? `${waitHours} hour${waitHours > 1 ? 's' : ''}`
        : `${waitMinutes} minute${waitMinutes > 1 ? 's' : ''}`;
      throw new Error(`You can only review this restaurant once every 3 hours. Please wait ${waitMsg}.`);
    }

    // Deactivate all previous reviews by this user for this restaurant
    for (const oldReview of existingReviews) {
      if (oldReview.active) {
        await ctx.db.patch(oldReview._id, { active: false });
        console.log(
          `[community] Deactivated old review: id=${oldReview._id} for restaurant=${args.restaurantId}`,
        );
      }
    }

    // Find or create reviewer profile for this user
    // Look for ANY review by this user to get their reviewer profile
    const anyUserReview = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("addedByUserId", args.userId))
      .first();

    let reviewerId;
    if (anyUserReview) {
      // Reuse existing reviewer profile from any previous review
      reviewerId = anyUserReview.reviewerId;
      const reviewer = await ctx.db.get(reviewerId);
      if (reviewer) {
        console.log(`[community] Reusing reviewer profile: id=${reviewerId}, current totalReviews=${reviewer.totalReviews}`);
        await ctx.db.patch(reviewerId, {
          totalReviews: reviewer.totalReviews + 1,
          accountAge: Math.floor((Date.now() - user.createdAt) / (24 * 60 * 60 * 1000)),
        });
        console.log(`[community] Updated totalReviews to ${reviewer.totalReviews + 1}`);
      }
    } else {
      // Create new reviewer profile for first-time reviewer
      console.log(`[community] Creating new reviewer profile for user=${args.userId}`);
      reviewerId = await ctx.db.insert("reviewers", {
        name: user.name,
        totalReviews: 1,
        accountAge: Math.floor((Date.now() - user.createdAt) / (24 * 60 * 60 * 1000)),
        suspiciousScore: 10,
      });
      console.log(`[community] Created reviewer profile: id=${reviewerId}`);
    }

    // Insert the new review
    const reviewId = await ctx.db.insert("reviews", {
      restaurantId: args.restaurantId,
      rating: args.rating,
      reviewText: args.reviewText,
      reviewerId,
      source: "community",
      addedByUserId: args.userId,
      active: true,
      createdAt: Date.now(),
    });

    // Recompute trust score
    await ctx.scheduler.runAfter(0, internal.scoring.computeTrustScore, {
      restaurantId: args.restaurantId,
    });

    console.log(`[community] Review created: id=${reviewId}`);
    return reviewId;
  },
});
