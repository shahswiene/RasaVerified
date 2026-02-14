'use client';

import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { TrustScoreDashboard } from '@/components/trust-score-dashboard';
import { ReviewList } from '@/components/review-list';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Utensils, MessageSquare, BadgeCheck, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { AddReviewForm } from '@/components/add-review-form';
import type { Id } from '../../../../convex/_generated/dataModel';

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = params.id as Id<"restaurants">;

  const restaurant = useQuery(api.restaurants.getById, { id: restaurantId });
  const trustScore = useQuery(api.restaurants.getTrustScore, { restaurantId });
  const reviews = useQuery(api.restaurants.getReviews, { restaurantId });

  if (restaurant === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 mt-3 text-sm">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (restaurant === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-400 text-lg">Restaurant not found.</p>
          <Link href="/" className="text-emerald-400 hover:text-emerald-300 underline">
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 px-6 py-8 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/3 h-[25rem] w-[25rem] rounded-full bg-emerald-500/8 blur-[160px]" />
        <div className="absolute bottom-0 right-1/3 h-[20rem] w-[20rem] rounded-full bg-purple-500/8 blur-[140px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl space-y-8">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </Link>
        </motion.div>

        {/* Restaurant header */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-3xl font-bold sm:text-4xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {restaurant.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              {restaurant.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-emerald-400" />
              {restaurant.cuisine}
            </span>
            {reviews && (
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                {reviews.length} reviews
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {restaurant.halalStatus === "halal" && (
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border bg-emerald-500/15 border-emerald-500/40 text-emerald-300">
                <BadgeCheck className="w-3.5 h-3.5" />
                Halal Certified
              </span>
            )}
            {restaurant.halalStatus === "non-halal" && (
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border bg-orange-500/15 border-orange-500/40 text-orange-300">
                Non-Halal
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border bg-white/5 border-white/20 text-gray-300">
              <DollarSign className="w-3.5 h-3.5" />
              {restaurant.priceRange}
            </span>
          </div>
        </motion.section>

        {/* Two-column layout: Trust Score + Reviews */}
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Trust score dashboard (wider) */}
          <div className="lg:col-span-3 space-y-6">
            {trustScore ? (
              <TrustScoreDashboard trustScore={trustScore} />
            ) : trustScore === undefined ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 mt-2 text-sm">Calculating trust score...</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-center">
                <p className="text-gray-500">No trust score available yet.</p>
              </div>
            )}
          </div>

          {/* Reviews (narrower) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Add review form */}
            <AddReviewForm restaurantId={restaurantId} />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                Reviews
              </h2>
              {reviews === undefined ? (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <ReviewList reviews={reviews as Parameters<typeof ReviewList>[0]['reviews']} />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
