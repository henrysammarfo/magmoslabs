import type { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
  rounded?: string;
}

export function Skeleton({ className = "", style, rounded = "rounded-md" }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`block magmos-shimmer ${rounded} ${className}`}
      style={style}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: `${90 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
