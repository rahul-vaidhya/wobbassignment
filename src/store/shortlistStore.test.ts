import assert from "node:assert/strict";
import { makeShortlistKey, useShortlistStore } from "@/store/shortlistStore";
import type { UserProfileSummary } from "@/types";

function makeProfile(overrides: Partial<UserProfileSummary> & { username: string; fullname: string; followers: number }): UserProfileSummary {
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

function resetStore() {
  window.localStorage.clear();
  useShortlistStore.getState().clear();
}

// ─── Test 1: add deduplicates ─────────────────────────────────────────────────
resetStore();

const profile = makeProfile({ username: "alpha", fullname: "Alpha One", followers: 1000 });
const key = makeShortlistKey("instagram", profile.username);

useShortlistStore.getState().add("instagram", profile);
useShortlistStore.getState().add("instagram", profile); // duplicate — should be ignored

assert.deepEqual(Object.keys(useShortlistStore.getState().entries), [key]);

// ─── Test 2: persists to localStorage ────────────────────────────────────────
const persisted = JSON.parse(window.localStorage.getItem("wobb-shortlist") ?? "{}");
assert.ok(persisted.state.entries[key]);

// ─── Test 3: toggle removes existing entry ────────────────────────────────────
useShortlistStore.getState().toggle("instagram", profile);

assert.deepEqual(useShortlistStore.getState().entries, {});
assert.equal(useShortlistStore.getState().isShortlisted(key), false);

// ─── Test 4: remove on a missing key is a no-op ──────────────────────────────
useShortlistStore.getState().remove(key);
assert.deepEqual(useShortlistStore.getState().entries, {});

// ─── Test 5: isShortlisted returns true immediately after add ─────────────────
resetStore();
const profile2 = makeProfile({ username: "beta", fullname: "Beta Two", followers: 2000 });
const key2 = makeShortlistKey("youtube", profile2.username);

useShortlistStore.getState().add("youtube", profile2);
assert.equal(useShortlistStore.getState().isShortlisted(key2), true);

// ─── Test 6: clear removes all entries and isShortlisted returns false ────────
const profile3 = makeProfile({ username: "gamma", fullname: "Gamma Three", followers: 3000 });
const key3 = makeShortlistKey("tiktok", profile3.username);

useShortlistStore.getState().add("tiktok", profile3);
assert.equal(Object.keys(useShortlistStore.getState().entries).length, 2); // beta + gamma

useShortlistStore.getState().clear();
assert.deepEqual(useShortlistStore.getState().entries, {});
assert.equal(useShortlistStore.getState().isShortlisted(key2), false);
assert.equal(useShortlistStore.getState().isShortlisted(key3), false);

console.log("shortlist store: ok");