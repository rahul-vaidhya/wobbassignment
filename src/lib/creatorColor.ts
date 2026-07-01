/**
 * Generates a deterministic gradient for each creator based on their
 * username. Same creator always gets the same colors — no randomness.
 */

const GRADIENT_PAIRS = [
  ["#f97316", "#ec4899"], // orange → pink
  ["#8b5cf6", "#3b82f6"], // violet → blue
  ["#10b981", "#3b82f6"], // emerald → blue
  ["#f59e0b", "#ef4444"], // amber → red
  ["#6366f1", "#ec4899"], // indigo → pink
  ["#14b8a6", "#6366f1"], // teal → indigo
  ["#f43f5e", "#f97316"], // rose → orange
  ["#0ea5e9", "#10b981"], // sky → emerald
  ["#a855f7", "#f43f5e"], // purple → rose
  ["#84cc16", "#0ea5e9"], // lime → sky
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getCreatorGradient(username: string): string {
  const [from, to] = GRADIENT_PAIRS[hashString(username) % GRADIENT_PAIRS.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
}
