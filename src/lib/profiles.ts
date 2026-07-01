import instagramData from "@/assets/data/search/instagram.json";
import youtubeData from "@/assets/data/search/youtube.json";
import tiktokData from "@/assets/data/search/tiktok.json";
import type { Platform, SearchData, UserProfileSummary } from "@/types";

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

/**
 * Looks up a profile summary by its route identifier across all three
 * platforms' sample search lists. Used as a fallback on the detail page
 * when no matching full-detail JSON file exists in
 * `assets/data/profiles/` (only 6 of the 30 sample accounts have one) —
 * so we can still show *something* instead of a dead "not found" page.
 */
export function findProfileSummary(
  identifier: string
): { platform: Platform; profile: UserProfileSummary } | null {
  const platforms: Platform[] = ["instagram", "youtube", "tiktok"];
  for (const platform of platforms) {
    const match = extractProfiles(platform).find(
      (p) => getProfileIdentifier(p) === identifier
    );
    if (match) return { platform, profile: match };
  }
  return null;
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
