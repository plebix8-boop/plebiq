# Plebiq Frontend Performance Audit

Date: 2026-07-18

## Implementation status

Implemented on 2026-07-18:

- centralized, dynamically loaded landing-page share modal;
- deferred share SVG/logo work until first explicit open;
- removed unused poll-image canvas brightness analysis;
- hero visibility, page visibility, card viewport, and mobile-breakpoint activity controls;
- paused hero typing, live ticker timers, LIVE pulses, concealed-result motion, and shimmer when inactive;
- global reduced-motion configuration for Framer Motion and CSS animation/transition fallbacks;
- compositor-friendly transform/opacity shimmer and LIVE pulse behavior;
- lazy decoding/loading for below-fold poll images;
- `content-visibility` and intrinsic-size containment for feed cards and chart-heavy admin content;
- compositor isolation for large static decorative blur layers;
- landing vote-state failure fallback so skeletons cannot remain active indefinitely;
- memoized generated poll-detail trend data;
- production TypeScript/lint/build verification.

The production profiling procedure in section 10 remains the ongoing regression check because CPU percentages must be measured on representative devices rather than inferred from source code.

## Scope and constraints

This is a static code audit of the landing page, authentication screens, shared UI, and admin panel. It evaluates the ten previously proposed performance improvements against the current repository.

The required constraint is: **preserve the existing visual design and interaction design**. The recommendations below should not remove UI elements, change colors, simplify layouts, or make visible animations disappear for users who allow motion. They focus on doing the same visual work only when it is visible or needed.

This report does not claim measured CPU percentages. A production profiling pass is required after implementation to quantify the improvement. Development-mode CPU usage is not a reliable production benchmark.

## Executive summary

The concern about CPU usage is reasonable. The largest opportunities are not small CSS tweaks; they are avoidable work that happens while UI is closed, hidden, or offscreen.

| Priority | Finding | Expected benefit | Visual impact |
| --- | --- | --- | --- |
| P0 | Every `PollPreview` initializes a closed share modal and builds its large SVG preview | Very high on landing pages with several polls | None |
| P0 | Every poll image performs canvas brightness analysis although the consuming overlay is commented out | High during initial feed/image loading | None |
| P0 | Hero typing, live ticker timers, and poll animations continue while the fixed hero is covered by the feed | High after scrolling away from the hero | None while hero is hidden |
| P1 | Infinite poll animations continue on offscreen feed cards | High as poll count grows | None when cards are offscreen |
| P1 | The project does not implement `prefers-reduced-motion` handling | Medium; large accessibility benefit | Only reduced-motion users see reduced animation |
| P1 | Feed images use raw `<img>` elements without lazy-loading hints | Medium to high network/decode benefit | None |
| P1 | All live polls and all poll cards are loaded/rendered together | Increasing benefit as the database grows | None with content visibility; minimal with progressive loading |
| P2 | Large blur and backdrop-filter surfaces are used broadly | Medium, device-dependent GPU benefit | None if decorative layers are pre-rendered/cached accurately |
| P2 | Admin chart code and chart rendering are loaded eagerly on chart-heavy screens | Medium on admin routes | None |
| P2 | No repeatable production performance budget or profiling checklist exists | Prevents regression rather than directly reducing CPU | None |

## 1. Pause animations when elements leave the viewport

### Audit result: violated

The project has continuous animations that remain mounted without checking whether their section is visible.

Primary locations:

- `features/landing/components/poll-preview.tsx:200-220`
  - Three repeating Framer Motion animations run for every LIVE badge.
- `features/landing/components/poll-preview.tsx:399-402`
  - The concealed-results progress indicator repeats forever for an unvoted poll.
- `features/landing/components/hero-section.tsx:57-106`
  - The typing/deleting loop continuously schedules timers and React state updates.
- `features/landing/components/live-votes-ticker.tsx:17-47`
  - The ticker continues scheduling new items for the life of the hero component.
- `features/auth/components/auth-split-layout.tsx:67`
  - The showcase LIVE indicator uses an infinite ping animation.
- `app/globals.css:980-993`
  - `.animate-shimmer` is an infinite CSS animation wherever the class remains mounted.

The landing architecture makes this more significant:

