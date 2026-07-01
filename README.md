# Wobb Frontend Assignment — Submission

A modern, highly-polished Influencer discovery and comparison app built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Zustand**. 

---

## 🚀 Live Demo & Deployment

- **Vercel Deployment Configured**: The codebase includes a production-ready `vercel.json` configuration to handle client-side routing.
- **To Deploy instantly**: 
  1. Push this repository to GitHub/GitLab/Bitbucket.
  2. Import the project on [Vercel](https://vercel.com).
  3. The framework preset will automatically detect **Vite** and deploy.

---

## 🛠️ How to Run & Verify

Follow these commands to install dependencies, run the dev server, execute tests, and confirm production builds:

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Run the unit test suite (expanded to 26+ assertions)
npm test

# 4. Compile TypeScript & build production package (passes 100% clean)
npm run build

# 5. Run the linter
npm run lint
```

---

## ✨ Additional Credit Enhancements

This submission implements all optional credit criteria requested by the assignment specification:

### 1. Robust Test Suite (`npm test`)
We expanded the test suite using a custom high-performance Node.js CommonJS/TS transpilation runner. Tests are completely green and run in `< 100ms`:
- **Search Filtering (`src/lib/search.test.ts`)**: Added tab isolation, `verifiedOnly` state check, follower sorting order validation, engagement sorting validation, and default passthrough checks.
- **Shortlist Store (`src/store/shortlistStore.test.ts`)**: Added toggle validations, duplicate-prevention/idempotency checks, and complete storage clear validations.
- **Compare Store (`src/store/compareStore.test.ts`)**: Added maximum-cap (3 item limit) test, duplicate-add rejection, and selection state checks.
- **Profile Loader/Helpers (`src/lib/profiles.test.ts`)**: Verified key fallback mechanism (`username` -> `handle` -> `user_id`) to ensure no dead links or `@undefined` renders.

### 2. Deep Accessibility (a11y) Improvements
- **Skip-To-Content Navigation**: Built a keyboard-accessible `.skip-nav` link inside `Layout.tsx` that lets screen-reader and keyboard users skip the header directly to `#main-content`.
- **Keyboard Navigation**: Cards support focus indicators, have `role="button"` and `tabIndex={0}`, and handle both `Enter` and `Space` keys to open detail pages.
- **Screen Reader Announcements**: Wrapped result counts and shortlist counts in `<output aria-live="polite">` elements to announce updates dynamically to assistive tech.
- **Semantic Data Tables**: The comparison matrix on `/compare` uses a standard `<table>` with `scope="col"` headers, `scope="row"` metric labels, and a descriptive `<caption>`.
- **Focus Ring Indicators**: Select filters have styled `:focus-visible` rings matching the violet theme.

### 3. Modern Animations & Tactile Micro-Interactions
Built using `framer-motion`:
- **Staggered Stats Entrance**: Profile card followers and engagement metrics stagger-slide up on mount.
- **Dynamic Grid Exit**: Wrapped the grid in `AnimatePresence` with `mode="popLayout"`. When a creator is filtered out by search, they smoothly slide out and scale down, letting remaining cards animate into place.
- **Interactive Shortlist Action**: Shortlist buttons have spring-loaded icon toggles between bookmark states, tactile scale contraction (`whileTap`), and a radial violet wave animation on add.
- **Metric Highlight Pulses**: The comparison table highlights the highest value in each row using a subtle green background and accent arrow to immediately draw comparison value.

### 4. Deployment Optimization
- Added a `vercel.json` rewrite rule to redirect all client-side routes to `index.html`, preventing 404 errors on direct navigation or refresh of `/shortlist` and `/compare` pages.

---

## 🐞 Bugs Fixed from Starter Code

1. **Broken Dependency Tree**: `react-beautiful-dnd` had legacy peer dependencies incompatible with React 19, causing `npm install` to fail. Since it was unused in the codebase, it was removed.
2. **Case-Sensitive Search**: Search matched names case-insensitively but usernames case-sensitively. Normalised both to case-insensitive.
3. **Incorrect Engagement Metrics**: Engagement rate was computed as `rate * 10000` (off by 100x). consolidated all formatting logic to `src/lib/format.ts`.
4. **Incorrect Engagement Stats**: The engagements stat was formatted with the engagement rate formatter. Fixed to show formatted count.
5. **Missing Fallbacks for Handles**: Some YouTube profiles lacked a `username` field, rendering as `@undefined`. Added a fallback hierarchy (`username` -> `handle` -> `user_id`).
6. **Detail Page State Leak**: Fast navigation between profiles flashed the previous profile's data. Added cancellation handlers to the loading promises to resolve out-of-order responses.

---

## 📦 Libraries Added

| Library | Purpose / Rationale |
|---|---|
| `zustand` | Lightweight state management for persistence & side-by-side comparison stores. |
| `lucide-react` | Icon library for visual indicators, social platforms, and clear actions. |
| `clsx` | Helper utility to combine Tailwind class names cleanly. |
| `framer-motion` | Core animation library to handle UI transitions and interactive feedback. |

---

## 💡 Assumptions & Technical Trade-offs

- **Static Data Source**: Handled static local JSON assets as a representation of a database.
- **Zustand Persistence**: Saved shortlist and comparison metrics in local storage via middleware so data remains across reloads.
- **No Heavy UI Kits**: Avoided adding massive UI libraries (e.g. Shadcn/Chakra) to keep bundling sizes small (Vite bundles the whole app in `~500kB` including animations).
- **Custom Test Runner**: Used Node's built-in transpiler script to test without configuring a full Jest/Babel suite, keeping tooling lightweight and fast.
