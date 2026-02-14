'use client';

import { useState } from 'react';
import { Star, Send, LogIn } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '@/context/auth-context';
import { AuthModal } from '@/components/auth-modal';
import type { Id } from '../../convex/_generated/dataModel';

interface AddReviewFormProps {
  restaurantId: Id<"restaurants">;
}

export function AddReviewForm({ restaurantId }: AddReviewFormProps) {
  const { user } = useAuth();
  const addReview = useMutation(api.community.addReview);

  const [showAuth, setShowAuth] = useState(false);
  const [rating, setRating] = useState(4);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await addReview({
        userId: user.userId,
        restaurantId,
        rating,
        reviewText: reviewText.trim(),
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[ui] Review added successfully');
      }

      setReviewText('');
      setRating(4);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add review';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 text-center">
          <p className="text-gray-400 text-sm mb-3">Sign in to leave a review</p>
          <button
            onClick={() => setShowAuth(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </div>
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
      <h3 className="text-sm font-medium text-white mb-3">Write a Review</h3>

      {error && (
        <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          Review added! If you had a previous review, it was replaced.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Star rating */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
              />
            </button>
          ))}
        </div>

        {/* Review text */}
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          required
          minLength={20}
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none"
          placeholder="Share your honest experience (min 20 chars)..."
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
