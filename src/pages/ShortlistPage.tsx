import { Link } from "react-router-dom";
import { Bookmark, Trash2, ArrowRight, ListX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useShortlistStore, type ShortlistState } from "@/store/shortlistStore";
import { formatFollowers } from "@/lib/format";
import { getPlatformLabel, getPlatformColor } from "@/lib/platform";
import { getProfileIdentifier } from "@/lib/profiles";
import type { ShortlistEntry } from "@/types";

const MotionLi = motion.li as any;

export function ShortlistPage() {
  const entries = useShortlistStore((s: ShortlistState) => s.entries);
  const remove = useShortlistStore((s: ShortlistState) => s.remove);
  const clear = useShortlistStore((s: ShortlistState) => s.clear);
  const list = Object.values(entries as Record<string, ShortlistEntry>).sort((a, b) => b.addedAt - a.addedAt);

  return (
    <Layout>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Shortlist</h1>
          {/* aria-live region announces count changes to screen readers */}
          <output aria-live="polite" className="text-sm text-slate-500 mt-1 block">
            {list.length > 0
              ? `${list.length} creator${list.length === 1 ? "" : "s"} saved · persists across refreshes`
              : "No creators saved yet"}
          </output>
        </div>
        {list.length > 0 && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear all shortlisted creators"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <ListX className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
            <Bookmark className="w-7 h-7 text-violet-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Nothing saved yet</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Add creators from the search page to build your campaign lineup.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-md shadow-violet-100"
          >
            Browse creators <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {list.map((entry) => {
              const identifier = getProfileIdentifier(entry.profile);
              const color = getPlatformColor(entry.platform);
              return (
                <MotionLi
                  key={entry.key}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                  className="flex flex-col p-4 rounded-2xl border border-slate-200 bg-white hover:border-violet-200 hover:shadow-md transition-all duration-150"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Link to={`/profile/${identifier}?platform=${entry.platform}`} className="shrink-0">
                      <ProfileAvatar src={entry.profile.picture} name={entry.profile.fullname} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${identifier}?platform=${entry.platform}`}
                        className="flex items-center gap-1 font-bold text-slate-900 truncate text-sm hover:text-violet-600 transition-colors"
                      >
                        <span className="truncate">@{entry.profile.username}</span>
                        <VerifiedBadge verified={entry.profile.is_verified} />
                      </Link>
                      <div className="text-xs text-slate-500 truncate">{entry.profile.fullname}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${color}`}>
                          {getPlatformLabel(entry.platform)}
                        </span>
                        <span className="text-xs text-slate-400">{formatFollowers(entry.profile.followers)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(entry.key)}
                      aria-label={`Remove ${entry.profile.fullname} from shortlist`}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </MotionLi>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </Layout>
  );
}
