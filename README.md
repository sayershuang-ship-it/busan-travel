# Busan Travel Guide

Interactive travel-planning site for a 釜山三日自由行 (Busan, Korea — 3 days, 2026/10/31–11/2), built with Astro and deployed as a static site to Cloudflare Pages.

Trip data (dates, budget, daily activities, locations) lives in one file — `src/data/itinerary.js` — and drives every page.

## Pages

- `/` — trip overview: dates, budget summary, day list
- `/day1` – `/day4` — daily itinerary detail (shared `Day.astro` layout)
- `/map` — all locations + daily routes on Google Maps (Directions API)
- `/planner` — drag-to-reorder itinerary editor with live budget recalculation
- `/planb` — contingency plans (rain/heat/delay alternates) for activities that have one
- `/expenses` — expense tracker with CSV export
- `/tickets` — pre-trip booking checklist (persisted in browser storage)
- `/weather` — live forecast via Open-Meteo
- `/calendar` — export itinerary to Google/Apple Calendar (.ics)
- `/import` — paste booking confirmation emails to auto-parse flights/hotels/tickets
- `/new` — wizard to start a new trip (destination, dates, day count)

The site also ships a service worker (`public/sw.js`) and web app manifest for basic PWA/offline support.

## Tech Stack

- **Framework**: Astro 5 (static output)
- **Styling**: plain CSS (`src/styles/global.css`)
- **Data**: single JS module (`src/data/itinerary.js`), no CMS/database
- **Maps**: Google Maps JavaScript API + Directions API (`PUBLIC_GOOGLE_MAPS_API_KEY`)
- **Weather**: Open-Meteo (no key required)
- **Deployment**: Cloudflare Pages via GitHub Actions (`.github/workflows/deploy.yml`)

## Setup

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
npm run preview
```

### Environment Variables

Create `.env` locally:

```
PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

This is the only variable actually read by the code (`astro.config.mjs`, `src/pages/map.astro`). `.env.example` lists additional variables that are aspirational/unused — treat it as a rough template, not a contract.

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`:
`npm install` → `astro build` (with `PUBLIC_GOOGLE_MAPS_API_KEY` injected) → `wrangler pages deploy dist`.

Live site: https://busan-travel.pages.dev

Cloudflare/CI setup notes and past gotchas are recorded in `HANDOFF.md`.

## Repo Layout

```
src/
├── data/itinerary.js   # all trip content (single source of truth)
├── layouts/            # Base.astro, Day.astro
├── pages/               # one file per route (see Pages above)
└── styles/global.css
public/                  # static assets, manifest, service worker
docs/                    # design notes and past planning docs
.agent/                  # portable agent memory/skills layer (agentic-stack)
```

## Agent Tooling

This repo includes an `.agent/` directory (agentic-stack portable memory/skills layer) and `AGENTS.md`/`.claude/` config for AI coding assistants. Not required to run or deploy the site.
