'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Star } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '@/context/auth-context';

interface AddRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type HalalStatus = "halal" | "non-halal" | "unknown";
type PriceRange = "$" | "$$" | "$$$" | "$$$$";

const CUISINE_OPTIONS = [
  "Malay", "Chinese", "Indian", "Japanese", "Korean",
  "Western", "Thai", "Mixed", "Mamak", "Seafood",
];

export function AddRestaurantModal({ isOpen, onClose }: AddRestaurantModalProps) {
  const { user } = useAuth();
  const addRestaurant = useMutation(api.community.addRestaurant);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [halalStatus, setHalalStatus] = useState<HalalStatus>('unknown');
  const [priceRange, setPriceRange] = useState<PriceRange>('$$');
  const [rating, setRating] = useState(4);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await addRestaurant({
        userId: user.userId,
        name: name.trim(),
        location: location.trim(),
        cuisine,
        halalStatus,
        priceRange,
        rating,
        reviewText: reviewText.trim(),
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[ui] Restaurant added successfully');
      }

      // Reset form and close
      resetForm();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add restaurant';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setLocation('');
    setCuisine('');
    setHalalStatus('unknown');
    setPriceRange('$$');
    setRating(4);
    setReviewText('');
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 overflow-y-auto py-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900/95 backdrop-blur-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Add Restaurant
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Restaurant name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Restaurant Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  placeholder="e.g. Nasi Kandar Line Clear"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Location (KL area)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  placeholder="e.g. Bukit Bintang, Bangsar, KLCC"
                />
              </div>

              {/* Cuisine + Halal + Price row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Cuisine</label>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    <option value="" className="bg-gray-900">Select</option>
                    {CUISINE_OPTIONS.map((c) => (
                      <option key={c} value={c} className="bg-gray-900">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Halal</label>
                  <select
                    value={halalStatus}
                    onChange={(e) => setHalalStatus(e.target.value as HalalStatus)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    <option value="halal" className="bg-gray-900">Halal</option>
                    <option value="non-halal" className="bg-gray-900">Non-Halal</option>
                    <option value="unknown" className="bg-gray-900">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Price</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value as PriceRange)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    <option value="$" className="bg-gray-900">$ Budget</option>
                    <option value="$$" className="bg-gray-900">$$ Mid</option>
                    <option value="$$$" className="bg-gray-900">$$$ High</option>
                    <option value="$$$$" className="bg-gray-900">$$$$ Premium</option>
                  </select>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-sm text-gray-400 mb-3">Your review (required when adding a restaurant)</p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review text */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                  minLength={20}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                  placeholder="Share your honest experience (min 20 characters)..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Restaurant & Review'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
