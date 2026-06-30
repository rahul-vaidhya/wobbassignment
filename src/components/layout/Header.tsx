import { Link, useLocation } from "react-router-dom";
import { Sparkles, Bookmark } from "lucide-react";
import { useShortlistCount } from "@/store/shortlistStore";

export function Header() {
  const count = useShortlistCount();
  const location = useLocation();
  const isShortlistActive = location.pathname === "/shortlist";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600 text-white">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </span>
          <span>Wobb Search</span>
        </Link>

        <Link
          to="/shortlist"
          aria-current={isShortlistActive ? "page" : undefined}
          className={`relative inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
            isShortlistActive
              ? "bg-violet-50 text-violet-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Bookmark className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Shortlist</span>
          {count > 0 && (
            <span
              aria-label={`${count} profiles shortlisted`}
              className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-semibold rounded-full bg-violet-600 text-white"
            >
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
