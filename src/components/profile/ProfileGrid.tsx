import { SearchX } from "lucide-react";
import type { Platform, UserProfileSummary } from "@/types";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface ProfileGridProps {
  profiles: UserProfileSummary[];
  platform: Platform;
}

export function ProfileGrid({ profiles, platform }: ProfileGridProps) {
  if (profiles.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="w-6 h-6" />}
        title="No profiles found"
        description="This demo ships with a small sample dataset per platform, so search only matches names within that sample — try clearing the search or switching platforms to browse what's available."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {profiles.map((profile) => (
        <ProfileCard key={profile.user_id} profile={profile} platform={platform} />
      ))}
    </div>
  );
}
