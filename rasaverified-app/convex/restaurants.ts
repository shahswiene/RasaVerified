import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query(async ({ db }) => {
  const restaurants = await db.query("restaurants").collect();
  console.log(`[convex] restaurants.list returned ${restaurants.length} rows`);
  return restaurants;
});

export const search = query({
  args: { term: v.string() },
  handler: async ({ db }, { term }) => {
    if (!term.trim()) {
      return await db.query("restaurants").collect();
    }

    const results = await db
      .query("restaurants")
      .withSearchIndex("search_name", (q) => q.search("name", term))
      .collect();

    console.log(
      `[convex] restaurants.search term="${term}" returned ${results.length} rows`,
    );
    return results;
  },
});

export const getById = query({
  args: { id: v.id("restaurants") },
  handler: async ({ db }, { id }) => {
    const restaurant = await db.get(id);
    console.log(`[convex] restaurants.getById id=${id} found=${!!restaurant}`);
    return restaurant;
  },
});

export const getReviews = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async ({ db }, { restaurantId }) => {
    const reviews = await db
      .query("reviews")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect();

    // Attach reviewer info to each review
    const enriched = await Promise.all(
      reviews.map(async (review) => {
        const reviewer = await db.get(review.reviewerId);
        return { ...review, reviewer };
      }),
    );

    console.log(
      `[convex] restaurants.getReviews restaurantId=${restaurantId} returned ${enriched.length} rows`,
    );
    return enriched;
  },
});

export const getTrustScore = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async ({ db }, { restaurantId }) => {
    const score = await db
      .query("trust_scores")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .first();

    console.log(
      `[convex] restaurants.getTrustScore restaurantId=${restaurantId} score=${score?.overallScore ?? "none"}`,
    );
    return score;
  },
});