- `features/landing/components/hero-section.tsx:207` renders the hero as `position: fixed`.
- `features/landing/landing-page.tsx:148-162` leaves the hero mounted and places the feed above it with a higher stacking order.
- Therefore, scrolling into the feed visually covers the hero but does not stop its typing timers, live ticker, desktop poll preview animations, or cursor pulse.
- CSS such as `hidden lg:flex` hides elements visually but does not prevent React effects and timers inside already-mounted components from running.

### Same-UI fix

1. Add a visibility signal for the hero using `IntersectionObserver` on the hero/spacer boundary or a small sentinel.
2. Pass `isActive` to `HeroSection`, `LiveVotesTicker`, and the hero `PollPreview`.
3. When inactive:
   - clear the typing timer;
   - clear the live-vote ticker timer;
   - disable repeating Framer Motion targets;
   - apply `animation-play-state: paused` to CSS pulse/ping animations.
4. Add an observer to each feed poll card with a small root margin such as `200px`, so its animations start just before it enters view and pause after it leaves.
5. Preserve current animation state rather than resetting it. When the user scrolls back, animation can continue naturally.
6. Also pause nonessential work when `document.visibilityState === "hidden"` so background tabs become idle.

### Acceptance criteria

- After scrolling fully into the feed, the hero typing text stops producing React commits.
- No live-vote ticker timers fire while the hero is covered.
- Offscreen poll cards have no active animation frames.
- Returning to the hero/card shows the same design and resumes motion without a visible jump.

## 2. Respect `prefers-reduced-motion`

### Audit result: violated

No use of `prefers-reduced-motion`, Framer Motion's `useReducedMotion`, or Tailwind `motion-reduce`/`motion-safe` variants was found.

Affected locations include:

- `features/landing/components/hero-section.tsx`
- `features/landing/components/poll-preview.tsx`
- `features/landing/components/live-votes-ticker.tsx`
- `features/landing/components/user-avatar-menu.tsx`
- `features/landing/components/share-results-modal.tsx`
- `features/auth/components/auth-split-layout.tsx`
- `components/page-transition.tsx`
- `app/error.tsx` and `app/not-found.tsx`
- Loading shimmer in `app/globals.css`

### Same-UI fix

1. Create one shared reduced-motion hook or use Framer Motion's `useReducedMotion` in animation-heavy client components.
2. For normal users, leave all animation timing and appearance unchanged.
3. For reduced-motion users:
   - show a complete hero phrase rather than typing/deleting it;
   - keep the cursor visible but static;
   - replace repeated LIVE badge pulse/ring motion with the same final styled badge;
   - show live-vote notifications with opacity only or no transition;
   - render progress concealment as a static gradient at the same dimensions;
   - remove scale/y travel from modals while retaining opacity and the same final layout;
   - stop shimmer and use its middle visual frame as a static skeleton.
4. Add a global safety rule for CSS animations and transitions under `@media (prefers-reduced-motion: reduce)`, but do not rely only on CSS because the JavaScript timer loops must also stop.

### Acceptance criteria

- The default experience looks identical to today.
- With reduced motion enabled at OS/browser level, there are no repeating timers or infinite visual animations.
- All loading, status, and modal information remains understandable without motion.

## 3. Stop the hero typing animation when the hero is no longer visible

### Audit result: violated and high priority

This is the most direct continuous React CPU source.

Evidence:

- `features/landing/components/hero-section.tsx:57-106` updates `displayText`, `phase`, and `phraseIndex` repeatedly using chained `setTimeout` callbacks.
- Every typed or deleted character causes `HeroSection` to render again.
- `renderText()` at `features/landing/components/hero-section.tsx:151-199` reparses the displayed string and creates separate spans for characters on each render.
- The hero remains mounted underneath the feed.

### Same-UI fix

1. Gate the typing effect with the hero visibility state described in point 1.
2. If inactive, immediately return from the effect after clearing the current timeout.
3. Preserve `charIndexRef`, `phase`, and `phraseIndex`; do not reset the animation while hidden.
4. Pause on `visibilitychange` when the browser tab is hidden.
5. Optionally memoize the rendered character spans for the current `displayText` and phrase. This is secondary; stopping hidden updates provides the larger gain.
6. Keep all current durations, text, highlighting, cursor styling, and layout measurements unchanged when visible.

### Acceptance criteria

- React Profiler records no `HeroSection` commits after the hero is outside the visible region.
- The timer is cleared on scroll-away, tab hide, and unmount.
- Scrolling back resumes at the previous phrase/character.

