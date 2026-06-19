interface SpinnerProps {
  label?: string;
  className?: string;
}

export function Spinner({ label = "Loading", className = "" }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 py-20 ${className}`}
    >
      <span className="relative inline-flex h-12 w-12">
        <span className="absolute inset-0 rounded-full border-2 border-black/10" />
        <span
          className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#C8A04A", borderRightColor: "#C8A04A" }}
        />
        <span
          className="absolute inset-2 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(200,160,74,0.6), rgba(200,160,74,0) 70%)",
          }}
        />
      </span>
      <span className="text-sm text-black/50 tracking-wide">{label}</span>
    </div>
  );
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5] items-center justify-center">
      <Spinner label={label} />
    </div>
  );
}
