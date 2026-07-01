import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { History, Moon, RefreshCcw, Sun, Users, TrendingUp, Zap } from "lucide-react";
import type { Platform, TabOption, UserProfileSummary } from "@/types";
import { Layout } from "@/components/layout/Layout";
import { PlatformTabs } from "@/components/search/PlatformTabs";
import { SearchInput } from "@/components/search/SearchInput";
import { ProfileGrid } from "@/components/profile/ProfileGrid";
import { extractProfiles, extractAllProfiles } from "@/lib/profiles";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { DEFAULT_SEARCH_STATE, buildSearchParams, filterAndSortProfiles, parseSearchState, type SearchSort, type FollowerFilter, type EngagementFilter, type SearchUiState } from "@/lib/search";
import {
  addRecentSearch,
  getRecentSearches,
  getRecentViewedProfiles,
  type RecentViewedProfile,
} from "@/lib/history";
import { getPlatformLabel } from "@/lib/platform";

const STATS = [
  { icon: Users, label: "Sample Creators", value: "30" },
  { icon: TrendingUp, label: "Platforms", value: "3" },
  { icon: Zap, label: "Instant Filter", value: "Live" },
];

const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "followers", label: "Followers" },
  { value: "engagement", label: "Engagement" },
];

const FOLLOWER_OPTIONS: { value: FollowerFilter; label: string }[] = [
  { value: "all", label: "All creators" },
  { value: "75m", label: "75M+" },
  { value: "100m", label: "100M+" },
  { value: "150m", label: "150M+" },
  { value: "250m", label: "250M+" },
  { value: "400m", label: "400M+" },
  { value: "600m", label: "600M+" },
];

const ENGAGEMENT_OPTIONS: { value: EngagementFilter; label: string }[] = [
  { value: "all", label: "Any engagement" },
  { value: "0.25", label: "0.25%+" },
  { value: "0.5", label: "0.5%+" },
  { value: "0.75", label: "0.75%+" },
  { value: "1", label: "1%+" },
  { value: "1.25", label: "1.25%+" },
  { value: "1.5", label: "1.5%+" },
  { value: "1.75", label: "1.75%+" },
  { value: "2", label: "2%+" },
];

function ControlsLabel({ children }: { children: ReactNode }) {
  return <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{children}</span>;
}

