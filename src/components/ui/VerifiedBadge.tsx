import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  verified: boolean;
  className?: string;
}

export function VerifiedBadge({ verified, className }: VerifiedBadgeProps) {
  if (!verified) return null;
  return (
    <BadgeCheck
      aria-label="Verified account"
      role="img"
      className={`inline-block text-blue-500 ${className ?? "w-4 h-4"}`}
    />
  );
}
