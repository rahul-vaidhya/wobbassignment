import type { Platform } from "@/types";

const RECENT_SEARCHES_KEY = "wobb-recent-searches";
const RECENT_VIEWS_KEY = "wobb-recent-views";
const MAX_ITEMS = 6;

export interface RecentViewedProfile {
  platform: Platform;
  username: string;
  fullname: string;
}

function readJson<T>(key: string, fallback: T) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function keepUnique<T>(items: T[], isSame: (left: T, right: T) => boolean) {
  return items.filter((item, index, array) => array.findIndex((candidate) => isSame(candidate, item)) === index);
}

export function getRecentSearches() {
  return readJson<string[]>(RECENT_SEARCHES_KEY, []);
}

export function addRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return getRecentSearches();
  }

  const next = [trimmed, ...getRecentSearches().filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_ITEMS);
  writeJson(RECENT_SEARCHES_KEY, next);
  return next;
}

export function getRecentViewedProfiles() {
  return readJson<RecentViewedProfile[]>(RECENT_VIEWS_KEY, []);
}

export function addRecentViewedProfile(profile: RecentViewedProfile) {
  const next = keepUnique([profile, ...getRecentViewedProfiles()], (left, right) => (
    left.platform === right.platform && left.username.toLowerCase() === right.username.toLowerCase()
  )).slice(0, MAX_ITEMS);

  writeJson(RECENT_VIEWS_KEY, next);
  return next;
}
