import type { Platform } from "@/types";
import { PLATFORMS, getPlatformIcon, getPlatformLabel } from "@/lib/platform";

interface PlatformTabsProps {
  selected: Platform;
  onChange: (platform: Platform) => void;
}

export function PlatformTabs({ selected, onChange }: PlatformTabsProps) {
  return (
    <div role="tablist" aria-label="Platform" className="inline-flex p-1 rounded-xl bg-slate-100 gap-1">
      {PLATFORMS.map((platform) => {
        const Icon = getPlatformIcon(platform);
        const isActive = selected === platform;
        return (
          <button
            key={platform}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(platform)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            {getPlatformLabel(platform)}
          </button>
        );
      })}
    </div>
  );
}
