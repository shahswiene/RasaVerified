'use client';

import { useState, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SearchBar } from '@/components/search-bar';
import { SearchFilters } from '@/components/search-filters';
import { RestaurantCard } from '@/components/restaurant-card';
import { ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Doc, Id } from '../../convex/_generated/dataModel';

type HalalFilter = "halal" | "non-halal" | "unknown" | undefined;
type PriceFilter = "$" | "$$" | "$$$" | "$$$$" | undefined;

const highlights = [
  {
    label: "Trust Analysis",
    value: "5 Metrics",
    description: "Multi-dimensional credibility scoring",
    icon: ShieldCheck,
  },
  {
    label: "Realtime",
    value: "<2s",
    description: "Fresh trust-score recompute",
    icon: Zap,
  },
  {
    label: "Stack",
    value: "Next + Convex",
    description: "Streaming PWA + serverless scoring",
    icon: Sparkles,
  },
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [halalFilter, setHalalFilter] = useState<HalalFilter>(undefined);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>(undefined);
  const [cuisineFilter, setCuisineFilter] = useState<string | undefined>(undefined);

  const filterArgs = {
    ...(halalFilter ? { halalStatus: halalFilter } : {}),
    ...(priceFilter ? { priceRange: priceFilter } : {}),
    ...(cuisineFilter ? { cuisine: cuisineFilter } : {}),
  };

  const listResults = useQuery(
    api.restaurants.list,
    !searchTerm.trim() ? filterArgs : "skip",
  );
  const searchResults = useQuery(
    api.restaurants.search,
    searchTerm.trim() ? { term: searchTerm, ...filterArgs } : "skip",
  );
  const restaurants = searchTerm.trim() ? searchResults : listResults;

  const cuisines = useQuery(api.restaurants.getCuisines);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[ui] Search term: "${term}"`);
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 px-6 py-12 text-white">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 h-[30rem] w-[30rem] rounded-full bg-emerald-500/10 blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 h-[25rem] w-[25rem] rounded-full bg-purple-500/10 blur-[160px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl space-y-12">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            RasaVerified • Credibility Engine
          </div>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
            Verify Before You Bite
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Heuristic-based credibility scoring to separate genuine restaurant reviews from sponsored noise and bot spam.
          </p>
        </motion.section>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto"
        >
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 text-center"
              >
                <Icon className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-xs text-gray-400 mt-1">{item.description}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="space-y-4"
        >
          <SearchBar onSearch={handleSearch} placeholder="Search KL restaurants..." />
          <SearchFilters
            halalFilter={halalFilter}
            priceFilter={priceFilter}
            cuisineFilter={cuisineFilter}
            cuisines={cuisines ?? []}
            onHalalChange={setHalalFilter}
            onPriceChange={setPriceFilter}
            onCuisineChange={setCuisineFilter}
          />
        </motion.div>

        {/* Restaurant grid */}
        <section>
          {restaurants === undefined ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 mt-3 text-sm">Loading restaurants...</p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">No restaurants found. Try different filters or search term.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant, i) => (
                <RestaurantCardWithScore
                  key={restaurant._id}
                  restaurant={restaurant}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Sub-component to fetch trust score per restaurant
function RestaurantCardWithScore({ restaurant, index }: {
  restaurant: Doc<"restaurants">;
  index: number;
}) {
  const trustScore = useQuery(api.restaurants.getTrustScore, {
    restaurantId: restaurant._id as Id<"restaurants">,
  });

  return (
    <RestaurantCard
      restaurant={restaurant}
      trustScore={trustScore}
      index={index}
    />
  );
}