## 4. Replace continuously animated shadows and blur effects with compositor-friendly animation

### Audit result: violated in the landing poll UI

The visual design uses attractive glow and pulse effects, but some repeating effects animate paint-heavy properties rather than only compositor-friendly `transform` and `opacity`.

Primary locations:

- `features/landing/components/poll-preview.tsx:200-220`
  - The outer LIVE badge animates a `boxShadow` array forever.
  - Two inner spans also repeat opacity/scale animations.
- `features/landing/components/poll-preview.tsx:399-402`
  - The concealed-results indicator translates forever. Its transform is relatively efficient, but every mounted card still owns an active animation.
- `features/landing/components/hero-section.tsx:249`
  - The cursor pulses forever.
- `features/auth/components/auth-split-layout.tsx:67`
  - The LIVE ring uses `animate-ping`, which is generally transform/opacity based and is preferable to animated box shadow.
- `app/globals.css:980-993`
  - Shimmer animates `background-position`, which usually requires repeated painting.

### Same-UI fix

1. Keep the same LIVE pulse appearance, but make its glow a static shadow.
2. Move the expanding ring to a pseudo-element or child that animates only `transform: scale(...)` and `opacity`.
3. Do not animate `box-shadow`, `filter`, or large blurred layers frame by frame.
4. For shimmer, use a translated pseudo-element gradient so the browser can animate `transform` rather than repainting background position across the entire skeleton.
5. Combine this with viewport gating: compositor-friendly infinite animations still consume resources if dozens run offscreen.
6. Preserve the existing colors, glow radius, timing, badge dimensions, progress-bar dimensions, and visual rhythm.

### Acceptance criteria

- The LIVE badge and shimmer look the same in side-by-side recordings.
- DevTools paint flashing shows no repeated repaint of the entire badge/card for the pulse.
- Animation frames are driven by transform/opacity and stop when offscreen.

## 5. Reduce the cost of large blur and backdrop effects

### Audit result: partially violated

Static blurred elements do not necessarily consume continuous CPU once composited, but large blur regions and full-screen backdrop filters can be expensive to paint and composite, especially on integrated/mobile GPUs.

Large decorative blurs appear in:

- `features/landing/components/hero-section.tsx:211-212`
- `features/auth/components/auth-split-layout.tsx:33-35`
- `app/admin/layout.tsx:35-36`
- `app/page.tsx:101-102` empty state
- `app/loading.tsx`, `app/error.tsx`, and `app/not-found.tsx`

Backdrop filters appear in:

- `features/landing/components/share-results-modal.tsx:543` (`backdrop-blur-xl` over the viewport)
- `features/landing/components/hero-section.tsx:332-343` (16px modal backdrop filter)
- `features/landing/components/poll-preview.tsx:450`
- `features/feedback/components/feedback-button.tsx:83`
- Many admin cards and modals, including dashboard charts/cards and management dialogs

### Same-UI fix

1. Do not remove the blur design.
2. For the large decorative background blobs, generate a small static AVIF/WebP background that matches the existing gradients and blur exactly. The browser can composite one decoded bitmap instead of repeatedly rasterizing large CSS filters.
3. Alternatively, place the decorative blobs on one isolated pseudo-element with `contain: paint` and no animation, rather than multiple large filtered DOM layers.
4. Keep full-screen backdrop blur mounted only while its modal is open. This is already true for most modals; the share-modal initialization issue in point 7 must also be fixed.
5. Avoid nesting backdrop-filter elements. Audit each modal/card hierarchy so only the visually necessary layer owns the backdrop blur.
6. Do not add permanent `will-change`; it can increase memory. If needed, apply it only during a short entry/exit transition.
7. Test the replacement with screenshot comparison in both themes to guarantee no design drift.

### Acceptance criteria

- Pixel/screenshot comparison shows the same decorative appearance.
- Opening a full-screen modal does not trigger repeated large paint events after its entry animation settles.
- GPU memory and paint time improve on a mobile-throttled profile.

## 6. Disable shimmer once loading completes

### Audit result: mostly compliant, with one continuous non-loading animation

Good behavior:

- `features/admin/components/dashboard/admin-dashboard-client.tsx:214-275` renders shimmer only while `loading` is true and removes it after success or error.
- `features/landing/components/poll-preview.tsx:298-330` renders vote-state skeleton shimmer only while authentication/vote state resolves.

