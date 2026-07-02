# Wobb Influencer Search

> Influencer discovery and shortlisting app — built on a buggy starter, rebuilt to production quality.

[![TypeScript](https://img.shields.io/badge/TypeScript-~6.0-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5-FF6B35?style=flat-square)](https://zustand-demo.pmnd.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

**Submitted as the Wobb Frontend Take-Home Assignment (July 2026).**

The base repository was intentionally broken. This submission fixes every bug, redesigns the interface from scratch, migrates state to Zustand, and adds shortlisting, recently-viewed tracking, and a sponsorship cost estimator on top.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Screenshots](#screenshots)
- [Features](#features)
- [Recent Updates](#recent-updates)
- [Tech Stack](#tech-stack)
- [Architecture & Folder Structure](#architecture--folder-structure)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Build for Production](#build-for-production)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Application Flow](#application-flow)
- [Scripts](#scripts)
- [Future Improvements](#future-improvements)
- [License](#license)
- [Author](#author)

---

## Live Demo

🔗 **[wobbassignmentrahul.vercel.app](https://wobbassignmentrahul.vercel.app/)**

Or run locally: `npm install && npm run dev` → [http://localhost:5173](http://localhost:5173)

---

## Screenshots

> Add screenshots to a `docs/` folder and update these paths.

| Search Dashboard | Profile Detail | Shortlist |
| --- | --- | --- |
| `docs/screenshots/search.png` | `docs/screenshots/profile.png` | `docs/screenshots/shortlist.png` |

---

## Features

### Search & Discovery

- **Platform tabs** — switch between Instagram, YouTube, and TikTok with a tab-style switcher; only relevant profiles load
- **Debounced real-time search** — case-insensitive filtering by username or full name, debounced at 200 ms to avoid redundant renders
- **Responsive card grid** — 1 / 2 / 3 columns based on viewport width
- **Skeleton loading states** — content placeholders during async data loads; no blank-screen flash

### Profile Detail

- **Full analytics** — follower count, engagement rate, and total engagements, all formatted correctly
- **Estimated Sponsorship Cost** — per-post cost range calculated from follower count and engagement rate using industry-standard CPE benchmarks; displayed as a Min / Max range in INR and USD
- **Image fallback** — broken avatar or banner URLs degrade gracefully to a styled placeholder; no broken-image icons

### Shortlisting

- **Add to List** toggle on every card and on the profile detail page
- **Duplicate prevention** — store is keyed by `platform:username` so re-adding is a no-op
- **Persistent across sessions** — backed by `localStorage` via Zustand `persist` middleware; survives hard refresh
- **Dedicated `/shortlist` page** — view all saved profiles with platform badge, follower count, and a remove action; shows an empty state with a link back to search

### Recently Viewed

- **Automatic tracking** — every profile page visit is recorded in a Zustand store (capped at 10 entries, most-recent first)
- **Persistent across sessions** — backed by `localStorage`; list survives page refresh
- **Displayed on the search page** — a "Recently Viewed" row appears above the grid when history is non-empty; click any entry to jump back

### UI / UX

- **Sticky header** with a live shortlist count badge
- **Framer Motion** page transitions and card hover micro-interactions
- **Keyboard-accessible cards** — `role="button"`, Enter/Space activation, visible focus rings
- **ARIA attributes** and descriptive `alt` text throughout
- **Error boundary** — unexpected render errors display a friendly fallback instead of a white screen

---

## Recent Updates

> What was added on top of the initial assignment deliverables.

| Feature | Details |
| --- | --- |
| **Estimated Sponsorship Cost** | Profile detail page now shows a cost-per-post range (Min / Max) based on follower count × engagement rate, displayed in both INR and USD |
| **Recently Viewed Profiles** | Visiting a profile page records it automatically; a scrollable "Recently Viewed" strip appears on the search dashboard and persists across refreshes |
| **Enhanced Profile Detail** | Cleaner layout, stat cards with icons, sponsorship estimator panel, and a back button that preserves search/filter state |
| **Framer Motion animations** | Entrance animations on cards (`AnimatePresence`), stagger on grid mount, and page-level transitions via a shared `Layout` wrapper |
| **Loading skeletons** | `Skeleton` component shown at the card level and at the profile detail level while JSON loads |
| **Error & fallback states** | `EmptyState` component for no-results and empty-shortlist views; image `onError` fallback; route-level error boundary |

---

## Tech Stack

| Category | Technology | Version |
| --- | --- | --- |
| Framework | React | ^19.2.6 |
| Language | TypeScript (strict) | ~6.0.2 |
| Build tool | Vite | ^7.1.0 |
| Styling | Tailwind CSS (Vite plugin) | ^4.3.1 |
| State management | Zustand + `persist` middleware | ^5.0.14 |
| Routing | React Router DOM | ^7.18.0 |
| Animations | Framer Motion | ^12.42.2 |
| Icons | Lucide React | ^1.22.0 |
| Class utilities | clsx | ^2.1.1 |
| Linting | ESLint 10 + typescript-eslint | ^10.3.0 / ^8.59.2 |
| Testing | Vitest (via custom runner) | ^3.2.4 |

> **Tailwind v4 note:** v4 drops the PostCSS plugin in favour of a dedicated Vite plugin (`@tailwindcss/vite`). No `tailwind.config.js` or `postcss.config.js` is needed.

---

## Architecture & Folder Structure

The app is page-driven with a thin data-access layer in `src/lib/` and all persistent state in Zustand stores under `src/store/`.

```
User visits route
  → React Router renders Page
    → Page reads data via src/lib/ helpers (import.meta.glob, normalize)
      → Page reads/writes Zustand store (shortlist, recentlyViewed)
        → Components render; Zustand persist syncs to localStorage
```

**Design decisions worth noting:**

- **Normalization at the data layer.** YouTube profiles in the sample data only have `handle`, not `username`. `src/lib/profiles.ts` resolves this once; no component ever checks for `undefined`.
- **O(1) shortlist ops.** The shortlist store uses `Record<string, entry>` keyed by `platform:username`, so `isShortlisted`, `add`, and `remove` are all constant-time.
- **`React.memo` on `ProfileCard`.** The card grid re-renders on every debounced keystroke. Memoizing the card component constrains re-renders to cards whose props actually changed.
- **No data-fetching library.** Data is static local JSON. TanStack Query would add complexity with no benefit here.

---

## Installation

**Prerequisites:** Node.js 18+ and npm 9+

```bash
git clone https://github.com/rahul-vaidhya/wobbassignment.git
cd wobbassignment
npm install
```

No `.env` file is required — the app uses only local static JSON data.

---

## Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Build for Production

```bash
npm run build
```

This runs `tsc -b` (type-check) followed by `vite build`. Output goes to `dist/`.

To preview the production build locally:

```bash
npm run preview
```

### Deploying to Vercel

```bash
# Install the Vercel CLI
npm i -g vercel

# Deploy (follow the prompts; framework will be auto-detected as Vite)
vercel
```

Or connect the repo in the Vercel dashboard — no additional configuration is needed. Vercel auto-detects Vite and sets `dist` as the output directory.

---

## Project Structure

```text
wobbassignment/
├── public/                        # Static assets (favicon, etc.)
├── scripts/
│   └── run-tests.cjs              # Custom Vitest runner script
├── src/
│   ├── assets/
│   │   └── data/
│   │       ├── search/            # Platform search index JSON files
│   │       └── profiles/          # Per-profile detail JSON files
│   ├── components/
│   │   ├── layout/                # Header, Layout (page wrapper)
│   │   ├── profile/               # ProfileAvatar, ProfileCard, ProfileGrid
│   │   ├── search/                # PlatformTabs, SearchInput
│   │   ├── shortlist/             # ShortlistButton
│   │   └── ui/                    # EmptyState, Skeleton, VerifiedBadge
│   ├── hooks/
│   │   └── useDebouncedValue.ts   # Generic debounce hook
│   ├── lib/
│   │   ├── format.ts              # Follower count, engagement rate, cost formatters
│   │   ├── platform.ts            # Platform metadata (label, icon, color)
│   │   ├── profiles.ts            # Profile list normalization (handle → username)
│   │   └── profileLoader.ts       # import.meta.glob lazy loader
│   ├── pages/
│   │   ├── SearchPage.tsx         # Dashboard: search, filter, recently viewed
│   │   ├── ProfileDetailPage.tsx  # Profile stats + sponsorship cost estimator
│   │   └── ShortlistPage.tsx      # Saved profiles list
│   ├── store/
│   │   ├── shortlistStore.ts      # Zustand: add/remove/toggle + localStorage persist
│   │   └── recentlyViewedStore.ts # Zustand: last 10 visited profiles + localStorage persist
│   ├── types/
│   │   └── index.ts               # Shared TypeScript interfaces
│   ├── App.tsx                    # Route definitions
│   └── main.tsx                   # React entry point
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts                 # Vite + Tailwind plugin + @ path alias
└── eslint.config.js
```

> The `@` alias in `vite.config.ts` maps to `src/`, so imports use `@/components/...` throughout.

---

## Key Components

<details>
<summary><strong>ProfileCard</strong> — <code>src/components/profile/ProfileCard.tsx</code></summary>

Wrapped in `React.memo`. Renders avatar, name, platform badge, follower count, engagement rate, and a `ShortlistButton`. Keyboard-accessible (`role="button"`, Enter/Space handler).

</details>

<details>
<summary><strong>ProfileDetailPage</strong> — <code>src/pages/ProfileDetailPage.tsx</code></summary>

Loads profile JSON via `profileLoader.ts` on route change, with a cancellation guard for out-of-order responses. Displays full stats plus the **Estimated Sponsorship Cost** panel. Has a back-button that restores the previous search/filter state.

</details>

<details>
<summary><strong>shortlistStore</strong> — <code>src/store/shortlistStore.ts</code></summary>

Zustand store with `persist` middleware. State is a `Record<string, ShortlistEntry>` keyed by `platform:username`. Exposes `add`, `remove`, `toggle`, and `isShortlisted`.

</details>

<details>
<summary><strong>recentlyViewedStore</strong> — <code>src/store/recentlyViewedStore.ts</code></summary>

Zustand store with `persist` middleware. Maintains an ordered array (most-recent first) capped at 10 entries. `push` de-duplicates before inserting.

</details>

<details>
<summary><strong>Skeleton</strong> — <code>src/components/ui/Skeleton.tsx</code></summary>

Animated placeholder used at card level (grid loading) and at the profile detail level (data loading).

</details>

---

## Application Flow

```
/ (SearchPage)
├── Platform tab selected → loads platform JSON via profileLoader
├── Search input → debounced → filters profile list in useMemo
├── Recently Viewed strip → reads recentlyViewedStore
├── ProfileCard clicked
│   ├── navigates to /profile/:username
│   └── writes to recentlyViewedStore
│
/profile/:username (ProfileDetailPage)
├── Loads profile detail JSON
├── Displays stats (followers, engagement rate, engagements)
├── Displays Estimated Sponsorship Cost panel
├── ShortlistButton → reads/writes shortlistStore
└── Back button → returns to / preserving search state
│
/shortlist (ShortlistPage)
├── Reads shortlistStore
├── Renders saved profiles with remove action
└── Empty state → link back to /
```

---

## Scripts

Verified against `package.json`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite development server at `localhost:5173` |
| `npm run build` | Type-check (`tsc -b`) then build to `dist/` |
| `npm run preview` | Serve the `dist/` build locally |
| `npm run lint` | Run ESLint across the project |
| `npm test` | Run tests via `scripts/run-tests.cjs` (Vitest) |

---

## What Changed From the Starter

<details>
<summary><strong>Bugs fixed (8 issues)</strong></summary>

- **`npm install` was broken.** `react-beautiful-dnd` was in dependencies but never imported, and its peer-dep range is incompatible with React 19. Removed.
- **Case-sensitive search.** Username matching was case-sensitive, full-name matching wasn't. Both now use consistent lowercase comparison.
- **Engagement Rate off by 100×.** The detail page computed `rate * 10000` inline instead of using the correct `rate * 100` formatter.
- **"Engagements" stat used the wrong formatter.** The engagement-*rate* formatter was called on the engagement-*count* value.
- **Profiles rendered `@undefined`.** YouTube records only have `handle`, not `username`. Cards and routing now fall back to `handle`, then `user_id`.
- **Missing `alt` attributes.** All `<img>` tags now have descriptive alt text; broken URLs show a fallback placeholder.
- **Stale data flash on fast navigation.** The detail page never reset loading state on route param change. Fixed with a cancellation guard.
- **`target="_blank"` missing `rel="noopener noreferrer"`.**

</details>

<details>
<summary><strong>Libraries added</strong></summary>

| Library | Reason |
| --- | --- |
| `zustand` | Required by the assignment brief for shortlist state |
| `framer-motion` | Page transitions and card micro-interactions |
| `lucide-react` | Icon set for search, bookmark, and platform indicators |
| `clsx` | Conditional className composition |

No UI kit (shadcn/ui, MUI, etc.) was added — the app surface didn't warrant the dependency weight.

</details>

---

## Future Improvements

- Automated component and store unit tests (Vitest + Testing Library)
- Drag-to-reorder shortlist entries (`@dnd-kit/core` — maintained React 19 compatible alternative to the removed `react-beautiful-dnd`)
- Shortlist sorting/filtering by platform or follower count
- GitHub Actions CI: lint + build on every push
- Full accessibility audit (axe-core)

---

## License

[MIT](LICENSE)

---

## Author

**Rahul Vaidhya**  
B.Tech Computer Science · Shiv Nadar University (Class of 2028)

- GitHub: [github.com/rahul-vaidhya](https://github.com/rahul-vaidhya)
- LinkedIn: [linkedin.com/in/rahul-vaidhya-322a5630b](https://www.linkedin.com/in/rahul-vaidhya-322a5630b)

---

<div align="center">

Built with React 19 · TypeScript · Zustand · Tailwind CSS v4 · Framer Motion

Submitted to Wobb AI — July 2026

</div>
