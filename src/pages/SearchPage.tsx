import { useMemo, useState } from "react";
import type { Platform } from "@/types";
import { Layout } from "@/components/layout/Layout";
import { PlatformTabs } from "@/components/search/PlatformTabs";
import { SearchInput } from "@/components/search/SearchInput";
import { ProfileGrid } from "@/components/profile/ProfileGrid";
import { extractProfiles, filterProfiles } from "@/lib/profiles";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export function SearchPage() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 200);

  // Re-computed only when the platform actually changes.
  const allProfiles = useMemo(() => extractProfiles(platform), [platform]);

  // Re-computed only when the debounced query or the platform's profile list changes.
  const filtered = useMemo(
    () => filterProfiles(allProfiles, debouncedQuery),
    [allProfiles, debouncedQuery]
  );

  const handlePlatformChange = (next: Platform) => {
    setPlatform(next);
    setSearchQuery("");
  };

  return (
    <Layout
      title="Find Influencers"
      description="Browse top creators across social platforms and build your shortlist."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <PlatformTabs selected={platform} onChange={handlePlatformChange} />
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Showing {filtered.length} of {allProfiles.length} on {platform}
      </p>

      <ProfileGrid profiles={filtered} platform={platform} />
    </Layout>
  );
}
