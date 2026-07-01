import assert from "node:assert/strict";
import { buildSearchParams, DEFAULT_SEARCH_STATE, filterAndSortProfiles, parseSearchState, type ProfilePair } from "@/lib/search";
import type { Platform, UserProfileSummary } from "@/types";

function makeProfile(
  overrides: Partial<UserProfileSummary> & { username: string; fullname: string; followers: number },
): UserProfileSummary {
  return {
    user_id: overrides.user_id ?? overrides.username,
    username: overrides.username,
    url: overrides.url ?? `https://example.com/${overrides.username}`,
    picture: overrides.picture ?? "https://example.com/avatar.jpg",
    fullname: overrides.fullname,
    is_verified: overrides.is_verified ?? false,
    followers: overrides.followers,
    engagements: overrides.engagements,
    engagement_rate: overrides.engagement_rate,
    handle: overrides.handle,
    avg_views: overrides.avg_views,
  };
}

function makePair(
  platform: Platform,
  overrides: Partial<UserProfileSummary> & { username: string; fullname: string; followers: number },
): ProfilePair {
  return {
    platform,
    profile: makeProfile(overrides),
  };
}

// ─── Test 1: Relevance ranking ───────────────────────────────────────────────
const relevanceResult = filterAndSortProfiles(
  [
    makePair("instagram", { username: "alpha", fullname: "Alpha One", followers: 1000 }),
    makePair("youtube", { username: "beta", fullname: "Alpha Brigade", followers: 2000 }),
    makePair("tiktok", { username: "gamma", fullname: "Gamma Crew", followers: 500 }),
  ],
  "alpha",
  DEFAULT_SEARCH_STATE
);

assert.deepEqual(relevanceResult.map((pair) => pair.profile.username), ["alpha", "beta"]);

// ─── Test 2: Combined filter (tab + verified + followers + engagement + sort) ─
const filteredResult = filterAndSortProfiles(
  [
    makePair("instagram", {
      username: "alpha",
      fullname: "Alpha One",
      followers: 180_000_000,
      is_verified: true,
      engagement_rate: 0.02,
    }),
    makePair("youtube", {
      username: "beta",
      fullname: "Beta Two",
      followers: 140_000_000,
      is_verified: true,
      engagement_rate: 0.018,
    }),
    makePair("youtube", {
      username: "gamma",
      fullname: "Gamma Three",
      followers: 120_000_000,
      is_verified: false,
      engagement_rate: 0.018,
    }),
  ],
  "",
  {
    tab: "youtube",
    verifiedOnly: true,
    followers: "100m",
    engagement: "1.5",
    sort: "followers",
  }
);

assert.deepEqual(filteredResult.map((pair) => pair.profile.username), ["beta"]);

// ─── Test 3: URL round-trip ───────────────────────────────────────────────────
const params = buildSearchParams("MrBeast", {
  tab: "youtube",
  verifiedOnly: true,
  followers: "150m",
  engagement: "1.5",
  sort: "followers",
});

assert.equal(params.toString(), "q=MrBeast&tab=youtube&verified=1&followers=150m&engagement=1.5&sort=followers");
assert.deepEqual(parseSearchState(params), {
  tab: "youtube",
  verifiedOnly: true,
  followers: "150m",
  engagement: "1.5",
  sort: "followers",
});

// ─── Test 4: Tab isolation (youtube tab filters out instagram/tiktok) ─────────
const mixedPairs = [
  makePair("instagram", { username: "insta_user", fullname: "Insta User", followers: 1_000_000 }),
  makePair("youtube", { username: "yt_user", fullname: "YT User", followers: 2_000_000 }),
  makePair("tiktok", { username: "tt_user", fullname: "TT User", followers: 3_000_000 }),
];

const tabResult = filterAndSortProfiles(mixedPairs, "", { ...DEFAULT_SEARCH_STATE, tab: "youtube" });
assert.equal(tabResult.length, 1);
assert.equal(tabResult[0].profile.username, "yt_user");
assert.equal(tabResult[0].platform, "youtube");

// ─── Test 5: verifiedOnly excludes unverified creators ───────────────────────
const verifiedPairs = [
  makePair("instagram", { username: "verified_one", fullname: "Verified One", followers: 500_000, is_verified: true }),
  makePair("instagram", { username: "unverified_two", fullname: "Unverified Two", followers: 800_000, is_verified: false }),
];

const verifiedResult = filterAndSortProfiles(verifiedPairs, "", { ...DEFAULT_SEARCH_STATE, verifiedOnly: true });
assert.equal(verifiedResult.length, 1);
assert.equal(verifiedResult[0].profile.username, "verified_one");

// ─── Test 6: Sort by followers (descending) ───────────────────────────────────
const followerPairs = [
  makePair("youtube", { username: "small", fullname: "Small Creator", followers: 10_000_000 }),
  makePair("youtube", { username: "huge", fullname: "Huge Creator", followers: 500_000_000 }),
  makePair("youtube", { username: "mid", fullname: "Mid Creator", followers: 100_000_000 }),
];

const followerSorted = filterAndSortProfiles(followerPairs, "", { ...DEFAULT_SEARCH_STATE, sort: "followers" });
assert.equal(followerSorted[0].profile.username, "huge");
assert.equal(followerSorted[1].profile.username, "mid");
assert.equal(followerSorted[2].profile.username, "small");

// ─── Test 7: Sort by engagement (descending) ─────────────────────────────────
const engagementPairs = [
  makePair("tiktok", { username: "low_eng", fullname: "Low Engagement", followers: 1_000_000, engagement_rate: 0.005 }),
  makePair("tiktok", { username: "high_eng", fullname: "High Engagement", followers: 500_000, engagement_rate: 0.025 }),
  makePair("tiktok", { username: "mid_eng", fullname: "Mid Engagement", followers: 800_000, engagement_rate: 0.015 }),
];

const engagementSorted = filterAndSortProfiles(engagementPairs, "", { ...DEFAULT_SEARCH_STATE, sort: "engagement" });
assert.equal(engagementSorted[0].profile.username, "high_eng");
assert.equal(engagementSorted[1].profile.username, "mid_eng");
assert.equal(engagementSorted[2].profile.username, "low_eng");

// ─── Test 8: Empty query + default state returns all profiles ─────────────────
const allPairs = [
  makePair("instagram", { username: "a", fullname: "Creator A", followers: 100 }),
  makePair("youtube", { username: "b", fullname: "Creator B", followers: 200 }),
  makePair("tiktok", { username: "c", fullname: "Creator C", followers: 300 }),
];

const emptyQueryResult = filterAndSortProfiles(allPairs, "", DEFAULT_SEARCH_STATE);
assert.equal(emptyQueryResult.length, 3);

console.log("search helpers: ok");