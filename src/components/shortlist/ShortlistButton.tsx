import { Bookmark, BookmarkCheck } from "lucide-react";
import type { Platform, UserProfileSummary } from "@/types";
import { makeShortlistKey, useShortlistStore } from "@/store/shortlistStore";
import { getProfileIdentifier } from "@/lib/profiles";

interface ShortlistButtonProps {
  platform: Platform;
  profile: UserProfileSummary;
  /** "compact" for cards, "full" for the detail page. */
  variant?: "compact" | "full";
  className?: string;
}

export function ShortlistButton({
  platform,
  profile,
  variant = "compact",
  className,
}: ShortlistButtonProps) {
  const identifier = getProfileIdentifier(profile);
  const key = makeShortlistKey(platform, identifier);
  const isShortlisted = useShortlistStore((s) => Boolean(s.entries[key]));
  const toggle = useShortlistStore((s) => s.toggle);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggle(platform, profile);
  };

  const baseClasses =
    "inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors duration-150 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-violet-500 active:scale-95";

  const sizeClasses = variant === "compact" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm";

  const stateClasses = isShortlisted
    ? "bg-violet-600 text-white hover:bg-violet-700"
    : "bg-white text-slate-700 border border-slate-300 hover:border-violet-400 hover:text-violet-700";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isShortlisted}
      aria-label={isShortlisted ? `Remove ${profile.fullname} from list` : `Add ${profile.fullname} to list`}
      className={`${baseClasses} ${sizeClasses} ${stateClasses} ${className ?? ""}`}
    >
      {isShortlisted ? (
        <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Bookmark className="w-4 h-4" aria-hidden="true" />
      )}
      {isShortlisted ? "Added" : "Add to List"}
    </button>
  );
}
