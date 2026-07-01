import type { Platform, TabOption, UserProfileSummary } from "@/types";

export type SearchSort = "relevance" | "followers" | "engagement";
export type FollowerFilter = "all" | "75m" | "100m" | "150m" | "250m" | "400m" | "600m";
export type EngagementFilter = "all" | "0.25" | "0.5" | "0.75" | "1" | "1.25" | "1.5" | "1.75" | "2";

export interface SearchUiState {
  tab: TabOption;
  verifiedOnly: boolean;
  followers: FollowerFilter;
  engagement: EngagementFilter;
  sort: SearchSort;
}

export interface ProfilePair {
  profile: UserProfileSummary;
  platform: Platform;
}

export const DEFAULT_SEARCH_STATE: SearchUiState = {
  tab: "all",
  verifiedOnly: false,
  followers: "all",
  engagement: "all",
  sort: "relevance",
};

const FOLLOWER_THRESHOLDS: Record<Exclude<FollowerFilter, "all">, number> = {
  "75m": 75_000_000,
  "100m": 100_000_000,
  "150m": 150_000_000,
  "250m": 250_000_000,
  "400m": 400_000_000,
  "600m": 600_000_000,
};

const ENGAGEMENT_THRESHOLDS: Record<Exclude<EngagementFilter, "all">, number> = {
  "0.25": 0.0025,
  "0.5": 0.005,
  "0.75": 0.0075,
  "1": 0.01,
  "1.25": 0.0125,
  "1.5": 0.015,
  "1.75": 0.0175,
  "2": 0.02,
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function tokenizeQuery(query: string) {
  return normalize(query).split(/\s+/).filter(Boolean);
}

function isSubsequence(term: string, text: string) {
  let index = 0;
  for (const char of text) {
    if (char === term[index]) {
      index += 1;
      if (index === term.length) return true;
    }
  }
  return false;
}

function scoreField(text: string, term: string) {
  const normalized = normalize(text);
  if (!normalized) return 0;
  if (normalized === term) return 60;
  if (normalized.startsWith(term)) return 40;
  if (normalized.includes(term)) return 20 + (term.length / normalized.length) * 10;
  if (isSubsequence(term, normalized)) return 10;
  return 0;
}

function getProfileSearchScore(pair: ProfilePair, terms: string[]) {
  if (terms.length === 0) return 0;

  const fields = [
    pair.profile.username,
    pair.profile.fullname,
    pair.profile.handle ?? "",
    pair.platform,
  ];

  let totalScore = 0;

  for (const term of terms) {
    let bestTermScore = 0;

    for (const field of fields) {
      const fieldScore = scoreField(field, term);
      if (fieldScore > bestTermScore) {
        bestTermScore = fieldScore;
      }
    }

    if (bestTermScore === 0) {
      return null;
    }

    totalScore += bestTermScore;
  }

  if (pair.profile.is_verified) {
    totalScore += 1;
  }

  return totalScore;
}

function matchesFollowerFilter(followers: number, filter: FollowerFilter) {
  if (filter === "all") return true;
  return followers >= FOLLOWER_THRESHOLDS[filter];
}

function matchesEngagementFilter(rate: number | undefined, filter: EngagementFilter) {
  if (filter === "all") return true;
  if (rate === undefined) return false;
  return rate >= ENGAGEMENT_THRESHOLDS[filter];
}

function compareForSort(
  left: { pair: ProfilePair; score: number },
  right: { pair: ProfilePair; score: number },
  sort: SearchSort
) {
  if (sort === "followers") {
    return right.pair.profile.followers - left.pair.profile.followers || right.score - left.score;
  }

  if (sort === "engagement") {
    return (right.pair.profile.engagement_rate ?? 0) - (left.pair.profile.engagement_rate ?? 0) || right.pair.profile.followers - left.pair.profile.followers;
  }

  return right.score - left.score || right.pair.profile.followers - left.pair.profile.followers;
}

export function filterAndSortProfiles(
  pairs: ProfilePair[],
  query: string,
  state: SearchUiState
) {
  const terms = tokenizeQuery(query);
  const sorted = pairs
    .flatMap((pair) => {
      if (state.tab !== "all" && pair.platform !== state.tab) {
        return [];
      }

      if (state.verifiedOnly && !pair.profile.is_verified) {
        return [];
      }

      if (!matchesFollowerFilter(pair.profile.followers, state.followers)) {
        return [];
      }

      if (!matchesEngagementFilter(pair.profile.engagement_rate, state.engagement)) {
        return [];
      }

      const score = getProfileSearchScore(pair, terms);
      if (score === null) {
        return [];
      }

      return [{ pair, score }];
    })
    .sort((left, right) => compareForSort(left, right, state.sort));

  return sorted.map(({ pair }) => pair);
}

function parseTab(value: string | null): TabOption {
  return value === "instagram" || value === "youtube" || value === "tiktok" ? value : "all";
}

function parseSort(value: string | null): SearchSort {
  return value === "followers" || value === "engagement" ? value : "relevance";
}

function parseFollowerFilter(value: string | null): FollowerFilter {
  return value === "75m" || value === "100m" || value === "150m" || value === "250m" || value === "400m" || value === "600m" ? value : "all";
}

function parseEngagementFilter(value: string | null): EngagementFilter {
  return value === "0.25" || value === "0.5" || value === "0.75" || value === "1" || value === "1.25" || value === "1.5" || value === "1.75" || value === "2" ? value : "all";
}

export function parseSearchState(params: URLSearchParams): SearchUiState {
  return {
    tab: parseTab(params.get("tab")),
    verifiedOnly: params.get("verified") === "1",
    followers: parseFollowerFilter(params.get("followers")),
    engagement: parseEngagementFilter(params.get("engagement")),
    sort: parseSort(params.get("sort")),
  };
}

export function buildSearchParams(query: string, state: SearchUiState) {
  const params = new URLSearchParams();
  const trimmed = query.trim();

  if (trimmed) {
    params.set("q", trimmed);
  }

  if (state.tab !== "all") {
    params.set("tab", state.tab);
  }

  if (state.verifiedOnly) {
    params.set("verified", "1");
  }

  if (state.followers !== "all") {
    params.set("followers", state.followers);
  }

  if (state.engagement !== "all") {
    params.set("engagement", state.engagement);
  }

  if (state.sort !== "relevance") {
    params.set("sort", state.sort);
  }

  return params;
}

export function isDefaultSearchState(state: SearchUiState) {
  return (
    state.tab === DEFAULT_SEARCH_STATE.tab &&
    state.verifiedOnly === DEFAULT_SEARCH_STATE.verifiedOnly &&
    state.followers === DEFAULT_SEARCH_STATE.followers &&
    state.engagement === DEFAULT_SEARCH_STATE.engagement &&
    state.sort === DEFAULT_SEARCH_STATE.sort
  );
}
