import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CompareEntry, Platform, UserProfileSummary } from "@/types";
import { makeShortlistKey } from "@/store/shortlistStore";

interface CompareState {
  entries: CompareEntry[];
  add: (platform: Platform, profile: UserProfileSummary) => void;
  remove: (key: string) => void;
  toggle: (platform: Platform, profile: UserProfileSummary) => void;
  clear: () => void;
  isSelected: (key: string) => boolean;
}

const MAX_COMPARE_ITEMS = 3;

export function makeCompareKey(platform: Platform, identifier: string) {
  return makeShortlistKey(platform, identifier);
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      entries: [],

      add: (platform, profile) => {
        const key = makeCompareKey(platform, profile.username);
        if (get().entries.some((entry) => entry.key === key)) return;
        if (get().entries.length >= MAX_COMPARE_ITEMS) return;
        set((state) => ({
          entries: [
            ...state.entries,
            { key, platform, profile, addedAt: Date.now() },
          ],
        }));
      },

      remove: (key) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.key !== key),
        }));
      },

      toggle: (platform, profile) => {
        const key = makeCompareKey(platform, profile.username);
        const existing = get().entries.some((entry) => entry.key === key);
        if (existing) {
          set((state) => ({ entries: state.entries.filter((entry) => entry.key !== key) }));
          return;
        }
        get().add(platform, profile);
      },

      clear: () => set({ entries: [] }),

      isSelected: (key) => get().entries.some((entry) => entry.key === key),
    }),
    {
      name: "wobb-compare",
      version: 1,
    }
  )
);

export function useCompareCount() {
  return useCompareStore((state) => state.entries.length);
}
