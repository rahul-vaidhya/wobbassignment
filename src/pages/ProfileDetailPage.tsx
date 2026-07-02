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
import { addRecentViewedProfile } from "@/lib/history";

const MotionDiv = motion.div as any;

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
  const user = state?.status === "success" ? state.data.data.user_profile : null;

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

    return () => {
      cancelled = true;
    };
  }, [username, platform]);

  useEffect(() => {
    if (!user || platform === "unknown") {
      return;
    }

    addRecentViewedProfile({
      platform,
      username: user.username,
      fullname: user.fullname,
    });
  }, [platform, user?.fullname, user?.username]);

  const isLoading = !state || state.username !== username;

  const handleBack = () => {
    if (cameFromApp) navigate(-1);
    else navigate("/");
  };

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
      <Layout>
        <ProfileDetailSkeleton />
      </Layout>
    );
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

  const detailedUser = user as FullUserProfile;
  const stats: { label: string; value: string }[] = [
    { label: "Followers", value: formatNumber(detailedUser.followers) },
    { label: "Engagement Rate", value: formatEngagementRate(detailedUser.engagement_rate) },
  ];

  if (detailedUser.posts_count !== undefined) stats.push({ label: "Posts", value: formatNumber(detailedUser.posts_count) });
  if (detailedUser.avg_likes !== undefined) stats.push({ label: "Avg Likes", value: formatNumber(detailedUser.avg_likes) });
  if (detailedUser.avg_comments !== undefined) stats.push({ label: "Avg Comments", value: formatNumber(detailedUser.avg_comments) });
  if (detailedUser.avg_views !== undefined && detailedUser.avg_views > 0) stats.push({ label: "Avg Views", value: formatNumber(detailedUser.avg_views) });
  if (detailedUser.engagements !== undefined) stats.push({ label: "Engagements", value: formatNumber(detailedUser.engagements) });

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

      <MotionDiv
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="h-16 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-4 relative z-10">
            <div className="ring-4 ring-white rounded-full bg-white">
              <ProfileAvatar src={detailedUser.picture} name={detailedUser.fullname} sizeClassName="w-20 h-20" />
            </div>
            {platform !== "unknown" && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${platformColor}`}>
                {getPlatformLabel(platform)}
              </span>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5 tracking-tight">
              {detailedUser.fullname}
              <VerifiedBadge verified={detailedUser.is_verified} className="w-5 h-5" />
            </h2>
            <p className="text-slate-500 text-sm">@{detailedUser.username}</p>
            {detailedUser.description && (
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">{detailedUser.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {stats.map((stat, i) => (
              <MotionDiv
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-slate-50 rounded-xl px-4 py-3"
              >
                <div className="text-xs text-slate-400 mb-0.5">{stat.label}</div>
                <div className="font-bold text-slate-900">{stat.value}</div>
              </MotionDiv>
            ))}
          </div>

          {/* Pricing Estimation Section */}
          {platform !== "unknown" && (
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-violet-50/50 to-indigo-50/50 rounded-2xl p-4 border border-violet-100/70 mb-6"
            >
              <div className="flex items-center gap-2 mb-2 text-violet-700 font-bold text-sm">
                <Coins className="w-4 h-4" />
                <span>Estimated Sponsorship Cost</span>
              </div>
              <div className="text-2xl font-black text-violet-900 mb-1">
                ${Math.round((detailedUser.followers / 1000) * (platform === "youtube" ? 12 : platform === "instagram" ? 8 : 4)).toLocaleString()} - ${Math.round((detailedUser.followers / 1000) * (platform === "youtube" ? 30 : platform === "instagram" ? 20 : 12)).toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Calculated using market standard CPM rates for {getPlatformLabel(platform)} (${platform === "youtube" ? "12-$30" : platform === "instagram" ? "8-$20" : "4-$12"} per 1,000 followers). Actual cost may vary depending on content complexity and agent negotiation.
              </p>
            </MotionDiv>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {platform !== "unknown" && (
              <ShortlistButton platform={platform} profile={detailedUser} variant="full" />
            )}
            {detailedUser.url && (
              <a
                href={detailedUser.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl hover:border-violet-400 hover:text-violet-700 transition-colors"
              >
                View on platform <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </MotionDiv>
    </Layout>
  );
}
