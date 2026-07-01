export type Platform = "instagram" | "youtube" | "tiktok";
export type TabOption = Platform | "all";

export interface UserProfileSummary {
  user_id: string;
  username: string;
  url: string;
  picture: string;
  fullname: string;
  is_verified: boolean;
  followers: number;
  engagements?: number;
  engagement_rate?: number;
  handle?: string;
  avg_views?: number;
}

export interface SearchAccount {
  account: {
    user_profile: UserProfileSummary;
    audience_source: string;
  };
}

export interface SearchData {
  total: number;
  accounts: SearchAccount[];
}

export interface FullUserProfile extends UserProfileSummary {
  type?: string;
  description?: string;
  is_business?: boolean;
  posts_count?: number;
  avg_likes?: number;
  avg_comments?: number;
  avg_reels_plays?: number;
  gender?: string;
  age_group?: string;
}

export interface ProfileDetailResponse {
  cached?: boolean;
  data: {
    success: boolean;
    user_profile: FullUserProfile;
  };
}

/** An entry persisted in the user's shortlist. */
export interface ShortlistEntry {
  /** Stable unique key: `${platform}:${profile identifier}` */
  key: string;
  platform: Platform;
  profile: UserProfileSummary;
  addedAt: number;
}

export interface CompareEntry {
  /** Stable unique key: `${platform}:${profile identifier}` */
  key: string;
  platform: Platform;
  profile: UserProfileSummary;
  addedAt: number;
}