function filterPairs(
  pairs: { profile: UserProfileSummary; platform: Platform }[],
  query: string,
  state: SearchUiState
) {
  return filterAndSortProfiles(pairs, query, state);
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialState = useMemo(() => parseSearchState(searchParams), [searchParams]);
  const [tab, setTab] = useState<TabOption>(initialState.tab);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const debouncedQuery = useDebouncedValue(searchQuery, 200);
  const [followers, setFollowers] = useState<FollowerFilter>(initialState.followers);
  const [engagement, setEngagement] = useState<EngagementFilter>(initialState.engagement);
  const [sort, setSort] = useState<SearchSort>(initialState.sort);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches());
  const [recentViews, setRecentViews] = useState<RecentViewedProfile[]>(() => getRecentViewedProfiles());
  const [searchFocused, setSearchFocused] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem("wobb-theme") === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("wobb-theme", theme);
  }, [theme]);

  const allPairs = useMemo(() => extractAllProfiles(), []);

  const pairs = useMemo(() => {
    const base =
      tab === "all"
        ? allPairs
        : extractProfiles(tab as Platform).map((profile) => ({ profile, platform: tab as Platform }));
    return filterPairs(base, debouncedQuery, { tab, verifiedOnly: false, followers, engagement, sort });
  }, [tab, allPairs, debouncedQuery, followers, engagement, sort]);

  const activeFilters = useMemo(
    () => ({ tab, verifiedOnly: false, followers, engagement, sort }),
    [tab, followers, engagement, sort]
  );

  useEffect(() => {
    const nextParams = buildSearchParams(debouncedQuery, activeFilters);
    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [activeFilters, debouncedQuery, searchParams, setSearchParams]);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      return;
    }
    setRecentSearches(addRecentSearch(debouncedQuery));
  }, [debouncedQuery]);

  useEffect(() => {
    setRecentViews(getRecentViewedProfiles());
  }, []);

  const resetFilters = () => {
    setTab(DEFAULT_SEARCH_STATE.tab);
    setFollowers(DEFAULT_SEARCH_STATE.followers);
    setEngagement(DEFAULT_SEARCH_STATE.engagement);
    setSort(DEFAULT_SEARCH_STATE.sort);
    setSearchQuery("");
  };

  const handleTabChange = (next: TabOption) => {
    setTab(next);
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  const isDark = theme === "dark";

  return (
    <Layout>
      {/* Hero */}
      <div className={`relative overflow-hidden rounded-2xl px-6 py-10 sm:px-10 sm:py-12 mb-8 shadow-xl ${isDark ? "bg-slate-900 shadow-slate-950/30" : "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 shadow-violet-100"}`}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className={`text-sm font-semibold uppercase tracking-widest mb-2 ${isDark ? "text-slate-300" : "text-violet-200"}`}>
            Influencer Discovery
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Find the right<br />creator for your brand
          </h1>
          <p className={`text-sm max-w-md ${isDark ? "text-slate-300" : "text-violet-200"}`}>
            Browse top creators across Instagram, YouTube, and TikTok. Add them to your shortlist and build your campaign lineup.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap gap-3 mt-6"
        >
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} className={`flex items-center gap-2 backdrop-blur-sm rounded-xl px-3 py-1.5 ${isDark ? "bg-white/10" : "bg-white/15"}`}>
              <Icon className={`w-3.5 h-3.5 ${isDark ? "text-slate-300" : "text-violet-200"}`} />
              <span className="text-white font-bold text-sm">{value}</span>
              <span className={`text-xs ${isDark ? "text-slate-300" : "text-violet-200"}`}>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mb-4 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3">
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex flex-col lg:flex-row lg:items-start gap-3">
              <PlatformTabs selected={tab} onChange={handleTabChange} />

              <div className="relative flex-1 min-w-0">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                  className={`max-w-none ${isDark ? "[&_*]:border-slate-700" : ""}`}
                />

                {searchFocused && recentSearches.length > 0 && (
                  <div className={`absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border p-3 shadow-lg ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
                      <History className="w-3.5 h-3.5" aria-hidden="true" />
                      Recent searches
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setSearchQuery(item)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${isDark ? "border-slate-700 bg-slate-800 text-slate-200 hover:border-violet-400 hover:text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-300 hover:text-violet-700"}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${isDark ? "border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500" : "border-slate-300 bg-white text-slate-700 hover:border-violet-300 hover:text-violet-700"}`}
              >
                {isDark ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
                {isDark ? "Light mode" : "Dark mode"}
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className={`flex flex-col gap-2 rounded-xl border px-4 py-3 shadow-sm ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
                <ControlsLabel>Sort</ControlsLabel>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SearchSort)}
                  className={`bg-transparent text-sm font-medium focus:outline-none ${isDark ? "text-slate-100" : "text-slate-900"}`}
                  aria-label="Sort creators"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={`flex flex-col gap-2 rounded-xl border px-4 py-3 shadow-sm ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
                <ControlsLabel>Followers</ControlsLabel>
                <select
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value as FollowerFilter)}
                  className={`bg-transparent text-sm font-medium focus:outline-none ${isDark ? "text-slate-100" : "text-slate-900"}`}
                  aria-label="Filter by follower count"
                >
                  {FOLLOWER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={`flex flex-col gap-2 rounded-xl border px-4 py-3 shadow-sm ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
                <ControlsLabel>Engagement</ControlsLabel>
                <select
                  value={engagement}
                  onChange={(e) => setEngagement(e.target.value as EngagementFilter)}
                  className={`bg-transparent text-sm font-medium focus:outline-none ${isDark ? "text-slate-100" : "text-slate-900"}`}
                  aria-label="Filter by engagement rate"
                >
                  {ENGAGEMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 xl:items-end xl:min-w-40">
            <button
              type="button"
              onClick={resetFilters}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${isDark ? "border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900"}`}
            >
              <RefreshCcw className="w-4 h-4" aria-hidden="true" />
              Reset filters
            </button>
          </div>
        </div>

        {recentViews.length > 0 && (
          <div className={`flex flex-col gap-2 rounded-2xl border px-4 py-3 shadow-sm ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Recently viewed
            </div>
            <div className="flex flex-wrap gap-2">
              {recentViews.map((item) => (
                <Link
                  key={`${item.platform}:${item.username}`}
                  to={`/profile/${item.username}?platform=${item.platform}`}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${isDark ? "border-slate-700 bg-slate-800 text-slate-200 hover:border-violet-400 hover:text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-300 hover:text-violet-700"}`}
                >
                  <span className="max-w-40 truncate">@{item.username}</span>
                  <span className="text-slate-400">·</span>
                  <span>{getPlatformLabel(item.platform)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 mb-5" role="status" aria-live="polite">
        Showing <span className="font-medium text-slate-600">{pairs.length}</span> creator{pairs.length !== 1 ? "s" : ""}
        {tab !== "all" ? ` on ${tab}` : " across all platforms"}
        {followers !== "all" ? ` · ${followers}+ followers` : ""}
        {engagement !== "all" ? ` · ${engagement}%+ engagement` : ""}
        {sort !== "relevance" ? ` · sorted by ${sort}` : ""}
        . Search filters within this sample dataset.
      </p>

      <ProfileGrid profiles={pairs} showPlatformBadge={tab === "all"} />
    </Layout>
  );
}
