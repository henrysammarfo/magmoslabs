import { Skeleton } from "./Skeleton";

export function DocsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="magmos-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="h-5 w-20" rounded="rounded-full" />
            <Skeleton className="h-4 w-4" rounded="rounded-full" />
          </div>
          <Skeleton className="h-5 w-32 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
