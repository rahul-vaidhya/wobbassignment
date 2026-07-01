import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, BookmarkCheck } from "lucide-react";
import type { Platform, UserProfileSummary } from "@/types";
import { makeShortlistKey, useShortlistStore, type ShortlistState } from "@/store/shortlistStore";
import { getProfileIdentifier } from "@/lib/profiles";

const MotionSpan = motion.span as any;

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
  const isShortlisted = useShortlistStore((s: ShortlistState) => Boolean(s.entries[key]));
  const toggle = useShortlistStore((s: ShortlistState) => s.toggle);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggle(platform, profile);
  };

  const baseClasses =
    "relative inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors duration-150 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-violet-500 overflow-hidden";

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
      {/* Ripple flash when added */}
      <AnimatePresence>
        {isShortlisted && (
          <MotionSpan
            key="flash"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{}}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 rounded-full bg-violet-300 pointer-events-none"
            style={{ transformOrigin: "center" }}
          />
        )}
      </AnimatePresence>

      {/* Animated icon toggle */}
      <span className="relative w-4 h-4 shrink-0">
        <AnimatePresence mode="wait">
          {isShortlisted ? (
            <MotionSpan
              key="checked"
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 15 }}
              transition={{ duration: 0.18, type: "spring", stiffness: 300 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
            </MotionSpan>
          ) : (
            <MotionSpan
              key="empty"
              initial={{ scale: 0, rotate: 15 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -15 }}
              transition={{ duration: 0.18, type: "spring", stiffness: 300 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Bookmark className="w-4 h-4" aria-hidden="true" />
            </MotionSpan>
          )}
        </AnimatePresence>
      </span>

      {isShortlisted ? "Added" : "Add to List"}
    </button>
  );
}
