import { useState } from "react";
import { User } from "lucide-react";

interface ProfileAvatarProps {
  src: string;
  name: string;
  sizeClassName?: string;
}

export function ProfileAvatar({ src, name, sizeClassName = "w-12 h-12" }: ProfileAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`${sizeClassName} rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0`}
      >
        <User className="w-1/2 h-1/2" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name}'s profile picture`}
      onError={() => setFailed(true)}
      className={`${sizeClassName} rounded-full object-cover border border-slate-200 shrink-0`}
      loading="lazy"
    />
  );
}
