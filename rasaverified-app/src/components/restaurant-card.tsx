'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Utensils } from 'lucide-react';
import type { Doc } from '../../convex/_generated/dataModel';

interface RestaurantCardProps {
  restaurant: Doc<"restaurants">;
  trustScore?: Doc<"trust_scores"> | null;
  index: number;
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 45) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-emerald-500/20 border-emerald-500/30';
  if (score >= 45) return 'bg-amber-500/20 border-amber-500/30';
  return 'bg-red-500/20 border-red-500/30';
}

function getScoreRing(score: number): string {
  if (score >= 75) return 'ring-emerald-500/40';
  if (score >= 45) return 'ring-amber-500/40';
  return 'ring-red-500/40';
}

export function RestaurantCard({ restaurant, trustScore, index }: RestaurantCardProps) {
  const score = trustScore?.overallScore ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/restaurant/${restaurant._id}`}>
        <div className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
          {/* Trust score badge */}
          {score !== null && (
            <div
              className={`absolute -top-3 -right-3 w-14 h-14 rounded-full flex items-center justify-center border ${getScoreBg(score)} ring-2 ${getScoreRing(score)} backdrop-blur-sm`}
            >
              <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
            </div>
          )}

          {/* Restaurant info */}
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors pr-12">
            {restaurant.name}
          </h3>

          <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {restaurant.location}
            </span>
            <span className="flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5" />
              {restaurant.cuisine}
            </span>
          </div>

          {/* Verdict tag */}
          {trustScore?.verdict && (
            <div className="mt-3">
              <span
                className={`inline-block text-xs px-2.5 py-1 rounded-full border ${getScoreBg(score ?? 0)} ${getScoreColor(score ?? 0)}`}
              >
                {trustScore.verdict}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
