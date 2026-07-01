import instagramData from "@/assets/data/search/instagram.json";
import youtubeData from "@/assets/data/search/youtube.json";
import tiktokData from "@/assets/data/search/tiktok.json";
import type { Platform, SearchData, UserProfileSummary } from "@/types";

const PLATFORMS: Platform[] = ["instagram", "youtube", "tiktok"];

const platformData: Record<Platform, SearchData> = {
  instagram: instagramData as SearchData,
  youtube: youtubeData as SearchData,
  tiktok: tiktokData as SearchData,
};

export function getSearchData(platform: Platform): SearchData {
  return platformData[platform];
}

/**
 * A handful of sample records (mostly on YouTube) are missing `username`
 * and only carry a `handle`. Routing and rendering both assume `username`
 * exists, so we normalise it once here instead of leaking `undefined`
 * into the UI (which used to render "@undefined" and a dead profile link).
 */
export function extractProfiles(platform: Platform): UserProfileSummary[] {
  const data = getSearchData(platform);
  return data.accounts.map((item) => {
    const profile = item.account.user_profile;
    return {
      ...profile,
      username: profile.username || profile.handle || profile.user_id,
    };
  });
}

/** Returns a stable identifier to use in routes / React keys. */
export function getProfileIdentifier(profile: UserProfileSummary): string {
  return profile.username || profile.handle || profile.user_id;
}

export function filterProfiles(
  profiles: UserProfileSummary[],
  query: string
): UserProfileSummary[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return profiles;

  return profiles.filter((p) => {
    const matchUsername = p.username.toLowerCase().includes(normalized);
    const matchFullname = p.fullname.toLowerCase().includes(normalized);
    return matchUsername || matchFullname;
  });
}

/**
 * The sample dataset only ships a handful of full detail JSON files
 * (see `profileLoader.ts`); most of the profiles surfaced in search are
 * summary-only. Rather than dead-ending those profiles with a
 * "could not load" error, the detail page falls back to this summary
 * record (already present in the search payload) so every profile in
 * the list is actually viewable.
 */
export function findProfileSummary(
  platform: Platform,
  identifier: string
): UserProfileSummary | null {
  const profiles = extractProfiles(platform);
  return (
    profiles.find((p) => getProfileIdentifier(p) === identifier) ?? null
  );
}

/** Returns all profiles across every platform, each tagged with its platform. */
export function extractAllProfiles(): { profile: UserProfileSummary; platform: Platform }[] {
  return PLATFORMS.flatMap((platform) =>
    extractProfiles(platform).map((profile) => ({ profile, platform }))
  );
}
