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

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Halal filter */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-1">Halal:</span>
        {HALAL_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onHalalChange(opt.value)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
              halalFilter === opt.value
                ? opt.value === "halal"
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                  : opt.value === "non-halal"
                    ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                    : "bg-white/10 border-white/30 text-white"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Price filter */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-1">Price:</span>
        {PRICE_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onPriceChange(opt.value)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
              priceFilter === opt.value
                ? "bg-white/10 border-white/30 text-white"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Cuisine filter */}
      {cuisines.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Cuisine:</span>
          <select
            value={cuisineFilter ?? ""}
            onChange={(e) => onCuisineChange(e.target.value || undefined)}
            className="bg-white/5 border border-white/10 text-sm text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
          >
            <option value="" className="bg-gray-900">All</option>
            {cuisines.map((c) => (
              <option key={c} value={c} className="bg-gray-900">{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}
