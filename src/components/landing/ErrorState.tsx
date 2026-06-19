import { AlertTriangle, RotateCw, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
  /** Optional details surfaced to developers (collapsed by default). */
  details?: string;
  /** Fallback path for "go home" button when retry isn't possible. */
  homeHref?: string;
}

export function ErrorState({
  title = "We hit a snag loading this view.",
  message = "Our indexer didn't respond in time. Your funds are safe — this is just the dashboard view.",
  onRetry,
  compact = false,
  details,
  homeHref = "/",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`magmos-card rounded-3xl ${compact ? "p-6" : "p-10 md:p-14"} flex flex-col items-center text-center`}
    >
      <span className="relative mb-5">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full blur-xl"
          style={{ background: "radial-gradient(circle, rgba(200,160,74,0.35), transparent 70%)" }}
        />
        <span className="relative rounded-full bg-black/[0.04] border border-black/5 p-4 inline-flex">
          <AlertTriangle className="w-6 h-6 text-[#8B6A22]" />
        </span>
      </span>
      <h2
        className={`text-black font-medium ${compact ? "text-lg" : "text-2xl md:text-3xl"} mb-2`}
        style={{ letterSpacing: "-0.03em" }}
      >
        {title}
      </h2>
      <p className="text-black/60 max-w-md leading-relaxed mb-6">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-3 bg-black text-white font-medium pl-5 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black focus:outline-none"
          >
            Retry
            <span className="bg-white rounded-full p-1.5">
              <RotateCw className="w-3.5 h-3.5 text-black" />
            </span>
          </button>
        )}
        <Link
          to={homeHref}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-black/15 text-black font-medium hover:bg-black/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>
      {details && (
        <details className="mt-6 text-xs text-black/45 max-w-md">
          <summary className="cursor-pointer hover:text-black/70">Technical details</summary>
          <pre className="mt-2 text-left whitespace-pre-wrap break-words font-mono text-[11px] bg-black/[0.03] rounded-lg p-3">
            {details}
          </pre>
        </details>
      )}
    </div>
  );
}
