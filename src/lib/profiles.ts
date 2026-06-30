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
