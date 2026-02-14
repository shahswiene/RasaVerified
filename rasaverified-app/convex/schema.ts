import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  restaurants: defineTable({
    name: v.string(),
    location: v.string(),
    cuisine: v.string(),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .searchIndex("search_name", { searchField: "name" }),

  reviews: defineTable({
    restaurantId: v.id("restaurants"),
    rating: v.number(),
    reviewText: v.string(),
    reviewerId: v.id("reviewers"),
    createdAt: v.number(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_reviewer", ["reviewerId"])
    .index("by_restaurant_date", ["restaurantId", "createdAt"]),

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
