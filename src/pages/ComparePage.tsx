import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Bookmark, Trash2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useCompareStore } from "@/store/compareStore";
import { formatEngagementRate, formatFollowers, formatNumber } from "@/lib/format";
import { getPlatformLabel, getPlatformColor } from "@/lib/platform";
import { getProfileIdentifier } from "@/lib/profiles";
import type { FullUserProfile } from "@/types";

const METRICS: { label: string; key: keyof FullUserProfile | "engagement_rate"; format?: (value: number) => string }[] = [
  { label: "Followers", key: "followers", format: formatFollowers },
  { label: "Engagement rate", key: "engagement_rate", format: formatEngagementRate },
  { label: "Posts", key: "posts_count", format: formatNumber },
  { label: "Avg views", key: "avg_views", format: formatNumber },
  { label: "Avg likes", key: "avg_likes", format: formatNumber },
  { label: "Avg comments", key: "avg_comments", format: formatNumber },
  { label: "Engagements", key: "engagements", format: formatNumber },
];

function MetricValue({ value, format }: { value: unknown; format?: (value: number) => string }) {
  if (typeof value !== "number") {
    return <span className="text-slate-400">-</span>;
  }
  return <span>{format ? format(value) : value}</span>;
}

export function ComparePage() {
  const entries = useCompareStore((state) => state.entries);
  const remove = useCompareStore((state) => state.remove);
  const clear = useCompareStore((state) => state.clear);

  return (
    <Layout>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Compare Creators</h1>
          <p className="text-sm text-slate-500 mt-1">
            {entries.length > 0
              ? `${entries.length} selected · compare up to 3 creators side by side`
              : "Select 2 to 3 creators from search results to compare them here"}
          </p>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear comparison
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-slate-200 bg-white">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
            <BarChart3 className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Nothing to compare yet</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">
            Pick creators from the search page using the Compare button on their cards.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-md shadow-violet-100"
          >
            Browse creators <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {entries.map((entry) => {
              const identifier = getProfileIdentifier(entry.profile);
              const color = getPlatformColor(entry.platform);
              return (
                <section key={entry.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <Link to={`/profile/${identifier}?platform=${entry.platform}`} className="flex items-start gap-3 min-w-0">
                      <ProfileAvatar src={entry.profile.picture} name={entry.profile.fullname} sizeClassName="w-16 h-16" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate">
                          <span className="truncate">@{entry.profile.username}</span>
                          <VerifiedBadge verified={entry.profile.is_verified} />
                        </div>
                        <div className="text-sm text-slate-500 truncate">{entry.profile.fullname}</div>
                        <span className={`inline-flex mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
                          {getPlatformLabel(entry.platform)}
                        </span>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(entry.key)}
                      className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      aria-label={`Remove ${entry.profile.fullname} from comparison`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <div className="text-xs text-slate-400">Followers</div>
                      <div className="font-bold text-slate-900">{formatFollowers(entry.profile.followers).replace(" followers", "")}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <div className="text-xs text-slate-400">Engagement</div>
                      <div className="font-bold text-slate-900">{formatEngagementRate(entry.profile.engagement_rate)}</div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          {entries.length >= 2 && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid" style={{ gridTemplateColumns: `220px repeat(${entries.length}, minmax(0, 1fr))` }}>
                    <div className="bg-slate-50 px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">Metric</div>
                    {entries.map((entry) => (
                      <div key={entry.key} className="bg-slate-50 px-4 py-3 font-semibold text-slate-700 border-b border-slate-200 truncate">
                        @{entry.profile.username}
                      </div>
                    ))}

                    {METRICS.map((metric) => (
                      <Fragment key={metric.label}>
                        <div key={`${metric.label}-label`} className="px-4 py-3 border-b border-slate-100 text-sm font-medium text-slate-600">
                          {metric.label}
                        </div>
                        {entries.map((entry) => {
                          const profile = entry.profile as Partial<FullUserProfile>;
                          return (
                            <div key={`${entry.key}-${String(metric.key)}`} className="px-4 py-3 border-b border-slate-100 text-sm text-slate-900">
                              <MetricValue value={profile[metric.key]} format={metric.format} />
                            </div>
                          );
                        })}
                      </Fragment>
                    ))}

                    <div className="bg-slate-50 px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">Profile link</div>
                    {entries.map((entry) => (
                      <div key={`${entry.key}-link`} className="px-4 py-3 border-b border-slate-100 text-sm">
                        <Link
                          to={`/profile/${getProfileIdentifier(entry.profile)}?platform=${entry.platform}`}
                          className="inline-flex items-center gap-1.5 text-violet-600 font-medium hover:text-violet-700"
                        >
                          View profile <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {entries.length === 1 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
              <Bookmark className="w-4 h-4 shrink-0" />
              Select one more creator to unlock the side-by-side comparison table.
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
