import { SearchX } from "lucide-react";
import type { Platform, UserProfileSummary } from "@/types";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface ProfileGridProps {
  profiles: { profile: UserProfileSummary; platform: Platform }[];
  showPlatformBadge?: boolean;
}

export function ProfileGrid({ profiles, showPlatformBadge = false }: ProfileGridProps) {
  if (profiles.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="w-6 h-6" />}
        title="No profiles found"
        description="Search filters within the sample dataset. Try clearing the search or switching tabs."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {profiles.map(({ profile, platform }, index) => (
        <ProfileCard
          key={`${platform}-${profile.user_id}`}
          profile={profile}
          platform={platform}
          showPlatformBadge={showPlatformBadge}
          index={index}
        />
      ))}
    </div>
  );
}
