import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { X, ArrowRight, CheckCircle2 } from "lucide-react";

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

export function WaitlistModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [variant, setVariant] = useState<ModalVariant>("join");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const open = useCallback((v: ModalVariant = "join") => {
    setVariant(v);
    setEmail("");
    setSubmitted(false);
    setError("");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
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
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-colors"
            >
              <X className="w-5 h-5 text-black" />
            </button>

            {submitted ? (
              <div className="text-center py-6">
                <div className="mx-auto w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-2xl font-medium text-black mb-2" style={{ letterSpacing: "-0.03em" }}>
                  You're on the list
                </h2>
                <p className="text-black/60 mb-6">
                  We'll email <span className="text-black font-medium">{email}</span> as soon as Magmos goes live.
                </p>
                <button
                  onClick={close}
                  className="inline-flex items-center gap-3 bg-black text-white font-medium pl-6 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors"
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
                <p className="text-black/60 mb-6">{subtitle}</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <label className="block">
                    <span className="sr-only">Email address</span>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full px-4 py-3 rounded-full bg-[#F5F5F5] border border-transparent focus:border-black focus:outline-none text-black placeholder:text-black/40"
                    />
                  </label>
                  {error && <p className="text-sm text-red-600 px-2">{error}</p>}
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-3 bg-black text-white font-medium pl-6 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    {variant === "wallet" ? "Open wallet" : "Join the waitlist"}
                    <span className="bg-white rounded-full p-1.5">
                      <ArrowRight className="w-4 h-4 text-black" />
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
