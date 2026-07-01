import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Platform, UserProfileSummary } from "@/types";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";
import { formatFollowers, formatEngagementRate } from "@/lib/format";
import { getProfileIdentifier } from "@/lib/profiles";
import { getPlatformLabel, renderPlatformIcon } from "@/lib/platform";
import { getCreatorGradient } from "@/lib/creatorColor";
import { useCompareStore } from "@/store/compareStore";
import { GitCompareArrows } from "lucide-react";

interface ProfileCardProps {
  profile: UserProfileSummary;
  platform: Platform;
  showPlatformBadge?: boolean;
  index?: number;
}

function ProfileCardImpl({ profile, platform, showPlatformBadge = false, index = 0 }: ProfileCardProps) {
  const navigate = useNavigate();
  const identifier = getProfileIdentifier(profile);
  const gradient = getCreatorGradient(profile.username);
  const key = `${platform}:${identifier}`;
  const isCompared = useCompareStore((s) => s.isSelected(key));
  const toggleCompare = useCompareStore((s) => s.toggle);

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px -8px rgba(0,0,0,0.12)" }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View profile of ${profile.fullname}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 overflow-hidden transition-colors duration-150 hover:border-slate-300"
    >
      {/* Unique gradient banner per creator */}
      <div className="h-9 w-full relative shrink-0" style={{ background: gradient }}>
        {/* Platform badge — only shown on the All tab */}
        {showPlatformBadge && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {renderPlatformIcon(platform, "w-3 h-3")}
            {getPlatformLabel(platform)}
          </span>
        )}
      </div>

      <div className="px-4 pb-4 flex flex-col flex-1">
        {/* Avatar overlapping banner */}
        <div className="-mt-5 mb-2 relative z-10">
          <div className="ring-2 ring-white rounded-full inline-block bg-white">
            <ProfileAvatar src={profile.picture} name={profile.fullname} sizeClassName="w-12 h-12" />
          </div>
        </div>

        {/* Name */}
        <div className="flex items-center gap-1 font-bold text-slate-900 truncate text-sm mb-0.5">
          <span className="truncate">@{profile.username}</span>
          <VerifiedBadge verified={profile.is_verified} />
        </div>
        <div className="text-xs text-slate-500 truncate mb-3">{profile.fullname}</div>

        {/* Stats */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-slate-50 rounded-xl px-2.5 py-2">
            <div className="text-xs text-slate-400">Followers</div>
            <div className="text-sm font-bold text-slate-900">
              {formatFollowers(profile.followers).replace(" followers", "")}
            </div>
          </div>
          {profile.engagement_rate !== undefined && (
            <div className="flex-1 bg-slate-50 rounded-xl px-2.5 py-2">
              <div className="text-xs text-slate-400">Engagement</div>
              <div className="text-sm font-bold text-slate-900">
                {formatEngagementRate(profile.engagement_rate)}
              </div>
            </div>
          )}
        </div>

        {/* Add to list */}
        <div className="mt-auto grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
          <ShortlistButton platform={platform} profile={profile} variant="compact" className="w-full justify-center" />
          <button
            type="button"
            onClick={() => toggleCompare(platform, profile)}
            aria-pressed={isCompared}
            aria-label={isCompared ? `Remove ${profile.fullname} from compare` : `Add ${profile.fullname} to compare`}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-violet-500 ${
              isCompared
                ? "border-violet-600 bg-violet-600 text-white hover:bg-violet-700"
                : "border-slate-300 bg-white text-slate-700 hover:border-violet-400 hover:text-violet-700"
            }`}
          >
            <GitCompareArrows className="w-4 h-4" aria-hidden="true" />
            {isCompared ? "Compared" : "Compare"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export const ProfileCard = memo(ProfileCardImpl);
