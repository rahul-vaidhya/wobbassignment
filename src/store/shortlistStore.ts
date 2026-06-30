import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Platform, ShortlistEntry, UserProfileSummary } from "@/types";

interface ShortlistState {
  /** Keyed by `${platform}:${identifier}` for O(1) lookups and de-duping. */
  entries: Record<string, ShortlistEntry>;
  add: (platform: Platform, profile: UserProfileSummary) => void;
  remove: (key: string) => void;
  toggle: (platform: Platform, profile: UserProfileSummary) => void;
  isShortlisted: (key: string) => boolean;
  clear: () => void;
}

export function makeShortlistKey(platform: Platform, identifier: string) {
  return `${platform}:${identifier}`;
}

export const useShortlistStore = create<ShortlistState>()(
  persist(
    (set, get) => ({
      entries: {},

      add: (platform, profile) => {
        const key = makeShortlistKey(platform, profile.username);
        if (get().entries[key]) return; // prevent duplicate entries
        set((state) => ({
          entries: {
            ...state.entries,
            [key]: { key, platform, profile, addedAt: Date.now() },
          },
        }));
      },

      remove: (key) => {
        set((state) => {
          if (!(key in state.entries)) return state;
          const next = { ...state.entries };
          delete next[key];
          return { entries: next };
        });
      },

      toggle: (platform, profile) => {
        const key = makeShortlistKey(platform, profile.username);
        const { entries, remove, add } = get();
        if (entries[key]) {
          remove(key);
        } else {
          add(platform, profile);
        }
      },

      isShortlisted: (key) => Boolean(get().entries[key]),

      clear: () => set({ entries: {} }),
    }),
    {
      name: "wobb-shortlist", // localStorage key — keeps the list after refresh
      version: 1,
    }
  )
);

/** Convenience selector for components that just need the count badge. */
export function useShortlistCount() {
  return useShortlistStore((state) => Object.keys(state.entries).length);
}
