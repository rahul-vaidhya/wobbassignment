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
        description="This demo uses a fixed sample dataset — search filters within those profiles only. Try clearing the search or switching platforms."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {profiles.map((profile, index) => (
        <ProfileCard
          key={`${platform}-${profile.user_id}`}
          profile={profile}
          platform={platform}
          index={index}
        />
      ))}
    </div>
  );
}
