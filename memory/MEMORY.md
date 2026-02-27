# GRIVA Project Memory

## Project Overview
Full-stack Next.js 16 developer knowledge platform with App Router, TypeScript, React 19, Tailwind CSS 4, Supabase (auth + DB), Ollama (local AI/RAG), Framer Motion.

## Key Architecture
- `src/app/(auth)/` — login/signup pages
- `src/app/(dashboard)/` — all protected pages (community, roadmaps, news, research, models, assistant, profile, settings)
- `src/app/api/` — REST routes: /api/ai/chat, /api/ai/recommendations, /api/metrics, /api/ingest, /api/cron
- `src/lib/actions/` — all Supabase server actions
- `src/lib/supabase/` — client.ts (browser), server.ts (server), middleware.ts (session)
- `src/lib/ai/` — ollama.ts, rag.ts, recommendations.ts
- `src/components/ui/` — button, card, input, badge, skeleton
- `src/components/community/` — post-card, like-button, comment-thread, create-post-form, create-community-dialog
- `src/hooks/` — use-auth.ts, use-realtime.ts
- `src/providers/` — theme-provider.tsx, auth-provider.tsx

## Errors Fixed (Feb 2026)
1. **use-realtime.ts** — Moved `handlersRef.current = handlers` inside a `useEffect` (was a render-time ref update, ESLint error `react-hooks/refs`)
2. **dashboard/page.tsx** — Inlined `fetchMetrics` async function inside `useEffect` instead of `useCallback`, removed `useCallback` import (ESLint error `react-hooks/set-state-in-effect`)
3. **community/page.tsx** — Removed unused `Radio` import and `liveCount` state + `setLiveCount` call
4. **roadmaps/[id]/page.tsx** — Removed unused `useRouter` import and `const router = useRouter()` declaration
5. **roadmaps/page.tsx** — Removed unused `useRouter` import
6. **settings/profile/page.tsx** — Removed unused `Badge` import

## Known Deprecations (not errors)
- `Github`, `Linkedin`, `Twitter` icons from `lucide-react` are deprecated (brand icons removed in v1.0). Still functional. Replacement requires `simple-icons` package.

## Background Job Architecture (Feb 2026)
- `src/instrumentation.ts` — Next.js startup hook; uses `node-cron` to schedule workers every 5 min; also runs all workers immediately on boot
- `src/lib/workers.ts` — single source of truth for all workers: `runNewsWorker`, `runPapersWorker`, `runModelsWorker`, `runMetricsWorker`, `runAllWorkers`
- Workers use `createClient` from `@supabase/supabase-js` directly (not SSR client — no request context)
- News: 8 RSS feeds (Google AI, OpenAI, TechCrunch AI, MIT Tech Review, HuggingFace, VentureBeat AI, The Verge AI, Wired AI)
- Models: HuggingFace API — top-50 trending + top-20 per 8 pipeline tags; deduped via Map; upsert updates download counts
- Papers: 5 arXiv feeds with `ignoreDuplicates: true` (immutable after pub)
- Frontend pages have 5-min silent poll fallback (only active when no search/filter)

## UI Theme (Feb 2026 redesign)
- Theme: Dark black/navy with cyan neon accents (`hsl(186 100% 50%)` = `#00d4ff`)
- Fonts (unchanged): Space Grotesk (sans) + Spectral (serif)
- ShaderAnimation: WebGL Three.js shader at `src/components/ui/shader-lines.tsx` — used as bg on hero + auth pages
- New CSS utilities in globals.css: `.text-neon`, `.cyber-grid`, `.cyber-border`, `.neon-icon`, `.neon-dot`, `.neon-line`, `.scanlines`, `.shader-fade-bottom/top`
- Landing: Hero has shader fullscreen bg; Features uses cyber-grid; CTA uses low-opacity shader
- Auth layout (`src/app/(auth)/layout.tsx`): ShaderAnimation at 55% opacity with dark overlay layers

## TypeScript & Lint Status
- `npx tsc --noEmit` → PASS (no errors)
- `npm run lint` → PASS (0 errors, 0 warnings)
