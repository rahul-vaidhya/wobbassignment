import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CompareEntry, Platform, UserProfileSummary } from "@/types";
import { makeShortlistKey } from "@/store/shortlistStore";

export interface CompareState {
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

const createCompareState = (set: any, get: any): CompareState => ({
  entries: [],

  add: (platform: Platform, profile: UserProfileSummary) => {
    const key = makeCompareKey(platform, profile.username);
    if (get().entries.some((entry: CompareEntry) => entry.key === key)) return;
    if (get().entries.length >= MAX_COMPARE_ITEMS) return;
    set((state: CompareState) => ({
      entries: [
        ...state.entries,
        { key, platform, profile, addedAt: Date.now() },
      ],
    }));
  },

  remove: (key: string) => {
    set((state: CompareState) => ({
      entries: state.entries.filter((entry) => entry.key !== key),
    }));
  },

  toggle: (platform: Platform, profile: UserProfileSummary) => {
    const key = makeCompareKey(platform, profile.username);
    const existing = get().entries.some((entry: CompareEntry) => entry.key === key);
    if (existing) {
      set((state: CompareState) => ({ entries: state.entries.filter((entry) => entry.key !== key) }));
      return;
    }
    get().add(platform, profile);
  },

  clear: () => set({ entries: [] }),

  isSelected: (key: string) => get().entries.some((entry: CompareEntry) => entry.key === key),
});

export const useCompareStore = create<CompareState>()(
  persist(
    createCompareState,
    {
      name: "wobb-compare",
      version: 1,
    }
  )
);

export function useCompareCount() {
  return useCompareStore((state: CompareState) => state.entries.length);
}
