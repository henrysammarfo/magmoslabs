import { Skeleton } from "../landing/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-live="polite">
      {/* Balance grid */}
      <section>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="magmos-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-8" rounded="rounded-full" />
              </div>
              <Skeleton className="h-8 w-32 mb-3" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </section>

      {/* Earnings + activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="magmos-card lg:col-span-2 rounded-3xl p-6 sm:p-8">
          <div className="flex items-end justify-between mb-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="relative h-[240px]">
            <Skeleton className="absolute inset-0" rounded="rounded-2xl" />
          </div>
        </div>
        <div className="magmos-card rounded-3xl p-6 sm:p-8">
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="space-y-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8" rounded="rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Allocations + transactions */}
      <div className="magmos-card rounded-3xl p-6 sm:p-8">
        <Skeleton className="h-5 w-44 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto_auto] items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" rounded="rounded-full" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
