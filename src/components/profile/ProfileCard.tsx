import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Platform, UserProfileSummary } from "@/types";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";
import { formatFollowers, formatEngagementRate } from "@/lib/format";
import { getProfileIdentifier } from "@/lib/profiles";
import { getPlatformColor } from "@/lib/platform";

interface ProfileCardProps {
  profile: UserProfileSummary;
  platform: Platform;
  index?: number;
}

function ProfileCardImpl({ profile, platform, index = 0 }: ProfileCardProps) {
  const navigate = useNavigate();
  const identifier = getProfileIdentifier(profile);
  const platformColor = getPlatformColor(platform);

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
      whileHover={{ y: -2, boxShadow: "0 8px 30px -8px rgba(124,58,237,0.18)" }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View profile of ${profile.fullname}`}
      className="group flex flex-col p-4 rounded-2xl border border-slate-200 bg-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors duration-150 hover:border-violet-200"
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        <ProfileAvatar src={profile.picture} name={profile.fullname} />
        <div className="flex-1 min-w-0 mt-0.5">
          <div className="flex items-center gap-1 font-bold text-slate-900 truncate text-sm">
            <span className="truncate">@{profile.username}</span>
            <VerifiedBadge verified={profile.is_verified} />
          </div>
          <div className="text-xs text-slate-500 truncate">{profile.fullname}</div>
        </div>
        {/* Platform badge */}
        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${platformColor}`}>
          {platform === "instagram" ? "IG" : platform === "youtube" ? "YT" : "TT"}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
          <div className="text-xs text-slate-400">Followers</div>
          <div className="text-sm font-bold text-slate-900">{formatFollowers(profile.followers).replace(" followers", "")}</div>
        </div>
        {profile.engagement_rate !== undefined && (
          <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
            <div className="text-xs text-slate-400">Engagement</div>
            <div className="text-sm font-bold text-slate-900">{formatEngagementRate(profile.engagement_rate)}</div>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
        <ShortlistButton platform={platform} profile={profile} variant="compact" className="w-full justify-center" />
      </div>
    </motion.div>
  );
}

export const ProfileCard = memo(ProfileCardImpl);
