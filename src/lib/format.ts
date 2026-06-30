/**
 * Centralised formatting helpers.
 *
 * The starter project had three separate, slightly-different
 * implementations of "format a follower count" scattered across
 * components, plus an inline engagement-rate calculation that used the
 * wrong multiplier. Everything number-related now lives here so there is
 * exactly one implementation to test and trust.
 */

/** Compact, locale-aware count formatting: 1234 -> "1.2K", 4500000 -> "4.5M" */
export function formatCount(count: number | undefined): string {
  if (count === undefined || Number.isNaN(count)) return "—";
  if (count >= 1_000_000_000) return trim(count / 1_000_000_000) + "B";
  if (count >= 1_000_000) return trim(count / 1_000_000) + "M";
  if (count >= 1_000) return trim(count / 1_000) + "K";
  return count.toLocaleString();
}

function trim(value: number): string {
  // 1.0M -> "1M", 1.25M -> "1.3M"
  return (Math.round(value * 10) / 10).toString();
}

/** "1234 followers" style label used on cards. */
export function formatFollowers(count: number | undefined): string {
  return `${formatCount(count)} followers`;
}

/** `engagement_rate` is stored as a fraction (e.g. 0.0023 = 0.23%). */
export function formatEngagementRate(rate: number | undefined): string {
  if (rate === undefined || Number.isNaN(rate)) return "N/A";
  return (rate * 100).toFixed(2) + "%";
}

export function formatNumber(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "N/A";
  return formatCount(value);
}