Remaining concern:

- `features/landing/components/poll-preview.tsx:399-402` shows a forever-moving gradient for every unvoted poll after loading. It is a results-concealment visual, not a loading indicator, but it has the same continuous animation cost.
- Any request that remains unresolved longer than expected keeps skeleton animations running. There is no user-visible timeout/fallback around landing vote-state resolution.

### Same-UI fix

1. Keep loading shimmer behavior and appearance unchanged while the component is visible and loading.
2. Pause shimmer whenever its component is offscreen or the tab is hidden.
3. Pause all shimmer under reduced-motion mode.
4. For the concealed-results bar, retain the exact moving gradient only while that poll card is visible. Freeze it at a representative frame offscreen.
5. Add an explicit resolved/error state for landing vote data so a failed request cannot leave skeletons running indefinitely.

### Acceptance criteria

- No `.animate-shimmer` element exists after its data request resolves or fails.
- Concealed-result animations run only for visible cards.
- Skeleton dimensions and visual design remain unchanged.

## 7. Mount the share modal only when needed

### Audit result: strongly violated and P0 priority

This is currently the largest avoidable initialization cost on the landing page.

Evidence:

- Every `PollPreview` renders a `ShareResultsModal` at `features/landing/components/poll-preview.tsx:543-548`, even when `showShareModal` is false.
- `ShareResultsModal` calculates the full share image with `buildShareImage()` through `useMemo` at `features/landing/components/share-results-modal.tsx:376-380` before the `isOpen` conditional in the portal output.
- It URI-encodes the full SVG at `features/landing/components/share-results-modal.tsx:381`.
- It begins loading and converting the logo to a data URL in the effect at `features/landing/components/share-results-modal.tsx:386-404`, even when the modal has never been opened.
- `isOpen` is checked only inside the returned `AnimatePresence` at `features/landing/components/share-results-modal.tsx:539-541`.
- Because the landing feed renders every poll, it creates one expensive share-modal instance per poll plus the hero instance. The featured poll can also appear in both hero and feed.

### Same-UI fix

Preferred architecture:

1. Move share-modal ownership to `LandingPage` and render exactly one `ShareResultsModal`.
2. Store the selected poll and percentages when any card triggers “Share results.”
3. Dynamically import the share modal so its Framer Motion, social icon, SVG-builder, and canvas-related code are not in the initial landing interaction path.
4. Build the SVG preview only after the modal opens.
5. Load/encode the logo only after first open, then retain the existing per-theme promise cache.
6. Keep the current modal markup, dimensions, animations, platform layout, generated image, and actions unchanged.

Lower-impact alternative:

- Conditionally mount the modal from each `PollPreview` only after that card is opened. This removes initial cost but can eventually leave multiple initialized instances and makes exit-animation ownership harder. The single centralized modal is preferable.

### Acceptance criteria

- Initial landing render creates zero share SVG strings and performs zero share-logo fetches.
- Exactly one share modal exists in the React tree when opened.
- The modal preview is visually identical and all share/download actions produce the same output.

## 8. Avoid unnecessary canvas brightness analysis

### Audit result: strongly violated and P0 priority

Evidence:

- `features/landing/components/poll-preview.tsx:70-105` creates a canvas, draws each loaded poll image, reads 400 pixels with `getImageData`, calculates brightness, and updates React state.
- `overlayStrength` is stored at `features/landing/components/poll-preview.tsx:43`.
- The JSX that uses `overlayStrength` is commented out at approximately `features/landing/components/poll-preview.tsx:173-198`.
- Therefore the canvas read and state update currently have no visible effect.
- The work is repeated for every `PollPreview`, including duplicate featured poll instances.

### Same-UI fix

1. Remove the brightness-analysis effect and `overlayStrength` state while its consuming overlay remains commented out.
2. This is a guaranteed no-design-change optimization because the computed value is not rendered.
3. If adaptive overlays return later, calculate brightness once when media is ingested or cache it by image URL outside the card component. Do not repeat a synchronous pixel read per mounted card.
4. Keep the canvas export in `share-results-modal.tsx:323-353`; that work is user-triggered by Share/Download and is appropriate. It should not run at idle.

### Acceptance criteria

- Loading feed images creates no canvases and no pixel readbacks.
- Poll card screenshots are identical before and after removal.
- Share/download PNG export continues to work.

