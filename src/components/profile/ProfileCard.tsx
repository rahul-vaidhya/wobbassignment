import { memo } from "react";
import { useNavigate } from "react-router-dom";
import type { Platform, UserProfileSummary } from "@/types";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";
import { formatFollowers } from "@/lib/format";
import { getProfileIdentifier } from "@/lib/profiles";

interface ProfileCardProps {
  profile: UserProfileSummary;
  platform: Platform;
}

function ProfileCardImpl({ profile, platform }: ProfileCardProps) {
  const navigate = useNavigate();
  const identifier = getProfileIdentifier(profile);

  const handleClick = () => {
    navigate(`/profile/${identifier}?platform=${platform}`, { state: { fromApp: true } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View profile of ${profile.fullname}`}
      className="group flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-violet-300 hover:shadow-md transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
    >
      <ProfileAvatar src={profile.picture} name={profile.fullname} />

      <div className="text-left flex-1 min-w-0">
        <div className="flex items-center gap-1 font-semibold text-slate-900 truncate">
          <span className="truncate">@{profile.username}</span>
          <VerifiedBadge verified={profile.is_verified} />
        </div>
        <div className="text-sm text-slate-500 truncate">{profile.fullname}</div>
        <div className="text-xs text-slate-400 mt-0.5">{formatFollowers(profile.followers)}</div>
      </div>

      <ShortlistButton platform={platform} profile={profile} variant="compact" />
    </div>
  );
}

export const ProfileCard = memo(ProfileCardImpl);
