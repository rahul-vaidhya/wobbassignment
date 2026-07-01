import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Zap } from "lucide-react";
import type { Platform } from "@/types";
import { Layout } from "@/components/layout/Layout";
import { PlatformTabs } from "@/components/search/PlatformTabs";
import { SearchInput } from "@/components/search/SearchInput";
import { ProfileGrid } from "@/components/profile/ProfileGrid";
import { extractProfiles, filterProfiles } from "@/lib/profiles";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const STATS = [
  { icon: Users, label: "Sample Creators", value: "30" },
  { icon: TrendingUp, label: "Platforms", value: "3" },
  { icon: Zap, label: "Instant Filter", value: "Live" },
];

export function SearchPage() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 200);

  const allProfiles = useMemo(() => extractProfiles(platform), [platform]);
  const filtered = useMemo(
    () => filterProfiles(allProfiles, debouncedQuery),
    [allProfiles, debouncedQuery]
  );

  const handlePlatformChange = (next: Platform) => {
    setPlatform(next);
    setSearchQuery("");
  };

  return (
    <Layout>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-6 py-10 sm:px-10 sm:py-12 mb-8 shadow-xl shadow-violet-100">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-violet-200 text-sm font-semibold uppercase tracking-widest mb-2">Influencer Discovery</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Find the right<br />creator for your brand
          </h1>
          <p className="text-violet-200 text-sm max-w-md">
            Browse top creators across Instagram, YouTube, and TikTok. Add them to your shortlist and build your campaign lineup.
          </p>
        </motion.div>

        {/* Stat pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap gap-3 mt-6"
        >
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5">
              <Icon className="w-3.5 h-3.5 text-violet-200" />
              <span className="text-white font-bold text-sm">{value}</span>
              <span className="text-violet-200 text-xs">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <PlatformTabs selected={platform} onChange={handlePlatformChange} />
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      <p className="text-xs text-slate-400 mb-5">
        Showing <span className="font-medium text-slate-600">{filtered.length}</span> of {allProfiles.length} creators on {platform} — search filters within this sample dataset.
      </p>

      <ProfileGrid profiles={filtered} platform={platform} />
    </Layout>
  );
}