### Additional image-loading finding related to feed/card initialization

### Audit result: violated on most content images

The project uses `next/image` for `ThemeLogo`, but most poll/banner images use raw `<img>` elements.

Primary locations:

- `features/landing/components/poll-preview.tsx:168`
- `features/landing/components/live-votes-ticker.tsx:73`
- `features/auth/components/auth-split-layout.tsx:59`
- `features/admin/components/admin-poll-browser.tsx:128`
- `features/admin/components/management/poll-card.tsx:18`
- `features/admin/components/poll-detail/poll-detail-view.tsx:214`
- `features/landing/components/share-results-modal.tsx:682` (generated data URL preview)

The landing server fetch at `app/page.tsx:71-92` returns every live poll, and the feed renders every poll image. No `loading="lazy"` or `decoding="async"` hints were found on the feed images.

### Same-UI fix

1. Keep the hero/above-the-fold image eager and high priority.
2. Use `next/image` for remote poll imagery with `fill`, the same `object-cover` classes, explicit `sizes`, and configured allowed remote sources.
3. If migration to `next/image` is deferred, immediately add `loading="lazy"` and `decoding="async"` to below-the-fold feed/admin images.
4. Keep intrinsic/aspect-ratio dimensions so lazy loading cannot cause layout shift.
5. Keep the generated share preview as a normal `<img>` because it is a data URL and appears only in the open modal after point 6 is implemented.
6. Flag icons in the live ticker should be pre-sized/cached; do not preload every possible country flag.

### Acceptance criteria

- Initial landing requests include only above-the-fold images plus a small browser preload margin.
- Poll image crop, dimensions, and quality remain visually equivalent.
- Cumulative Layout Shift does not increase.

## 9. Lazy-render poll cards lower in the feed

### Audit result: violated and grows with content volume

Evidence:

- `app/page.tsx:71-92` selects all live polls and all options with no result limit or pagination.
- `features/landing/components/feed-section.tsx:150-154` maps all visible-category polls into `PollPreview` components.
- Category `All` is the default, so all live polls mount initially.
- `features/landing/landing-page.tsx:58-70` builds an all-polls list.
- `features/landing/landing-page.tsx:73-119` fetches vote state and option counts for every poll ID at once.
- Each mounted card currently adds animations, image handling, local state, and—until point 6 is fixed—a share-modal instance.

### Same-UI fix

Apply in stages:

1. Add `content-visibility: auto` and a carefully measured `contain-intrinsic-size` to the poll-card wrapper. This lets the browser skip layout/paint for distant cards while preserving DOM order and the same scroll experience.
2. Use `IntersectionObserver` to gate card animations and nonessential effects, as described in point 1.
3. Lazy-load images, as described in point 8.
4. If live poll counts can become large, add cursor-based progressive loading/infinite continuation. Preserve the same card grid and category UI; load the next batch before the user reaches the end so the behavior feels unchanged.
5. Fetch vote state only for the hero and currently loaded/near-viewport poll IDs instead of every live poll.
6. Preserve deep-link behavior (`?poll=`). If the requested poll is not in the first batch, fetch that poll directly and bring it into view.
7. Avoid traditional windowing unless necessary: variable-height poll cards and modal anchors make virtualization more complex. `content-visibility` plus progressive data loading should be tried first.

### Acceptance criteria

- Initial mounted/active poll workload stays bounded as the database grows.
- Scrolling, category filters, card sizes, and deep links behave as they do now.
- No visible blank flash occurs when approaching the next cards.

## 10. Profile the production build and establish budgets

### Audit result: missing process

The repository has build/lint scripts but no documented frontend performance test, CPU budget, or regression workflow.

Important distinction:

- `npm run dev` includes Turbopack, file watching, source maps, development checks, and hot reload. It should not be used to judge production idle CPU.
- The correct baseline is `npm run build` followed by `npm start`.

### Recommended measurement procedure

1. Create a production build and open the landing page in a clean browser profile.
2. Test at desktop and mobile dimensions.
3. In Chrome DevTools Performance:
   - record 10 seconds while the hero is visible and idle;
   - record typing plus LIVE badge activity;
   - scroll into the feed and remain idle for 10 seconds;
   - scroll through at least 20 cards;
   - open and close the share modal;
   - open the admin dashboard and poll detail chart pages.
