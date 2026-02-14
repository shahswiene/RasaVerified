import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // --- Auth ---
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),

  // --- Core data ---
  restaurants: defineTable({
    name: v.string(),
    location: v.string(),
    cuisine: v.string(),
    halalStatus: v.union(v.literal("halal"), v.literal("non-halal"), v.literal("unknown")),
    priceRange: v.union(v.literal("$"), v.literal("$$"), v.literal("$$$"), v.literal("$$$$")),
    imageUrl: v.optional(v.string()),
    source: v.union(v.literal("seed"), v.literal("scraper"), v.literal("community")),
    addedByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_halal", ["halalStatus"])
    .index("by_price", ["priceRange"])
    .index("by_cuisine", ["cuisine"])
    .searchIndex("search_name", { searchField: "name" }),

  reviews: defineTable({
    restaurantId: v.id("restaurants"),
    rating: v.number(),
    reviewText: v.string(),
    reviewerId: v.id("reviewers"),
    source: v.union(v.literal("seed"), v.literal("scraper"), v.literal("community")),
    addedByUserId: v.optional(v.id("users")),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_reviewer", ["reviewerId"])
    .index("by_restaurant_date", ["restaurantId", "createdAt"])
    .index("by_restaurant_active", ["restaurantId", "active"])
    .index("by_user_restaurant", ["addedByUserId", "restaurantId"])
    .index("by_user", ["addedByUserId"]),

  reviewers: defineTable({
    name: v.string(),
    totalReviews: v.number(),
    accountAge: v.number(),
    suspiciousScore: v.number(),
  }),

  trust_scores: defineTable({
    restaurantId: v.id("restaurants"),
    overallScore: v.number(),
    reviewerCredibility: v.number(),
    ratingStability: v.number(),
    languageAuthenticity: v.number(),
    burstScore: v.number(),
    reviewDiversity: v.number(),
    flags: v.array(v.string()),
    verdict: v.string(),
    updatedAt: v.number(),
  }).index("by_restaurant", ["restaurantId"]),
});
