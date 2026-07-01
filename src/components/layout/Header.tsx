import { Link, useLocation } from "react-router-dom";
import { Sparkles, Bookmark, GitCompareArrows } from "lucide-react";
import { useShortlistCount } from "@/store/shortlistStore";
import { useCompareCount } from "@/store/compareStore";
import { motion, AnimatePresence } from "framer-motion";

const MotionSpan = motion.span as any;

export function Header() {
  const count = useShortlistCount();
  const compareCount = useCompareCount();
  const location = useLocation();
  const isShortlistActive = location.pathname === "/shortlist";
  const isCompareActive = location.pathname === "/compare";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-slate-900 hover:opacity-80 transition-opacity">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-md shadow-violet-200">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="text-lg tracking-tight">Wobb<span className="text-violet-600">Search</span></span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/compare"
            aria-current={isCompareActive ? "page" : undefined}
            className={`relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              isCompareActive
                ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <GitCompareArrows className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Compare</span>
            <AnimatePresence>
              {compareCount > 0 && (
                <MotionSpan
                  key="compare-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  aria-label={`${compareCount} profiles selected for comparison`}
                  className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold rounded-full ${
                    isCompareActive ? "bg-white text-slate-900" : "bg-slate-900 text-white"
                  }`}
                >
                  {compareCount}
                </MotionSpan>
              )}
            </AnimatePresence>
          </Link>

          <Link
            to="/shortlist"
            aria-current={isShortlistActive ? "page" : undefined}
            className={`relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              isShortlistActive
                ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Bookmark className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Shortlist</span>
            <AnimatePresence>
              {count > 0 && (
                <MotionSpan
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  aria-label={`${count} profiles shortlisted`}
                  className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold rounded-full ${
                    isShortlistActive ? "bg-white text-violet-600" : "bg-violet-600 text-white"
                  }`}
                >
                  {count}
                </MotionSpan>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </div>
    </header>
  );
}
