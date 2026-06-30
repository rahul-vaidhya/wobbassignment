import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileDetailSkeleton } from "@/components/ui/Skeleton";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";
import type { FullUserProfile, Platform, ProfileDetailResponse } from "@/types";
import { formatEngagementRate, formatNumber } from "@/lib/format";
import { loadProfileByUsername } from "@/lib/profileLoader";

type LoadState =
  | { status: "success"; username: string; data: ProfileDetailResponse }
  | { status: "not-found"; username: string };

export function ProfileDetailPage() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const platform = (searchParams.get("platform") as Platform | null) ?? "unknown";
  const [state, setState] = useState<LoadState | null>(null);

  useEffect(() => {
    if (!username) return;

    let cancelled = false;
    loadProfileByUsername(username).then((data) => {
      if (cancelled) return; // guard against out-of-order responses
      setState(
        data ? { status: "success", username, data } : { status: "not-found", username }
      );
    });

    return () => {
      cancelled = true;
    };
  }, [username]);

  // Derived (not stored) loading flag: if the loaded result doesn't match
  // the current route param yet, we're still loading it. This avoids
  // calling setState synchronously inside the effect just to flip a
  // "loading" flag (which would otherwise cause stale-data flashes when
  // navigating quickly between two profiles).
  const isLoading = !state || state.username !== username;

  if (!username) {
    return (
      <Layout>
        <p className="text-slate-600">Invalid profile.</p>
        <Link to="/" className="text-violet-600 underline text-sm">
          Back to search
        </Link>
      </Layout>
    );
  }

  if (isLoading || !state) {
    return (
      <Layout title={`@${username}`}>
        <ProfileDetailSkeleton />
      </Layout>
    );
  }

  if (state.status === "not-found") {
    return (
      <Layout title={`@${username}`}>
        <p className="text-red-600 mb-4">
          Could not load profile details for {username}.
        </p>
        <Link to="/" className="text-violet-600 underline text-sm inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to search
        </Link>
      </Layout>
    );
  }

  const user: FullUserProfile = state.data.data.user_profile;

  const stats: { label: string; value: string }[] = [
    { label: "Followers", value: formatNumber(user.followers) },
    { label: "Engagement Rate", value: formatEngagementRate(user.engagement_rate) },
  ];
  if (user.posts_count !== undefined) stats.push({ label: "Posts", value: formatNumber(user.posts_count) });
  if (user.avg_likes !== undefined) stats.push({ label: "Avg Likes", value: formatNumber(user.avg_likes) });
  if (user.avg_comments !== undefined) stats.push({ label: "Avg Comments", value: formatNumber(user.avg_comments) });
  if (user.avg_views !== undefined && user.avg_views > 0) {
    stats.push({ label: "Avg Views", value: formatNumber(user.avg_views) });
  }
  if (user.engagements !== undefined) stats.push({ label: "Engagements", value: formatNumber(user.engagements) });

  return (
    <Layout>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to search
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start text-left">
          <ProfileAvatar src={user.picture} name={user.fullname} sizeClassName="w-24 h-24" />

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
              @{user.username}
              <VerifiedBadge verified={user.is_verified} className="w-5 h-5" />
            </h2>
            <p className="text-slate-600">{user.fullname}</p>
            {platform !== "unknown" && (
              <p className="text-xs text-slate-400 mt-1 capitalize">Platform: {platform}</p>
            )}

            {user.description && (
              <p className="mt-3 text-sm text-slate-700">{user.description}</p>
            )}

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {stats.map((stat) => (
                <div key={stat.label} className="border border-slate-200 rounded-xl p-3">
                  <div className="text-slate-500 text-xs">{stat.label}</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {platform !== "unknown" && (
                <ShortlistButton platform={platform} profile={user} variant="full" />
              )}
              {user.url && (
                <a
                  href={user.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700"
                >
                  View on platform <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
