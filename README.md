# 🍜 RasaVerified

**Live:** https://rasa-verified.vercel.app/

RasaVerified is a Kuala Lumpur–focused restaurant credibility engine. It aggregates real Google Maps reviews, runs heuristic trust scoring in Convex, and surfaces only the reviews worth reading. This repo hosts the Next.js 13 App Router frontend, Convex backend, and scraping/seed scripts used to repopulate production data.

---

## 📚 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Repo Layout](#-repo-layout)
4. [Environment Variables](#-environment-variables)
5. [Getting Started](#-getting-started)
6. [Data Seeding & Scraped Reviews](#-data-seeding--scraped-reviews)
7. [Deployment (Convex + Vercel)](#-deployment-convex--vercel)
8. [Monitoring & Troubleshooting](#-monitoring--troubleshooting)

---

## ✨ Features

- **Heuristic trust scoring** combining reviewer history, rating variance, burst detection, and text heuristics to flag suspicious activity.
- **Rich restaurant profiles** with trust score card, filterable review list, reviewer credibility badges, and location/cuisine metadata.
- **Scraped Google Maps dataset** (20 KL restaurants × ≥10 reviews each) stored in Convex via `scraperSeed.ts`.
- **Community submissions** with rate limiting and reviewer profile reuse handled in Convex mutations.
- **Responsive Next.js UI** with Tailwind, Framer Motion animations, and glassmorphism styling.

---

## 🧰 Tech Stack

| Layer        | Technology |
|--------------|------------|
| Frontend     | Next.js 13 App Router, TypeScript, TailwindCSS, Framer Motion |
| Backend      | Convex (database + functions + scheduler) |
| Scraping     | Playwright MCP (manual session used to gather Google Maps data) |
| Deployment   | Vercel (frontend), Convex Cloud (backend) |

---

## 🗂 Repo Layout

```
├── rasaverified-app/
│   ├── src/app/            # App Router pages (home, restaurant detail, profile)
│   ├── src/components/     # Search filters, review list, trust score UI, etc.
│   ├── convex/             # Convex schema, queries, mutations, seeds
│   │   ├── schema.ts
│   │   ├── restaurants.ts
│   │   ├── community.ts
│   │   ├── seed.ts         # Base seed data (8 restaurants, 14 reviewers)
│   │   └── scraperSeed.ts  # 20 scraped KL restaurants, 10–15 reviews each
│   └── package.json
├── README.md               # (this file)
└── RasaVerified_README.md  # Hackathon narrative (legacy)
```

---

## 🔐 Environment Variables

Create `.env.local` for development and mirror the same keys in Vercel **Production** settings.

| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment client URL (`https://<deployment>.convex.cloud`). |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Convex site URL (`https://<deployment>.convex.site`). |
| `CONVEX_DEPLOYMENT` | Deployment slug (e.g., `prod:dynamic-llama-507`). |
| `CONVEX_DEPLOYMENT_URL` | Same as client URL, used by Convex CLI scripts. |
| `CONVEX_DEPLOY_KEY` | Deploy key for the target deployment (never commit; add to CI/Vercel secrets only if builds run Convex CLI). |
| _Any other service keys_ | e.g., analytics, auth. Keep parity between `.env.local` and Vercel env settings. |

> **Tip:** Use separate Convex deployments for dev vs. prod to avoid polluting production data with test reviews.

---

## 🛠 Getting Started

1. **Install dependencies**
   ```bash
   cd rasaverified-app
   npm install
   ```

2. **Authenticate Convex CLI** (first time only)
   ```bash
   npx convex login
   ```

3. **Run Convex + Next.js together**
   ```bash
   npx convex dev --cmd "next dev"
   ```
   The CLI syncs schema/functions to your configured `CONVEX_DEPLOYMENT` and proxies the Convex URL for the frontend.

4. **Open the app** at http://localhost:3000.

---

## 📦 Data Seeding & Scraped Reviews

All seed scripts live in `rasaverified-app/convex` and execute through Convex CLI.

### 1. Base Seed
Populates the original curated restaurants and reviewers.
```bash
npx convex run seed:seedAll
```

### 2. Scraped KL Restaurants
`scraperSeed.ts` contains 20 restaurants (UpperDeck KL, Poblano KL, Dining In The Dark KL, etc.) each with 10–15 real reviews captured from Google Maps.
```bash
npx convex run scraperSeed:ingestScrapedData
```
The mutation is idempotent—rerunning it skips restaurants that already exist via the `by_name` index.

### 3. Clearing Data (if needed)
Use the Convex dashboard to truncate `restaurants`, `reviews`, `reviewers`, and `trust_scores` tables before reseeding.

---

## 🚀 Deployment (Convex + Vercel)

1. **Convex production deploy**
   ```bash
   # Ensure env vars point to prod deployment
   set CONVEX_DEPLOYMENT=prod:dynamic-llama-507
   set CONVEX_DEPLOY_KEY=prod:dynamic-llama-507|<key>
   npx convex deploy
   ```

2. **Vercel project settings**
   - **Framework Preset:** Next.js
   - **Root Directory:** `rasaverified-app`
   - Leave build/output/install commands empty to use defaults (`npm install`, `npm run build`, output `.next`).
   - Add the environment variables listed above (production values).

3. **Trigger deploy**
   - Push to `main` or use the Deploy button in Vercel. Vercel builds the Next.js app against the prod Convex URL.

4. **Post-deploy checks**
   - Visit https://rasa-verified.vercel.app/ and verify restaurants/reviews load.
   - Use Convex dashboard to confirm new reviews appear when submitting via the UI.

---

## 🧭 Monitoring & Troubleshooting

- **Convex Logs:** `npx convex logs` or dashboard → Deployments → Functions. Seed scripts emit `[scraper-seed]` prefixed logs.
- **Rate Limits:** Community submissions enforce a 3-hour cooldown per restaurant; dev logs are emitted in `community.ts`.
- **Data drift:** If production data becomes inconsistent, clear affected tables via dashboard, rerun both seed scripts, and trigger a fresh Vercel deploy.

---

## 🙌 Credits

Built solo for the Krackathon challenge. Scraped data gathered manually via Playwright MCP sessions against Google Maps (Kuala Lumpur focus).
