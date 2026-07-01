import assert from "node:assert/strict";
import { findProfileSummary, getProfileIdentifier, extractProfiles } from "@/lib/profiles";

// ─── Test 1: handle-only profile uses handle as identifier ───────────────────
assert.equal(
  getProfileIdentifier({
    user_id: "handle-only",
    username: "",
    handle: "CreatorHandle",
    url: "https://example.com/creator",
    picture: "https://example.com/avatar.jpg",
    fullname: "Creator Handle",
    is_verified: false,
    followers: 42,
  }),
  "CreatorHandle"
);

// ─── Test 2: findProfileSummary returns a known youtube profile ───────────────
const profile = findProfileSummary("youtube", "MrBeast6000");
assert.equal(profile?.username, "MrBeast6000");
assert.equal(profile && getProfileIdentifier(profile), "MrBeast6000");

// ─── Test 3: findProfileSummary returns null for unknown identifier ───────────
const unknown = findProfileSummary("instagram", "this_user_does_not_exist_xyz");
assert.equal(unknown, null);

// ─── Test 4: extractProfiles never yields an empty username ───────────────────
for (const platform of ["instagram", "youtube", "tiktok"] as const) {
  const profiles = extractProfiles(platform);
  assert.ok(profiles.length > 0, `${platform} should have profiles`);
  for (const p of profiles) {
    assert.ok(
      typeof p.username === "string" && p.username.length > 0,
      `Every ${platform} profile must have a non-empty username, got: "${p.username}" (id: ${p.user_id})`
    );
  }
}

console.log("profile helpers: ok");