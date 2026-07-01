import { Link, useLocation } from "react-router-dom";
import { Sparkles, Bookmark } from "lucide-react";
import { useShortlistCount } from "@/store/shortlistStore";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const count = useShortlistCount();
  const location = useLocation();
  const isShortlistActive = location.pathname === "/shortlist";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-slate-900 hover:opacity-80 transition-opacity">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-md shadow-violet-200">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="text-lg tracking-tight">Wobb<span className="text-violet-600">Search</span></span>
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
              <motion.span
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
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>
    </header>
  );
}
