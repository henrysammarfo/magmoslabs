import { AlertTriangle, RotateCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({
  title = "Something went off-chain.",
  message = "We couldn't load this data right now. Please try again in a moment.",
  onRetry,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`bg-white rounded-2xl border border-black/5 ${
        compact ? "p-6" : "p-10"
      } flex flex-col items-center text-center`}
    >
      <span className="rounded-full bg-black/5 p-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-black" />
      </span>
      <h2
        className={`text-black font-medium ${compact ? "text-lg" : "text-2xl"} mb-2`}
        style={{ letterSpacing: "-0.03em" }}
      >
        {title}
      </h2>
      <p className="text-black/60 max-w-md leading-relaxed mb-6">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-black text-white font-medium pl-5 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          Try again
          <span className="bg-white rounded-full p-1.5">
            <RotateCw className="w-3.5 h-3.5 text-black" />
          </span>
        </button>
      )}
    </div>
  );
}
