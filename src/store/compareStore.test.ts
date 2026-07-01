import assert from "node:assert/strict";
import { makeCompareKey, useCompareStore } from "@/store/compareStore";
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
  useCompareStore.getState().clear();
}

// ─── Test 1: caps at 3, 4th add is silently ignored ──────────────────────────
resetStore();

const first = makeProfile({ username: "alpha", fullname: "Alpha One", followers: 1000 });
const second = makeProfile({ username: "beta", fullname: "Beta Two", followers: 2000 });
const third = makeProfile({ username: "gamma", fullname: "Gamma Three", followers: 3000 });
const fourth = makeProfile({ username: "delta", fullname: "Delta Four", followers: 4000 });

useCompareStore.getState().add("instagram", first);
useCompareStore.getState().add("youtube", second);
useCompareStore.getState().add("tiktok", third);
useCompareStore.getState().add("instagram", fourth); // should be ignored — already at 3

const keys = useCompareStore.getState().entries.map((entry: { key: string }) => entry.key);
assert.deepEqual(keys, [
  makeCompareKey("instagram", first.username),
  makeCompareKey("youtube", second.username),
  makeCompareKey("tiktok", third.username),
]);

// ─── Test 2: isSelected returns true for added entry ─────────────────────────
assert.equal(useCompareStore.getState().isSelected(makeCompareKey("instagram", first.username)), true);

// ─── Test 3: toggle removes entry, isSelected returns false ──────────────────
useCompareStore.getState().toggle("instagram", first);
assert.equal(useCompareStore.getState().isSelected(makeCompareKey("instagram", first.username)), false);

// ─── Test 4: clear empties all entries ───────────────────────────────────────
useCompareStore.getState().clear();
assert.deepEqual(useCompareStore.getState().entries, []);

// ─── Test 5: duplicate add is idempotent (same profile added twice = 1 entry) ─
resetStore();
useCompareStore.getState().add("instagram", first);
useCompareStore.getState().add("instagram", first); // duplicate
assert.equal(useCompareStore.getState().entries.length, 1);

// ─── Test 6: isSelected returns false after remove ────────────────────────────
const keyFirst = makeCompareKey("instagram", first.username);
useCompareStore.getState().remove(keyFirst);
assert.equal(useCompareStore.getState().isSelected(keyFirst), false);
assert.equal(useCompareStore.getState().entries.length, 0);

console.log("compare store: ok");