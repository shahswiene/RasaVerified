# 🍜 RasaVerified

### AI-Powered Restaurant Review Credibility Engine

> "Don't read more reviews. Read reviews you can trust."

------------------------------------------------------------------------

## 🧠 Problem Statement

Malaysia has a rich food culture. But discovering genuinely good food is
becoming harder.

Consumers rely on platforms like: - Facebook\
- Instagram\
- TikTok\
- Google Reviews\
- Yelp\
- Blogs\
- Michelin Guide

However, reviews today are often: - Fake reviews\
- Sponsored influencer reviews\
- Paid reviews\
- Bot-generated reviews\
- Coordinated review bursts

This creates review manipulation and consumer distrust.

Users struggle to answer a simple question:

> "Is this restaurant actually good?"

------------------------------------------------------------------------

## 💡 Solution --- RasaVerified

RasaVerified is a Review Credibility Engine that analyzes restaurant
reviews and generates:

-   ✅ Trust Score (0--100)
-   ⚠ Suspicion Indicators
-   📊 Rating Stability Index
-   🔎 Review Authenticity Breakdown

Instead of showing more reviews, we show which reviews are credible.

------------------------------------------------------------------------

## 🎯 Core Features (Hackathon Scope)

### 1️⃣ Restaurant Search

-   Search by restaurant name
-   Fetch review dataset (prototype dataset / mock input)

### 2️⃣ Credibility Engine

Analyzes reviews using heuristic scoring: - Review burst detection -
Repetitive phrase detection - Reviewer credibility check - Generic
adjective overuse detection - Suspicious rating distribution spikes -
Short 5⭐ pattern detection

### 3️⃣ Trust Score Dashboard

-   Overall Trust Score
-   Suspicion flags
-   Timeline anomaly chart
-   Verdict system:
    -   "Highly Authentic"
    -   "Mixed Credibility"
    -   "High Manipulation Risk"

### 4️⃣ Modern 3D UI Experience

-   3D Trust Sphere visualization (Three.js)
-   Suspicion heat ring animations
-   Interactive credibility layers
-   Dynamic motion transitions

------------------------------------------------------------------------

## 🏗 Architecture Overview

### 🔷 Frontend

-   Next.js (App Router)
-   TailwindCSS
-   Three.js (3D visualization)
-   Framer Motion
-   PWA support
-   Mobile and desktop responsive

### 🔷 Backend

-   Next.js Server Actions / API Routes
-   Convex (Realtime Backend + Database)
-   Modular scoring engine

------------------------------------------------------------------------

## 🧱 Repository Layout & App Stack

-   `/rasaverified-app` — Next.js 16 App Router (TypeScript + Tailwind 4)
    -   `/src/app/page.tsx` — Home page: hero, search bar, restaurant grid with live trust badges
    -   `/src/app/restaurant/[id]/page.tsx` — Detail page: 3D Trust Sphere, score dashboard, review list
    -   `/src/components/`
        -   `search-bar.tsx` — Real-time restaurant search input
        -   `restaurant-card.tsx` — Animated card with trust score badge & verdict tag
        -   `trust-score-dashboard.tsx` — Animated ring gauge, 5-dimension breakdown, suspicion flags
        -   `trust-sphere.tsx` — Three.js 3D sphere (colour/distortion reflects score)
        -   `review-list.tsx` — Review cards with star ratings & reviewer credibility badges
        -   `convex-client-provider.tsx` — ConvexProvider wrapper for the app
    -   `/src/lib/convexClient.ts` — Singleton `ConvexReactClient`
    -   `/convex/`
        -   `schema.ts` — Tables: restaurants, reviews, reviewers, trust_scores
        -   `restaurants.ts` — Queries: list, search (full-text), getById, getReviews, getTrustScore
        -   `scoring.ts` — Heuristic credibility engine (5 weighted sub-scores → verdict)
        -   `seed.ts` — Mock data: 8 Malaysian restaurants, 14 reviewer profiles, varied credibility
    -   `/public/manifest.json` — PWA manifest
    -   `package.json` scripts:
        -   `npm run dev` → Next.js dev server
        -   `npm run convex:dev` → `convex dev --run-sh "next dev"` (sync Convex + Next)
        -   `npm run convex:deploy` → push Convex code before Vercel release
-   Root folder keeps hackathon docs, env templates, and project-level `.gitignore`.

------------------------------------------------------------------------

## 🗄 Database Plan (Convex)

### restaurants

{ \_id, name, location, cuisine, imageUrl?, createdAt }

### reviews

{ \_id, restaurantId, rating, reviewText, reviewerId, createdAt }

### reviewers

{ \_id, name, totalReviews, accountAge, suspiciousScore }

### trust\_scores

{ restaurantId, overallScore, reviewerCredibility, ratingStability,
languageAuthenticity, burstScore, reviewDiversity, flags[], verdict, updatedAt }

------------------------------------------------------------------------

## 🧮 Scoring Logic (Heuristic Model)

Trust Score =

(0.30 × Reviewer Credibility) + (0.25 × Rating Stability) + (0.20 ×
Language Authenticity) + (0.15 × Burst Pattern Analysis) + (0.10 ×
Review Diversity)

