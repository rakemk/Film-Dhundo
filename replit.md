# FilmDhundo

India ka OTT Guide — a full-stack movie discovery app that shows users where to watch Bollywood/Hollywood movies on Indian OTT platforms (Netflix, Prime, Hotstar, ZEE5, SonyLIV, MX Player).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/filmdhundo run dev` — run the frontend (port 20065, proxied at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `TMDB_API_KEY`, `YOUTUBE_API_KEY` (falls back to mock data), `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + TanStack Query + Tailwind CSS (shadcn/ui)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/filmdhundo/` — React+Vite frontend (6 pages)
- `artifacts/api-server/` — Express API server
- `artifacts/api-server/src/lib/tmdb.ts` — TMDB proxy with mock fallback
- `artifacts/api-server/src/routes/` — movies, watchlist, payment, admin routes
- `lib/db/src/schema/` — watchlist + users DB tables
- `lib/api-spec/` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/` — generated React Query hooks
- `lib/api-zod/` — generated Zod schemas

## Architecture decisions

- Contract-first: OpenAPI spec → Orval codegen → typed hooks + Zod schemas
- TMDB API keys are optional — all endpoints fall back to curated mock Bollywood movie data
- OTT platform assigned deterministically via `movieId % 6` (stable, no randomness per render)
- Watchlist free tier capped at 5 movies; premium users get unlimited (tracked in `users` table)
- Razorpay payment flow: create order → Razorpay checkout → verify signature → update DB

## Product

- Homepage: trending movies with OTT platform filter tabs + infinite scroll
- Search: debounced search (300ms) with autocomplete suggestions dropdown
- Movie detail: SEO-optimized page with JSON-LD schema, cast, trailer, social sharing (WhatsApp/Facebook/X), watchlist button, similar movies
- Watchlist: saved movies list with remove-on-hover, premium upsell banner
- Premium: 3-tier pricing (Free/₹49/₹399 annual) with Razorpay integration
- Admin: analytics dashboard — daily users, revenue, SEO pages, traffic sources, weekly chart, top SEO pages

## User preferences

- Brand color: #E24B4A (red), CSS var: `--primary: 1 75% 59%`
- Fonts: Inter (UI) + Noto Sans Devanagari (Hindi text)
- Mixed Hindi/English UI ("Hinglish") throughout
- Dark mode supported via `.dark` CSS class

## Gotchas

- Always run `pnpm run typecheck:libs` after changing `lib/db` schema before typechecking artifacts
- API server must be restarted after code changes (it builds on start)
- OTT platform tab filter works client-side on mock data (backend filter is per-page for TMDB)
- Do not run `pnpm dev` at workspace root — use workflows or `--filter` flags

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- OpenAPI spec: `lib/api-spec/openapi.yaml`
