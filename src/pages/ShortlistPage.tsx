import { Link } from "react-router-dom";
import { Bookmark, Trash2, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useShortlistStore } from "@/store/shortlistStore";
import { formatFollowers } from "@/lib/format";
import { getPlatformLabel } from "@/lib/platform";
import { getProfileIdentifier } from "@/lib/profiles";

export function ShortlistPage() {
  const entries = useShortlistStore((s) => s.entries);
  const remove = useShortlistStore((s) => s.remove);
  const list = Object.values(entries).sort((a, b) => b.addedAt - a.addedAt);

  return (
    <Layout
      title="Your Shortlist"
      description={
        list.length > 0
          ? `${list.length} profile${list.length === 1 ? "" : "s"} saved. This list persists across page refreshes.`
          : undefined
      }
    >
      {list.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-6 h-6" />}
          title="Your shortlist is empty"
          description="Add profiles from the search page to build your list."
          action={
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              Browse profiles <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((entry) => {
            const identifier = getProfileIdentifier(entry.profile);
            return (
              <li
                key={entry.key}
                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white"
              >
                <Link
                  to={`/profile/${identifier}?platform=${entry.platform}`}
                  className="flex items-center gap-3 flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg"
                >
                  <ProfileAvatar src={entry.profile.picture} name={entry.profile.fullname} />
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1 font-semibold text-slate-900 truncate">
                      <span className="truncate">@{entry.profile.username}</span>
                      <VerifiedBadge verified={entry.profile.is_verified} />
                    </div>
                    <div className="text-xs text-slate-400">
                      {getPlatformLabel(entry.platform)} · {formatFollowers(entry.profile.followers)}
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => remove(entry.key)}
                  aria-label={`Remove ${entry.profile.fullname} from shortlist`}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Layout>
  );
}
