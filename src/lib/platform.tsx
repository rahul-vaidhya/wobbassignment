import { Camera, Video, Music2 } from "lucide-react";
import type { Platform } from "@/types";

export const PLATFORMS: Platform[] = ["instagram", "youtube", "tiktok"];

const LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
};

const ICONS: Record<Platform, typeof Camera> = {
  instagram: Camera,
  youtube: Video,
  tiktok: Music2,
};

const COLORS: Record<Platform, string> = {
  instagram: "text-pink-600 bg-pink-50",
  youtube: "text-red-600 bg-red-50",
  tiktok: "text-slate-900 bg-slate-100",
};

export function getPlatformLabel(platform: Platform): string {
  return LABELS[platform];
}

export function getPlatformIcon(platform: Platform) {
  return ICONS[platform];
}

/**
 * Renders a platform icon as a JSX element (rather than returning the
 * component reference itself, which the react-hooks/static-components
 * rule flags as "created during render" even for stable lookups).
 */
export function renderPlatformIcon(platform: Platform, className?: string) {
  const Icon = ICONS[platform];
  return <Icon className={className} aria-hidden="true" />;
}

export function getPlatformColor(platform: Platform): string {
  return COLORS[platform];
}
