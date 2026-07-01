import { LayoutGrid } from "lucide-react";
import type { TabOption, Platform } from "@/types";
import { PLATFORMS, getPlatformIcon, getPlatformLabel } from "@/lib/platform";

interface PlatformTabsProps {
  selected: TabOption;
  onChange: (tab: TabOption) => void;
}

const ACTIVE_COLORS: Record<TabOption, string> = {
  all: "bg-violet-600 text-white shadow-md shadow-violet-100",
  instagram: "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-md shadow-pink-100",
  youtube: "bg-red-500 text-white shadow-md shadow-red-100",
  tiktok: "bg-slate-900 text-white shadow-md shadow-slate-200",
};

const TABS: { key: TabOption; label: string; Icon: React.ElementType }[] = [
  { key: "all", label: "All", Icon: LayoutGrid },
  ...PLATFORMS.map((p: Platform) => ({ key: p as TabOption, label: getPlatformLabel(p), Icon: getPlatformIcon(p) })),
];

export function PlatformTabs({ selected, onChange }: PlatformTabsProps) {
  return (
    <div role="tablist" aria-label="Platform" className="inline-flex p-1 rounded-xl bg-slate-100 gap-1">
      {TABS.map(({ key, label, Icon }) => {
        const isActive = selected === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              isActive ? ACTIVE_COLORS[key] : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