### Suspicion Flags Triggered When:

-   40% reviews in 24-hour window

-   60% identical phrase similarity

-   70% 5-star spike in short time

-   Reviewer with only 1 review

-   Extremely short generic reviews

------------------------------------------------------------------------

## ⚡ PWA Architecture

RasaVerified is built as a Progressive Web App:

-   Installable on mobile
-   Offline caching of analysis results
-   Lightweight bundle
-   Fast first contentful paint
-   Lazy-loaded 3D components
-   Edge deployment ready

Performance Goals: - Lighthouse 90+ - \< 2s load time - Optimized asset
delivery

------------------------------------------------------------------------

## 🎨 UI Philosophy

Modern, motion-first UI: - Not static - Animated transitions -
Glassmorphism panels - Dark mode default - Floating 3D credibility orb -
Dynamic scoring animations

3D Visualization Concept: - Sphere size = Trust Score - Red pulses =
Suspicion activity - Green glow = Authentic signals - Rotating timeline
activity band

------------------------------------------------------------------------

## 🚀 Deployment Plan

-   Vercel (Frontend + Edge Functions)
-   Convex Cloud Backend
-   Production URL submission
-   AI tool usage disclosure

------------------------------------------------------------------------

## 🏆 Hackathon Category Alignment

### Best Practical Use

Solves real issue of fake and paid reviews.

### Best Architecture & Performance

-   Modular scoring engine
-   Clean separation of concerns
-   Realtime backend
-   PWA optimized

### Moonshot

Foundation for: - Browser extension - Review verification API -
Restaurant transparency layer - Regional consumer protection tool

### Overall Best

Balanced in: - Innovation - Real-world usefulness - Technical
execution - Visual experience

------------------------------------------------------------------------

## 🔮 Future Vision

-   Live scraping integrations
-   AI NLP credibility classifier
-   Reviewer network graph analysis
-   Public transparency API
-   Community verification badges
-   Regulatory integration

------------------------------------------------------------------------

## 🧑‍💻 Built Solo

Developed as a solo hackathon project within 11 hours under
execution-first philosophy.

AI-assisted development tools disclosed as required.

------------------------------------------------------------------------

## 🏁 Final Statement

Food culture deserves authenticity.

RasaVerified doesn't replace reviews.

It restores trust.

------------------------------------------------------------------------

## 🔌 Convex Environment Setup

### Development workflow

1. Install dependencies once: `npm install convex convex-devtools` (keeps CLI + local dashboard bundled with the app).
2. Authenticate the CLI if you haven't already: `npx convex login` and select the **RasaVerified** project.
3. Create `.env.local` with the key you generated:

    ```bash
    # .env.local
    # HTTP Actions URL
    NEXT_PUBLIC_CONVEX_URL="https://<RasaVerified-Convex-Development>.site"
    CONVEX_DEPLOY_KEY="<RasaVerified-Convex-Development key>"
    ```

    - `NEXT_PUBLIC_CONVEX_URL` is used by the Next.js frontend and should point to the Convex dev deployment URL shown in the dashboard.
    - `CONVEX_DEPLOY_KEY` is read by scripts when running migrations or pushing schema changes.
4. Run the dev stack (Convex + Next.js) with hot reload: `npx convex dev --cmd "next dev"`. This automatically syncs schema + functions to the dev deployment and proxies the Convex URL.
5. Optional: open Convex devtools in another terminal via `npx convex devtools` to inspect data mutations while developing features.

### Production prep & Vercel integration

1. Store secrets (never commit them):
    - `CONVEX_DEPLOY_KEY` → Vercel **Environment Variables → Production** (value = `RasaVerified-Convex-Production`).
    - `NEXT_PUBLIC_CONVEX_URL` → Convex production deployment URL (available after the first `npx convex deploy`).
2. Keep a `.env.production` locally for dry runs:

    ```bash
    # HTTP Actions URL
    NEXT_PUBLIC_CONVEX_URL="https://<RasaVerified-Convex-Production>.site"
    CONVEX_DEPLOY_KEY="<RasaVerified-Convex-Production key>"
    ```

3. Deploy Convex backend before each Vercel release:
    ```bash
    npx convex deploy --env production
    ```

    - This publishes the latest schema/functions and returns the production Convex URL; update the Vercel env variable if it changes.
4. Hook Vercel→Convex deploy key:
    - In Vercel, add a build step (`npm run convex-deploy`) that runs `convex deploy` only on production builds (guards with `$VERCEL_ENV === "production"`).
    - Ensure `CONVEX_DEPLOY_KEY` is available during build.
5. After Convex deploy succeeds, trigger the usual `next build && next start` (handled automatically by Vercel). The frontend will consume the correct Convex URL via env vars.
6. For rollbacks, re-run `npx convex deploy --env production --deploy-key $CONVEX_DEPLOY_KEY --branch <git-sha>` then redeploy Vercel with the matching commit.

> Keep dev and prod data separated: never reuse keys across environments and avoid seeding prod with mock data. Use Convex dashboard roles to restrict destructive actions.
