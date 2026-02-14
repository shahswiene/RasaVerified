'use client';

import { X } from 'lucide-react';

type HalalFilter = "halal" | "non-halal" | "unknown" | undefined;
type PriceFilter = "$" | "$$" | "$$$" | "$$$$" | undefined;

interface SearchFiltersProps {
  halalFilter: HalalFilter;
  priceFilter: PriceFilter;
  cuisineFilter: string | undefined;
  cuisines: string[];
  onHalalChange: (value: HalalFilter) => void;
  onPriceChange: (value: PriceFilter) => void;
  onCuisineChange: (value: string | undefined) => void;
}

const HALAL_OPTIONS: { label: string; value: HalalFilter }[] = [
  { label: "All", value: undefined },
  { label: "Halal", value: "halal" },
  { label: "Non-Halal", value: "non-halal" },
];

const PRICE_OPTIONS: { label: string; value: PriceFilter }[] = [
  { label: "All", value: undefined },
  { label: "$", value: "$" },
  { label: "$$", value: "$$" },
  { label: "$$$", value: "$$$" },
  { label: "$$$$", value: "$$$$" },
];

export function SearchFilters({
  halalFilter,
  priceFilter,
  cuisineFilter,
  cuisines,
  onHalalChange,
  onPriceChange,
  onCuisineChange,
}: SearchFiltersProps) {
  const hasActiveFilters = halalFilter || priceFilter || cuisineFilter;

  const clearAll = () => {
    onHalalChange(undefined);
    onPriceChange(undefined);
    onCuisineChange(undefined);
  };

  const selectClass =
    'bg-white/5 border border-white/10 text-sm text-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500/50 cursor-pointer min-w-[140px]';

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
      {/* Halal dropdown */}
      <div className="flex flex-col items-center text-xs text-gray-400 gap-1.5">
        <span className="text-center">Halal</span>
        <select
          value={halalFilter ?? ''}
          onChange={(e) =>
            onHalalChange(e.target.value ? (e.target.value as HalalFilter) : undefined)
          }
          className={selectClass}
        >
          <option value="" className="bg-gray-900 text-gray-200">All</option>
          {HALAL_OPTIONS.filter((opt) => opt.value).map((opt) => (
            <option key={opt.label} value={opt.value} className="bg-gray-900 text-gray-200">{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Price dropdown */}
      <div className="flex flex-col items-center text-xs text-gray-400 gap-1.5">
        <span className="text-center">Price</span>
        <select
          value={priceFilter ?? ''}
          onChange={(e) =>
            onPriceChange(e.target.value ? (e.target.value as PriceFilter) : undefined)
          }
          className={selectClass}
        >
          <option value="" className="bg-gray-900 text-gray-200">All</option>
          {PRICE_OPTIONS.filter((opt) => opt.value).map((opt) => (
            <option key={opt.label} value={opt.value} className="bg-gray-900 text-gray-200">{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Cuisine dropdown */}
      {cuisines.length > 0 && (
        <div className="flex flex-col items-center text-xs text-gray-400 gap-1.5">
          <span className="text-center">Cuisine</span>
          <select
            value={cuisineFilter ?? ''}
            onChange={(e) => onCuisineChange(e.target.value || undefined)}
            className={selectClass}
          >
            <option value="" className="bg-gray-900 text-gray-200">All</option>
            {cuisines.map((c) => (
              <option key={c} value={c} className="bg-gray-900 text-gray-200">{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 px-3 py-2 text-xs rounded-full border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}
