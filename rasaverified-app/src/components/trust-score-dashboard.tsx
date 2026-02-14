'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, TrendingUp } from 'lucide-react';
import type { Doc } from '../../convex/_generated/dataModel';

interface TrustScoreDashboardProps {
  trustScore: Doc<"trust_scores">;
}

function getVerdictConfig(verdict: string) {
  switch (verdict) {
    case "Highly Authentic":
      return {
        icon: ShieldCheck,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        ringColor: 'stroke-emerald-500',
        glowColor: 'shadow-emerald-500/20',
      };
    case "Mixed Credibility":
      return {
        icon: ShieldAlert,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        ringColor: 'stroke-amber-500',
        glowColor: 'shadow-amber-500/20',
      };
    default:
      return {
        icon: ShieldX,
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/30',
        ringColor: 'stroke-red-500',
        glowColor: 'shadow-red-500/20',
      };
  }
}

function ScoreRing({ score, size = 160, strokeWidth = 10, className = '' }: {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const config = getVerdictConfig(
    score >= 75 ? "Highly Authentic" : score >= 45 ? "Mixed Credibility" : "High Manipulation Risk"
  );

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={config.ringColor}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`text-4xl font-bold ${config.color}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-gray-400 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function SubScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const getBarColor = (s: number) => {
    if (s >= 75) return 'bg-emerald-500';
    if (s >= 45) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-medium">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getBarColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function TrustScoreDashboard({ trustScore }: TrustScoreDashboardProps) {
  const config = getVerdictConfig(trustScore.verdict);
  const VerdictIcon = config.icon;

  const subScores = [
    { label: 'Reviewer Credibility', score: trustScore.reviewerCredibility, weight: '30%' },
    { label: 'Rating Stability', score: trustScore.ratingStability, weight: '25%' },
    { label: 'Language Authenticity', score: trustScore.languageAuthenticity, weight: '20%' },
    { label: 'Burst Pattern', score: trustScore.burstScore, weight: '15%' },
    { label: 'Review Diversity', score: trustScore.reviewDiversity, weight: '10%' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl border ${config.bg} backdrop-blur-md p-6 shadow-lg ${config.glowColor}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-5 h-5 text-gray-400" />
        <h2 className="text-xl font-semibold text-white">Trust Score Analysis</h2>
      </div>

      {/* Overall score ring + verdict */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        <ScoreRing score={trustScore.overallScore} />
        <div className="text-center sm:text-left">
          <div className={`flex items-center gap-2 ${config.color}`}>
            <VerdictIcon className="w-6 h-6" />
            <span className="text-2xl font-bold">{trustScore.verdict}</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Based on {subScores.length} credibility dimensions
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Last updated: {new Date(trustScore.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Sub-score breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Score Breakdown
        </h3>
        {subScores.map((sub, i) => (
          <div key={sub.label} className="flex items-center gap-3">
            <div className="flex-1">
              <SubScoreBar label={sub.label} score={sub.score} delay={i * 0.15} />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{sub.weight}</span>
          </div>
        ))}
      </div>

      {/* Flags */}
      {trustScore.flags.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Suspicion Flags
          </h3>
          <ul className="space-y-1.5">
            {trustScore.flags.map((flag, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-start gap-2 text-sm text-amber-300/80"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {flag}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