4. Repeat with 4x CPU slowdown to expose mobile-class issues.
5. Use React Profiler to count commits from `HeroSection`, `PollPreview`, `LiveVotesTicker`, and `ShareResultsModal` while those components are not visible.
6. Use the Performance Monitor to track CPU, DOM node count, JS heap, layouts, and style recalculations.
7. Use Lighthouse for Total Blocking Time, Interaction to Next Paint, Largest Contentful Paint, and Cumulative Layout Shift. Lighthouse does not replace the idle-animation trace.
8. Compare network waterfalls before/after image lazy loading and share-modal code splitting.

### Suggested budgets

These are regression targets, not guarantees across all devices:

- No repeating React commits from hidden/offscreen sections.
- No share-image construction before the first explicit modal open.
- No long tasks over 50ms during an idle page.
- Smooth scrolling without recurring main-thread spikes.
- Near-idle CPU after visible entry animations settle, except for the intentionally visible hero typing/LIVE animations.
- No layout shift introduced by lazy images or content visibility.
- No increase in initial JavaScript caused by admin-only chart code on public routes.

## Additional findings discovered during the ten-point audit

### Duplicate featured poll work

`app/page.tsx` sets `featured = polls[0]` and also passes the complete `polls` array to the feed. This means the same poll can be rendered once in the hero and again in the feed. This is visually intentional, but reinforces the need to centralize the share modal, cache image work, and pause the covered hero.

### Hidden desktop content still executes on mobile

The desktop hero poll is visually hidden with responsive CSS, but its React subtree can still mount. Avoid assuming `display: none` stops effects. Render the expensive desktop preview conditionally from a responsive media-query hook, or ensure all of its effects are visibility-gated. Preserve the same desktop/mobile layout.

### Live ticker runs even when CSS hides it on small screens

`LiveVotesTicker` uses `hidden ... sm:flex`, but its timer effect is not tied to that breakpoint. On a small mobile viewport, notifications are invisible while the timer and state updates continue. Gate the component/effect by the same media query without changing its visible behavior at `sm` and above.

### Admin chart loading

The admin dashboard mounts five Recharts visualizations after its API requests complete, and the poll-detail/feedback screens mount additional charts. These are appropriate on their routes, but can be dynamically imported and mounted near viewport. Preserve exact chart dimensions to avoid layout shift. This is lower priority than the landing-page work because admin charts do not run on public routes.

### Admin dashboard requests

`AdminDashboardClient` makes five parallel API requests on mount. This is primarily a server/network concern rather than continuous CPU. It does not poll repeatedly, which is good. If profiling shows serialization/render cost, a combined dashboard endpoint or server component could reduce overhead without changing UI.

## Recommended implementation sequence

### Phase 1: zero-design-risk removals

1. Remove unused poll-image canvas brightness analysis.
2. Centralize and lazy-mount one share modal.
3. Delay share SVG/logo work until modal open.
4. Add lazy image decoding/loading below the fold.

### Phase 2: lifecycle control

5. Add hero visibility and tab visibility gating.
6. Pause hero typing, live ticker, LIVE badges, progress concealment, and shimmer while hidden/offscreen.
7. Add reduced-motion behavior.

### Phase 3: scale and GPU work

8. Add `content-visibility` and intrinsic containment to feed cards.
9. Add progressive poll/vote-state loading if poll counts justify it.
10. Pre-render or consolidate large decorative blur layers and deduplicate backdrop filters.
11. Dynamically load/mount admin charts near viewport.

### Phase 4: prove and protect

12. Run the production profiling procedure before and after each phase.
13. Store screenshots and performance traces for desktop, mobile, light theme, and dark theme.
14. Add agreed performance budgets to the release checklist or CI.

## Definition of done

The optimization work is complete when:

- the UI matches the current design in screenshots at supported breakpoints and both themes;
- hidden/offscreen sections no longer generate timers, animation frames, canvas work, or React commits;
- the landing page initializes no closed share-image previews;
- below-the-fold images and cards do not perform unnecessary eager work;
- visible animations remain unchanged for users who have not requested reduced motion;
- reduced-motion users receive an accessible static equivalent;
- production performance traces demonstrate lower idle CPU and fewer paint/main-thread tasks;
- share, voting, authentication, category filtering, deep links, admin charts, and modals retain their current behavior.
