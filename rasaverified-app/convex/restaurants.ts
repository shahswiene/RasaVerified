import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    halalStatus: v.optional(v.union(v.literal("halal"), v.literal("non-halal"), v.literal("unknown"))),
    priceRange: v.optional(v.union(v.literal("$"), v.literal("$$"), v.literal("$$$"), v.literal("$$$$"))),
    cuisine: v.optional(v.string()),
  },
  handler: async ({ db }, filters) => {
    let restaurants = await db.query("restaurants").collect();

    if (filters.halalStatus) {
      restaurants = restaurants.filter((r) => r.halalStatus === filters.halalStatus);
    }
    if (filters.priceRange) {
      restaurants = restaurants.filter((r) => r.priceRange === filters.priceRange);
    }
    if (filters.cuisine) {
      restaurants = restaurants.filter((r) => r.cuisine.toLowerCase() === filters.cuisine!.toLowerCase());
    }

    console.log(`[convex] restaurants.list returned ${restaurants.length} rows (filters: halal=${filters.halalStatus ?? "any"}, price=${filters.priceRange ?? "any"}, cuisine=${filters.cuisine ?? "any"})`);
    return restaurants;
  },
});

export const search = query({
  args: {
    term: v.string(),
    halalStatus: v.optional(v.union(v.literal("halal"), v.literal("non-halal"), v.literal("unknown"))),
    priceRange: v.optional(v.union(v.literal("$"), v.literal("$$"), v.literal("$$$"), v.literal("$$$$"))),
    cuisine: v.optional(v.string()),
  },
  handler: async ({ db }, { term, ...filters }) => {
    if (!term.trim()) {
      let restaurants = await db.query("restaurants").collect();
      if (filters.halalStatus) {
        restaurants = restaurants.filter((r) => r.halalStatus === filters.halalStatus);
      }
      if (filters.priceRange) {
        restaurants = restaurants.filter((r) => r.priceRange === filters.priceRange);
      }
      if (filters.cuisine) {
        restaurants = restaurants.filter((r) => r.cuisine.toLowerCase() === filters.cuisine!.toLowerCase());
      }
      return restaurants;
    }

    let results = await db
      .query("restaurants")
      .withSearchIndex("search_name", (q) => q.search("name", term))
      .collect();

    if (filters.halalStatus) {
      results = results.filter((r) => r.halalStatus === filters.halalStatus);
    }
    if (filters.priceRange) {
      results = results.filter((r) => r.priceRange === filters.priceRange);
    }
    if (filters.cuisine) {
      results = results.filter((r) => r.cuisine.toLowerCase() === filters.cuisine!.toLowerCase());
    }

    console.log(
      `[convex] restaurants.search term="${term}" returned ${results.length} rows`,
    );
    return results;
  },
});

// Get distinct cuisines for filter dropdown
export const getCuisines = query(async ({ db }) => {
  const restaurants = await db.query("restaurants").collect();
  const cuisines = [...new Set(restaurants.map((r) => r.cuisine))].sort();
  return cuisines;
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
