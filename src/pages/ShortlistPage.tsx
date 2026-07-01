import { Link } from "react-router-dom";
import { Bookmark, Trash2, ArrowRight, ListX, Download, Calculator, TrendingUp, Users, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useShortlistStore, type ShortlistState } from "@/store/shortlistStore";
import { formatFollowers } from "@/lib/format";
import { getPlatformLabel, getPlatformColor } from "@/lib/platform";
import { getProfileIdentifier } from "@/lib/profiles";
import type { ShortlistEntry, Platform } from "@/types";

const MotionLi = motion.li as any;
const MotionDiv = motion.div as any;

/** Estimations based on industry standard cost per 1,000 followers (CPM) */
const PLATFORM_CPM_RANGES: Record<Platform, { min: number; max: number }> = {
  youtube: { min: 12, max: 30 },     // YouTube commands higher video production rates
  instagram: { min: 8, max: 20 },    // Standard image/story/reels rate
  tiktok: { min: 4, max: 12 },       // High virality, slightly lower follower baseline pricing
};

export function ShortlistPage() {
  const entries = useShortlistStore((s: ShortlistState) => s.entries);
  const remove = useShortlistStore((s: ShortlistState) => s.remove);
  const clear = useShortlistStore((s: ShortlistState) => s.clear);
  const list = Object.values(entries as Record<string, ShortlistEntry>).sort((a, b) => b.addedAt - a.addedAt);

  // ─── Calculator Logic ──────────────────────────────────────────────────────
  const totalFollowers = list.reduce((sum, item) => sum + item.profile.followers, 0);
  
  const profilesWithEng = list.filter((item) => item.profile.engagement_rate !== undefined);
  const avgEngagementRate =
    profilesWithEng.length > 0
      ? profilesWithEng.reduce((sum, item) => sum + (item.profile.engagement_rate ?? 0), 0) / profilesWithEng.length
      : 0;

  // Calculate pricing range based on specific platforms
  const estimatedCost = list.reduce(
    (acc, item) => {
      const range = PLATFORM_CPM_RANGES[item.platform] || { min: 5, max: 15 };
      const thousands = item.profile.followers / 1000;
      return {
        min: acc.min + thousands * range.min,
        max: acc.max + thousands * range.max,
      };
    },
    { min: 0, max: 0 }
  );

  // ─── Export to CSV ─────────────────────────────────────────────────────────
  const exportToCSV = () => {
    if (list.length === 0) return;

    const headers = ["Platform", "Username", "Full Name", "Followers", "Engagement Rate (%)", "Profile Link"];
    const rows = list.map((item) => {
      const engRate = item.profile.engagement_rate
        ? (item.profile.engagement_rate * 100).toFixed(2)
        : "N/A";
      
      return [
        getPlatformLabel(item.platform),
        `@${item.profile.username}`,
        `"${item.profile.fullname.replace(/"/g, '""')}"`, // escape quotes for safety
        item.profile.followers,
        engRate,
        item.profile.url,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Wobb_Shortlist_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Shortlist</h1>
          {/* aria-live region announces count changes to screen readers */}
          <output aria-live="polite" className="text-sm text-slate-500 mt-1 block">
            {list.length > 0
              ? `${list.length} creator${list.length === 1 ? "" : "s"} saved · persists across refreshes`
              : "No creators saved yet"}
          </output>
        </div>

        {list.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:border-violet-400 hover:text-violet-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={clear}
              aria-label="Clear all shortlisted creators"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 cursor-pointer"
            >
              <ListX className="w-3.5 h-3.5" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
            <Bookmark className="w-7 h-7 text-violet-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Nothing saved yet</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Add creators from the search page to build your campaign lineup.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-md shadow-violet-100"
          >
            Browse creators <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Creator list */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {list.map((entry) => {
                const identifier = getProfileIdentifier(entry.profile);
                const color = getPlatformColor(entry.platform);
                return (
                  <MotionLi
                    key={entry.key}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                    className="flex flex-col p-4 rounded-2xl border border-slate-200 bg-white hover:border-violet-200 hover:shadow-md transition-all duration-150"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Link to={`/profile/${identifier}?platform=${entry.platform}`} className="shrink-0">
                        <ProfileAvatar src={entry.profile.picture} name={entry.profile.fullname} />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/profile/${identifier}?platform=${entry.platform}`}
                          className="flex items-center gap-1 font-bold text-slate-900 truncate text-sm hover:text-violet-600 transition-colors"
                        >
                          <span className="truncate">@{entry.profile.username}</span>
                          <VerifiedBadge verified={entry.profile.is_verified} />
                        </Link>
                        <div className="text-xs text-slate-500 truncate">{entry.profile.fullname}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${color}`}>
                            {getPlatformLabel(entry.platform)}
                          </span>
                          <span className="text-xs text-slate-400">{formatFollowers(entry.profile.followers)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(entry.key)}
                        aria-label={`Remove ${entry.profile.fullname} from shortlist`}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </MotionLi>
                );
              })}
            </AnimatePresence>
          </ul>

          {/* Campaign Budget Estimation Card */}
          <MotionDiv
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-xl bg-violet-50 text-violet-600">
                <Calculator className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">Campaign Cost Estimator</h2>
            </div>
            
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Based on the platform configuration of your shortlisted creators, here is an industry-standard estimate for a campaign collaboration.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Total Reach
                </div>
                <div className="text-xl font-black text-slate-800">
                  {formatFollowers(totalFollowers).replace(" followers", "")}
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Combined followers</span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                  Avg Engagement
                </div>
                <div className="text-xl font-black text-slate-800">
                  {avgEngagementRate > 0 ? `${(avgEngagementRate * 100).toFixed(2)}%` : "N/A"}
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Average engagement rate</span>
              </div>

              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-4 border border-violet-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-500 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-violet-500" />
                  Estimated Budget
                </div>
                <div className="text-xl font-black text-violet-700">
                  ${Math.round(estimatedCost.min).toLocaleString()} - ${Math.round(estimatedCost.max).toLocaleString()}
                </div>
                <span className="text-[10px] text-violet-500 block mt-0.5">Influencer cost range</span>
              </div>
            </div>
            
            <div className="mt-5 border-t border-slate-100 pt-4 flex gap-2 items-start text-slate-400 text-[10px] leading-relaxed">
              <span className="font-semibold text-slate-500">Note:</span>
              Estimates are calculated using regional platform CPM variations: YouTube ($12-$30 CPM), Instagram ($8-$20 CPM), and TikTok ($4-$12 CPM). Actual payouts may vary based on content complexity, usage rights, and agent negotiations.
            </div>
          </MotionDiv>
        </div>
      )}
    </Layout>
  );
}
