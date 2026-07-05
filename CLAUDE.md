# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint (no separate test suite)
```

No test suite is configured in this project.

## Architecture

**PulsePoll** is a Next.js 16 marketing landing page for a live polling platform. It is currently a static UI with no backend — all poll data is hardcoded and auth state is stubbed (`isSignedIn = false`).

### Page structure

The app has a single route (`app/page.tsx`) that renders `features/landing/landing-page.tsx`. The landing page is a scroll-driven experience implemented with `framer-motion`'s `useScroll`: the page container is `h-[380vh]` and two `position: fixed` sections (`HeroSection` and `FeedSection`) are layered with `z-index` and animated in/out based on `scrollYProgress`.

- **HeroSection** (`z-10`): visible from scroll 0–0.5, scales down and blurs out as the user scrolls.
- **FeedSection** (`z-20`): slides up from `translateY(100%)` as scroll reaches 0.5–0.76, then its content slowly scrolls upward from 0.74–1.

### Feature module: `features/landing/`

All landing page logic lives here:

- **`data.ts`** — single source of truth for all content: `FeaturedPoll`, `FeedItem`, `HeroPhrase`, `LiveVoteUser` types plus exported constant arrays. Adding/editing poll content means editing this file only.
- **`landing-page.tsx`** — client component that owns the scroll context and passes `scrollYProgress` down.
- **`components/hero-section.tsx`** — animated typewriter cycling through `heroPhrases`, with scroll-driven scale/blur/rotateX transform applied to the whole hero card. Renders `PollPreview` with the `featuredPoll`.
- **`components/feed-section.tsx`** — filterable poll grid using `feedCategories` to filter `feedPolls`. Renders multiple `PollPreview` instances with `variant="feed"`.
- **`components/poll-preview.tsx`** — shared poll card component with two variants (`"hero"` / `"feed"`). Dynamically samples image brightness via canvas to set overlay opacity. Unauthenticated vote attempts trigger an auth modal (results show as blurred with `??%`). The `isSignedIn` constant is hardcoded `false` — authentication is not yet wired up.
- **`components/live-votes-ticker.tsx`** — simulates live activity by showing animated toast notifications with flag images from `flagcdn.com`, driven by random intervals and a subtle Web Audio API tick sound.

### Styling

Tailwind CSS v4 (configured via `@tailwindcss/postcss`). Uses the `@import "tailwindcss"` and `@theme inline` v4 syntax in `globals.css`. CSS custom properties `--font-geist-sans` and `--font-geist-mono` are injected by `next/font/google` in the layout.
