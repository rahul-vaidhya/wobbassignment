import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Platform, ShortlistEntry, UserProfileSummary } from "@/types";

export interface ShortlistState {
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

const createShortlistState = (set: any, get: any): ShortlistState => ({
  entries: {},

  add: (platform: Platform, profile: UserProfileSummary) => {
    const key = makeShortlistKey(platform, profile.username);
    if (get().entries[key]) return; // prevent duplicate entries
    set((state: ShortlistState) => ({
      entries: {
        ...state.entries,
        [key]: { key, platform, profile, addedAt: Date.now() },
      },
    }));
  },

  remove: (key: string) => {
    set((state: ShortlistState) => {
      if (!(key in state.entries)) return state;
      const next = { ...state.entries };
      delete next[key];
      return { entries: next };
    });
  },

  toggle: (platform: Platform, profile: UserProfileSummary) => {
    const key = makeShortlistKey(platform, profile.username);
    const { entries, remove, add } = get();
    if (entries[key]) {
      remove(key);
    } else {
      add(platform, profile);
    }
  },

  isShortlisted: (key: string) => Boolean(get().entries[key]),

  clear: () => set({ entries: {} }),
});

export const useShortlistStore = create<ShortlistState>()(
  persist(
    createShortlistState,
    {
      name: "wobb-shortlist", // localStorage key — keeps the list after refresh
      version: 1,
    }
  )
);

/** Convenience selector for components that just need the count badge. */
export function useShortlistCount() {
  return useShortlistStore((state: ShortlistState) => Object.keys(state.entries).length);
}
