'use client';

import { motion } from 'framer-motion';
import { Star, User, AlertCircle, CheckCircle } from 'lucide-react';

interface ReviewerInfo {
  _id: string;
  name: string;
  totalReviews: number;
  accountAge: number;
  suspiciousScore: number;
}

interface ReviewWithReviewer {
  _id: string;
  rating: number;
  reviewText: string;
  createdAt: number;
  reviewer: ReviewerInfo | null;
}

interface ReviewListProps {
  reviews: ReviewWithReviewer[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-600'
          }`}
        />
      ))}
    </div>
  );
}

function ReviewerBadge({ reviewer }: { reviewer: ReviewerInfo | null }) {
  if (!reviewer) return null;

  const isSuspicious = reviewer.suspiciousScore >= 50;
  const isNew = reviewer.totalReviews <= 2;

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1 text-gray-400">
        <User className="w-3 h-3" />
        <span>{reviewer.name}</span>
      </div>
      <span className="text-gray-600">·</span>
      <span className="text-gray-500">{reviewer.totalReviews} reviews</span>
      {isSuspicious && (
        <span className="flex items-center gap-0.5 text-red-400">
          <AlertCircle className="w-3 h-3" />
          Suspicious
        </span>
      )}
      {!isSuspicious && !isNew && (
        <span className="flex items-center gap-0.5 text-emerald-400">
          <CheckCircle className="w-3 h-3" />
          Verified
        </span>
      )}
    </div>
  );
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No reviews yet for this restaurant.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, i) => (
        <motion.div
          key={review._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <StarRating rating={review.rating} />
            <span className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            {review.reviewText}
          </p>

          <ReviewerBadge reviewer={review.reviewer} />
        </motion.div>
      ))}
    </div>
  );
}
