# Wobb Frontend Assignment — Submission

Influencer search app built with React 19, TypeScript, Vite, Tailwind CSS, and Zustand.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build   # production build (passes clean)
npm run lint    # ESLint (passes clean)
```

## What changed

### 1. Bugs fixed

- **`npm install` was broken.** `react-beautiful-dnd` was listed as a dependency but never imported anywhere in `src/`, and its peer-dependency range is incompatible with React 19 — `npm install` failed outright. Removed it.
- **Search was inconsistent.** Username matching was case-sensitive while fullname matching wasn't, so e.g. `"Cristiano"` (capital C) wouldn't match `@cristiano`. Both fields now use the same case-insensitive comparison.
- **Engagement Rate showed the wrong number.** The detail page computed `rate * 10000` inline instead of using the existing (correct) `rate * 100` formatter — off by 100x.
- **"Engagements" stat was wrong.** It called the engagement-*rate* formatter on the engagement-rate value again instead of formatting the actual `engagements` count.
- **Some sample profiles rendered `@undefined`.** A few YouTube records in the sample data only have a `handle` field, not `username`. Card and routing logic now fall back to `handle`, then `user_id`, so nothing renders as `undefined` and every profile link resolves.
- **Both `<img>` tags had no `alt` attribute** (accessibility/lint issue). Added descriptive alt text everywhere, plus a graceful fallback UI for broken image URLs.
- **Stale data flash on fast navigation.** The profile detail page's data-loading effect never reset its "loaded" state when the route's `username` changed, so navigating quickly from one profile to another could briefly show the previous profile's stats. Loading state is now derived from whether the loaded result matches the current route param, with a cancellation guard against out-of-order async responses.
- **`target="_blank"` link missing `rel="noopener noreferrer"`** on the external profile link.
- Follower-count formatting was duplicated in three places with slightly different rounding; consolidated into one helper (`src/lib/format.ts`).

### 2. UI/UX redesign

Full visual redesign: sticky header with a live shortlist count badge, tab-style platform switcher with icons, debounced search input with clear button, a responsive card grid (1/2/3 columns depending on viewport), skeleton loading states, an empty-state component (no results, empty shortlist), and keyboard-accessible cards (`role="button"`, Enter/Space support, visible focus rings throughout).

### 3. React Context → Zustand

The brief specifies using Zustand for the list state management (rather than Context). `src/store/shortlistStore.ts` holds shortlist entries in a `Record` keyed by `platform:username` for O(1) duplicate checks, exposes `add` / `remove` / `toggle` / `isShortlisted`, and uses Zustand's `persist` middleware to back the store with `localStorage` — no manual serialization code needed.

### 4. "Select Profile & Add to List" feature

- **Add to List** button (now functional) on every card and on the detail page, sourced from the Zustand store.
- **Duplicate prevention**: keyed storage means re-adding the same profile is a no-op; the button instead acts as a toggle.
- **`/shortlist` page**: lists every saved profile with platform, follower count, and a remove action; shows a friendly empty state with a link back to search when nothing's saved.
- **Persistent across refresh**: backed by `localStorage` via Zustand's `persist` middleware — verified manually (add → refresh → still present).

### 5. Code quality / structure

```
src/
  components/
    layout/     Header, Layout
    profile/    ProfileAvatar, ProfileCard, ProfileGrid
    search/     PlatformTabs, SearchInput
    shortlist/  ShortlistButton
    ui/         EmptyState, Skeleton, VerifiedBadge
  hooks/        useDebouncedValue
  lib/          format.ts, platform.ts, profiles.ts, profileLoader.ts
  store/        shortlistStore.ts (Zustand)
  pages/        SearchPage, ProfileDetailPage, ShortlistPage
  types/        index.ts
```

Replaces the original flat `components/` + `utils/` layout, where formatting and data logic were duplicated across files. TypeScript `strict` mode is now enabled in `tsconfig.app.json` (it wasn't on before).

### 6. Performance

- `ProfileCard` is wrapped in `React.memo` so re-renders are scoped to cards whose props actually changed, not the whole grid on every keystroke.
- Search input is debounced (200ms) before filtering runs.
- `useMemo` for the per-platform profile list and the filtered result, so switching platforms or typing doesn't redo work unnecessarily.
- Routes are still code-split per the existing Vite/React Router setup; JSON profile data is lazy-loaded per-profile via `import.meta.glob`, unchanged from the original (already a reasonable pattern).

### 7. Libraries added

| Library | Why |
|---|---|
| `zustand` | Required by the brief for shortlist state management. |
| `lucide-react` | Icon set for the redesigned UI (search, bookmark, platform icons, etc). |
| `clsx` | Small utility for conditional className strings. |

No UI kit (e.g. shadcn) was added on top of Tailwind — the surface area of this app didn't justify the extra dependency weight.

## Assumptions

- The sample data is the only data source; no real API integration was assumed or added.
- "Persistent after page refresh" was interpreted as `localStorage` persistence (no backend in this assignment), which is also what Zustand's `persist` middleware is built for.
- Where sample data was inconsistent (missing `username`), I normalized at the data-access layer (`src/lib/profiles.ts`) rather than special-casing it in components, so the rest of the app never has to think about it.
- Brand icons (Instagram/YouTube/TikTok glyphs) aren't included in the current `lucide-react` release, so generic camera/video/music icons are used as platform indicators instead, paired with text labels.

## Trade-offs

- No automated tests were added (bonus item) given the assignment's time box; manual verification was done for every flow described above (search, filter, navigate, add/remove from shortlist, refresh persistence, empty states, mobile layout).
- No deployment was done as part of this submission (also a bonus item).
- Kept routing/data-loading patterns from the starter (`react-router-dom`, `import.meta.glob` for profile JSON) rather than introducing a data-fetching library like TanStack Query, since the data here is static and local — adding a fetching layer would be complexity without benefit.

## Remaining improvements (not done, given time)

- Automated tests (component + store unit tests) — flagged in the brief as bonus.
- Deployment to Vercel/Netlify — flagged in the brief as bonus.
- Animations/micro-interactions beyond basic transitions — flagged in the brief as bonus.
- Sorting/filtering the shortlist (e.g. by platform, follower count) if the list grows large.
- Drag-to-reorder shortlist (the removed `react-beautiful-dnd` dependency hints this may have been an original intent — could be revisited with a maintained alternative like `@dnd-kit/core` if desired).
