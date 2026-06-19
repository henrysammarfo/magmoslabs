import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { X, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

type ModalVariant = "join" | "wallet";

interface ModalState {
  open: (variant?: ModalVariant) => void;
}

const Ctx = createContext<ModalState | null>(null);

export function useWaitlistModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWaitlistModal must be used within WaitlistModalProvider");
  return ctx;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function WaitlistModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [variant, setVariant] = useState<ModalVariant>("join");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim();
  const isValid = EMAIL_RE.test(trimmed);
  const showInline = touched && trimmed.length > 0 && !isValid;

  const open = useCallback((v: ModalVariant = "join") => {
    lastFocusedRef.current = document.activeElement as HTMLElement;
    setVariant(v);
    setEmail("");
    setTouched(false);
    setSubmitted(false);
    setError("");
    setLoading(false);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    queueMicrotask(() => lastFocusedRef.current?.focus?.());
  }, []);

  // Lock body scroll + focus first field + ESC + focus trap
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const node = dialogRef.current;
    const focusables = node?.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = focusables?.[0];
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const items = node.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close, submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const title = variant === "wallet" ? "Open your Magmos wallet" : "Join the Magmos waitlist";
  const subtitle =
    variant === "wallet"
      ? "Drop your email to get early access to the AURUM wallet experience."
      : "Be first to mint AURUM and earn from sAURUM at launch.";

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="waitlist-title"
            aria-describedby="waitlist-subtitle"
            className="relative w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl outline-none"
          >
            <button
              onClick={close}
              aria-label="Close dialog"
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-colors focus-visible:ring-2 focus-visible:ring-black focus:outline-none"
            >
              <X className="w-5 h-5 text-black" />
            </button>

            {submitted ? (
              <div className="text-center py-6">
                <div className="mx-auto w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-black" />
                </div>
                <h2
                  id="waitlist-title"
                  className="text-2xl font-medium text-black mb-2"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  You're on the list
                </h2>
                <p id="waitlist-subtitle" className="text-black/60 mb-6">
                  We'll email <span className="text-black font-medium">{email}</span> as soon as Magmos goes live.
                </p>
                <button
                  onClick={close}
                  className="inline-flex items-center gap-3 bg-black text-white font-medium pl-6 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black focus:outline-none"
                >
                  Done
                  <span className="bg-white rounded-full p-1.5">
                    <ArrowRight className="w-4 h-4 text-black" />
                  </span>
                </button>
              </div>
            ) : (
              <>
                <h2
                  id="waitlist-title"
                  className="text-2xl md:text-3xl font-medium text-black mb-2"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {title}
                </h2>
                <p id="waitlist-subtitle" className="text-black/60 mb-6">
                  {subtitle}
                </p>
                <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                  <label className="block">
                    <span className="sr-only">Email address</span>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      onBlur={() => setTouched(true)}
                      placeholder="you@domain.com"
                      disabled={loading}
                      aria-invalid={!!error || showInline}
                      aria-describedby={error || showInline ? "waitlist-error" : undefined}
                      className={`w-full px-4 py-3 rounded-full bg-[#F5F5F5] border focus:outline-none text-black placeholder:text-black/40 transition-colors disabled:opacity-60 ${
                        error || showInline
                          ? "border-red-400 focus:border-red-500"
                          : "border-transparent focus:border-black"
                      }`}
                    />
                  </label>
                  {(error || showInline) && (
                    <p id="waitlist-error" role="alert" className="text-sm text-red-600 px-2">
                      {error || "That doesn't look like a valid email address."}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading || (touched && !isValid)}
                    aria-busy={loading}
                    className="w-full inline-flex items-center justify-center gap-3 bg-black text-white font-medium pl-6 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Submitting…"
                      : variant === "wallet"
                      ? "Open wallet"
                      : "Join the waitlist"}
                    <span className="bg-white rounded-full p-1.5">
                      {loading ? (
                        <Loader2 className="w-4 h-4 text-black animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-black" />
                      )}
                    </span>
                  </button>
                  <p className="text-xs text-black/40 text-center pt-2">
                    By continuing you agree to receive product updates from Magmos.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
