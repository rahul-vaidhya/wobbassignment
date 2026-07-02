# Wobb Influencer Search — Frontend Assignment

> A production-grade influencer discovery platform built on a buggy starter, rebuilt from the ground up.

![TypeScript](https://img.shields.io/badge/TypeScript-~6.0-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [What Changed](#what-changed)
- [Libraries Added](#libraries-added)
- [Assumptions](#assumptions)
- [Trade-offs](#trade-offs)
- [Scripts](#scripts)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

## Overview

This project is a submitted solution for the **Wobb Frontend Take-Home Assignment**. The base repository provided a functional-but-broken influencer search application. The goal was to fix all bugs, redesign the UI, migrate state management to Zustand, implement a persistent shortlist feature, and improve code quality and performance throughout.

The app lets users:
- Discover influencers across Instagram, YouTube, and TikTok
- View detailed profile analytics
- Save profiles to a persistent shortlist for later review

---

## Features

- **Multi-platform search** — filter influencers by Instagram, YouTube, or TikTok with a tab-style switcher
- **Debounced real-time search** — case-insensitive search by username or full name, debounced at 200ms
- **Profile detail view** — per-profile analytics including follower count, engagement rate, and engagement volume
- **Shortlist / Add to List** — add any profile from either the card or detail page; togglable, duplicate-proof
- **Persistent shortlist** — backed by `localStorage` via Zustand `persist` middleware; survives page refresh
- **Dedicated shortlist page** — view all saved profiles at `/shortlist` with remove action and empty state
- **Skeleton loading states** — smooth loading UX instead of blank flashes
- **Responsive grid layout** — 1 / 2 / 3 columns based on viewport
- **Accessible interactions** — keyboard-navigable cards, visible focus rings, ARIA attributes, descriptive alt text
- **Image fallback handling** — broken image URLs degrade gracefully to a placeholder UI
- **Sticky header with live count badge** — shortlist count always visible without navigating away

---

## Tech Stack

| Category        | Technology                         |
| --------------- | ---------------------------------- |
| Framework       | React 19                           |
| Language        | TypeScript ~6.0 (strict mode)      |
| Build Tool      | Vite 7                             |
| Styling         | Tailwind CSS 4                     |
| State           | Zustand 5 + `persist` middleware   |
| Routing         | React Router DOM 7                 |
| Icons           | Lucide React                       |
| Animations      | Framer Motion                      |
| Utilities       | clsx                               |
| Linting         | ESLint 10 + typescript-eslint      |
| Testing         | Vitest                             |

---

## Folder Structure

```text
wobbassignment/
├── public/
├── src/
│   ├── assets/
│   │   └── data/
│   │       ├── search/          # Platform search index JSON files
│   │       └── profiles/        # Per-profile detail JSON files
│   ├── components/
│   │   ├── layout/              # Header, Layout
│   │   ├── profile/             # ProfileAvatar, ProfileCard, ProfileGrid
│   │   ├── search/              # PlatformTabs, SearchInput
│   │   ├── shortlist/           # ShortlistButton
│   │   └── ui/                  # EmptyState, Skeleton, VerifiedBadge
│   ├── hooks/
│   │   └── useDebouncedValue.ts
│   ├── lib/
│   │   ├── format.ts            # Shared number/rate formatters
│   │   ├── platform.ts          # Platform metadata helpers
│   │   ├── profiles.ts          # Profile list normalization
│   │   └── profileLoader.ts     # import.meta.glob lazy loader
│   ├── pages/
│   │   ├── SearchPage.tsx
│   │   ├── ProfileDetailPage.tsx
│   │   └── ShortlistPage.tsx
│   ├── store/
│   │   └── shortlistStore.ts    # Zustand store with persist middleware
│   ├── types/
│   │   └── index.ts             # Shared TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

---

## Installation

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/rahul-vaidhya/wobbassignment.git
cd wobbassignment

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

The build output goes to `dist/`. Verify with:

```bash
npm run preview
```

---

## Usage

| Route              | Description                                 |
| ------------------ | ------------------------------------------- |
| `/`                | Main search dashboard                       |
| `/profile/:username` | Individual influencer profile detail page |
| `/shortlist`       | Saved shortlist of selected profiles        |

**Search** — type in the search bar to filter by username or full name across the active platform tab.

**Add to List** — click the bookmark icon on any card or the "Add to List" button on the profile detail page. Click again to remove. The shortlist persists across page refreshes.

**Shortlist page** — navigate via the header badge or directly to `/shortlist` to review and manage saved profiles.

---

## Architecture

The app follows a flat page-driven architecture with co-located shared logic in `src/lib/`.

**Data flow:**

```
JSON files (import.meta.glob)
  → profileLoader.ts (lazy async loader)
    → profiles.ts (normalizes inconsistent fields: handle vs username)
      → SearchPage / ProfileDetailPage (via useMemo)
        → Zustand shortlistStore (add/remove/persist)
          → ShortlistPage
```

**Key decisions:**

- **Zustand over Context** for shortlist state — simpler API, no Provider boilerplate, and `persist` middleware handles `localStorage` serialization automatically.
- **Normalization at the data layer** (`profiles.ts`) — YouTube profiles with `handle` instead of `username` are resolved once here so no component ever deals with `undefined`.
- **`React.memo` on `ProfileCard`** — the grid re-renders on every keystroke (debounced, but still); memoizing the card prevents re-rendering cards whose props haven't changed.
- **O(1) shortlist lookups** — shortlist is stored as `Record<string, ShortlistEntry>` keyed by `platform:username`, so duplicate checks and toggle operations are constant time.
- **No external data-fetching library** — data is static local JSON; TanStack Query would add complexity without benefit here.

---

## What Changed

<details>
<summary><strong>1. Bugs Fixed (8 issues)</strong></summary>

- **Broken `npm install`** — `react-beautiful-dnd` was listed as a dependency but never used and has a peer-dep conflict with React 19. Removed.
- **Case-sensitive search** — username matching was case-sensitive while full name matching wasn't. Both now use consistent case-insensitive comparison.
- **Engagement Rate off by 100x** — detail page computed `rate * 10000` inline instead of the correct `rate * 100`. Fixed.
- **Wrong "Engagements" stat** — the engagement-rate formatter was being called on the engagement count. Fixed to use the correct count formatter.
- **`@undefined` usernames** — some YouTube records only have `handle`, not `username`. Cards and routing now fall back to `handle`, then `user_id`.
- **Missing `alt` attributes** — all `<img>` tags now have descriptive alt text; broken image URLs show a fallback placeholder UI.
- **Stale data flash on fast navigation** — the profile detail page never reset loading state when the route param changed. Fixed with a cancellation guard against out-of-order async responses.
- **Missing `rel="noopener noreferrer"`** on `target="_blank"` external links.

</details>

<details>
<summary><strong>2. UI/UX Redesign</strong></summary>

- Sticky header with live shortlist count badge
- Tab-style platform switcher with platform icons
- Debounced search input with clear (×) button
- Responsive card grid (1 / 2 / 3 columns)
- Skeleton loading states
- Empty-state component (no results, empty shortlist)
- Keyboard-accessible cards (`role="button"`, Enter/Space, visible focus rings)
- Framer Motion transitions between page states

</details>

<details>
<summary><strong>3. React Context → Zustand</strong></summary>

Replaced all Context-based state with a single `shortlistStore.ts` (Zustand). The store exposes `add`, `remove`, `toggle`, `isShortlisted`, and uses `persist` middleware for automatic `localStorage` sync — no manual serialization needed.

</details>

<details>
<summary><strong>4. Shortlist Feature</strong></summary>

- Add / remove from any card or from the profile detail page
- Duplicate prevention via keyed `Record` storage
- `/shortlist` page with per-profile remove and an empty state
- Persistent after page refresh via `localStorage`

</details>

<details>
<summary><strong>5. Code Quality</strong></summary>

- Reorganized flat component structure into domain folders (`layout/`, `profile/`, `search/`, `shortlist/`, `ui/`)
- Extracted formatting logic into `src/lib/format.ts` (was duplicated in 3+ places with slight inconsistencies)
- Enabled `strict` mode in `tsconfig.app.json` (was off by default)
- Proper TypeScript types for all profile shapes, store state, and component props

</details>

<details>
<summary><strong>6. Performance</strong></summary>

- `ProfileCard` wrapped in `React.memo` — re-renders scoped to prop changes only
- Search input debounced at 200ms before filter runs
- `useMemo` for per-platform list and filtered results
- Routes code-split per Vite defaults; profile JSON lazy-loaded via `import.meta.glob`

</details>

---

## Libraries Added

| Library          | Reason                                                                |
| ---------------- | --------------------------------------------------------------------- |
| `zustand`        | Shortlist state management — required by the brief                    |
| `lucide-react`   | Icon set (search, bookmark, platform indicators, UI chrome)           |
| `framer-motion`  | Page transitions and micro-interactions                               |
| `clsx`           | Conditional `className` composition                                   |
| `vitest`         | Unit testing (test runner scaffolded, bonus item)                     |

No full UI kit (e.g. shadcn/ui, MUI) was added — the app surface didn't justify the dependency weight.

---

## Assumptions

- The sample JSON files are the sole data source; no real API integration was assumed.
- "Persistent after page refresh" means `localStorage` (no backend in scope). Zustand's `persist` middleware handles this.
- Data normalization (missing `username` fields in YouTube records) is handled at the data-access layer, not in components.
- Brand glyphs for Instagram / YouTube / TikTok are not in the current `lucide-react` release; generic platform-appropriate icons paired with text labels are used instead.

---

## Trade-offs

- **No automated tests shipped** — the assignment time box was tight; manual verification was done for all flows (search, filter, navigate, shortlist add/remove, refresh persistence, empty states, mobile layout). Vitest is wired up as a starting point.
- **No deployment** — flagged as a bonus item; the build passes clean and is deploy-ready on Vercel/Netlify with zero config.
- **No drag-to-reorder shortlist** — the removed `react-beautiful-dnd` dependency hints this may have been an original intent. Could be revisited with `@dnd-kit/core` (maintained, React 19 compatible).
- **Static routing pattern kept** — `react-router-dom` + `import.meta.glob` from the starter was retained rather than introducing a data-fetching layer, since data here is local and static.

---

## Scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start development server (Vite)  |
| `npm run build`   | Type-check + production build    |
| `npm run preview` | Preview production build locally |
| `npm run lint`    | Run ESLint                       |
| `npm test`        | Run Vitest test suite            |

---

## Future Improvements

- Automated component and store unit tests (Vitest + Testing Library)
- Deployment to Vercel or Netlify with live URL
- Drag-to-reorder shortlist entries (`@dnd-kit/core`)
- Shortlist sorting/filtering (by platform, follower count)
- Deeper animations and micro-interactions (card hover, page transitions)
- Full accessibility audit (axe-core / Storybook a11y addon)
- CI/CD pipeline (GitHub Actions: lint + build on PR)

---

## Author

**Rahul Vaidhya**
B.Tech Computer Science, Shiv Nadar University (2028)

- GitHub: [github.com/rahul-vaidhya](https://github.com/rahul-vaidhya)
- LinkedIn: [linkedin.com/in/rahul-vaidhya-322a5630b](https://linkedin.com/in/rahul-vaidhya-322a5630b)

---

<div align="center">

Built with React 19 + TypeScript + Zustand · Submitted to Wobb AI — July 2026

</div>
