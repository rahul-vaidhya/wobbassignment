export function ProfileCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white animate-pulse">
      <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-2/5 rounded bg-slate-200" />
        <div className="h-3 w-1/3 rounded bg-slate-200" />
      </div>
      <div className="h-8 w-20 rounded-lg bg-slate-200 shrink-0" />
    </div>
  );
}

export function ProfileGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <ProfileCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex gap-6 items-start">
        <div className="w-24 h-24 rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="h-5 w-1/3 rounded bg-slate-200" />
          <div className="h-3.5 w-1/4 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-200" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
