import { Link } from "@tanstack/react-router";
import { OpenWalletButton } from "../wallet/OpenWalletButton";

export function CtaBand() {
  return (
    <section id="launch" className="px-6 py-12" aria-labelledby="cta-title">
      <div className="max-w-[88rem] mx-auto bg-black text-white rounded-2xl p-12 md:p-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(800px 400px at 80% 50%, rgba(200,160,74,0.35), transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl">
          <h2
            id="cta-title"
            className="text-4xl md:text-6xl font-medium leading-tight mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            Your USDC, working for you. Always.
          </h2>
          <p className="text-white/70 text-lg max-w-xl mb-10">
            AURUM stays $1. sAURUM grows. You decide when to use it and when to let it
            compound. No protocol owns your capital.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <OpenWalletButton className="inline-flex items-center gap-3 bg-white text-black text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-white/90 transition-colors duration-200" />
            <Link
              to="/docs"
              className="inline-flex items-center px-7 py-3 rounded-full border border-white/20 text-white text-base md:text-lg font-medium hover:bg-white/5 transition-colors duration-200"
            >
              Read the Docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
