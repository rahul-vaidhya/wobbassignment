import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileDetailSkeleton } from "@/components/ui/Skeleton";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";
import type { FullUserProfile, Platform, ProfileDetailResponse, UserProfileSummary } from "@/types";
import { formatEngagementRate, formatNumber } from "@/lib/format";
import { loadProfileByUsername } from "@/lib/profileLoader";
import { findProfileSummary } from "@/lib/profiles";
import { getPlatformLabel, getPlatformColor } from "@/lib/platform";

type LoadState =
  | { status: "success"; username: string; data: ProfileDetailResponse; isSummaryOnly: false }
  | { status: "success"; username: string; data: ProfileDetailResponse; isSummaryOnly: true }
  | { status: "not-found"; username: string };

function wrapSummaryAsDetail(summary: UserProfileSummary): ProfileDetailResponse {
  return {
    data: {
      success: true,
      user_profile: summary as FullUserProfile,
    },
  };
}

export function ProfileDetailPage() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cameFromApp = Boolean((location.state as { fromApp?: boolean } | null)?.fromApp);
  const platform = (searchParams.get("platform") as Platform | null) ?? "unknown";
  const [state, setState] = useState<LoadState | null>(null);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    loadProfileByUsername(username).then((data) => {
      if (cancelled) return;
      if (data) {
        setState({ status: "success", username, data, isSummaryOnly: false });
        return;
      }
      const summary = platform !== "unknown" ? findProfileSummary(platform, username) : null;
      if (summary) {
        setState({ status: "success", username, data: wrapSummaryAsDetail(summary), isSummaryOnly: true });
      } else {
        setState({ status: "not-found", username });
      }
    });
    return () => { cancelled = true; };
  }, [username, platform]);

  const isLoading = !state || state.username !== username;

  const handleBack = () => {
    if (cameFromApp) navigate(-1);
    else navigate("/");
  };

  if (!username) {
    return (
      <Layout>
        <p className="text-slate-600">Invalid profile.</p>
        <Link to="/" className="text-violet-600 underline text-sm">Back to search</Link>
      </Layout>
    );
  }

  if (isLoading || !state) {
    return <Layout><ProfileDetailSkeleton /></Layout>;
  }

  if (state.status === "not-found") {
    return (
      <Layout>
        <button onClick={handleBack} className="inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to search
        </button>
        <p className="text-red-600 mb-2">Profile not found in the sample dataset.</p>
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
  if (user.avg_views !== undefined && user.avg_views > 0) stats.push({ label: "Avg Views", value: formatNumber(user.avg_views) });
  if (user.engagements !== undefined) stats.push({ label: "Engagements", value: formatNumber(user.engagements) });

  const platformColor = platform !== "unknown" ? getPlatformColor(platform) : "";

  return (
    <Layout>
      <button onClick={handleBack} className="inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to search
      </button>

      {state.isSummaryOnly && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Showing summary data — full profile details aren't in the sample dataset.</span>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
      >
        {/* Gradient banner */}
        <div className="h-16 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

        <div className="px-6 pb-6">
          {/* Avatar overlapping banner */}
          <div className="flex items-end justify-between -mt-8 mb-4 relative z-10">
            <div className="ring-4 ring-white rounded-full bg-white">
              <ProfileAvatar src={user.picture} name={user.fullname} sizeClassName="w-20 h-20" />
            </div>
            {platform !== "unknown" && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${platformColor}`}>
                {getPlatformLabel(platform)}
              </span>
            )}
          </div>

          {/* Name + handle */}
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5 tracking-tight">
              {user.fullname}
              <VerifiedBadge verified={user.is_verified} className="w-5 h-5" />
            </h2>
            <p className="text-slate-500 text-sm">@{user.username}</p>
            {user.description && (
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">{user.description}</p>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-slate-50 rounded-xl px-4 py-3"
              >
                <div className="text-xs text-slate-400 mb-0.5">{stat.label}</div>
                <div className="font-bold text-slate-900">{stat.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {platform !== "unknown" && (
              <ShortlistButton platform={platform} profile={user} variant="full" />
            )}
            {user.url && (
              <a
                href={user.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl hover:border-violet-400 hover:text-violet-700 transition-colors"
              >
                View on platform <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
