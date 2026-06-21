import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Marquee } from "./Marquee";

export function Hero() {
  return (
    <section className="flex-1 px-6 pt-20 pb-6 flex items-end" aria-labelledby="hero-title">
      <div
        className="relative w-full rounded-2xl overflow-hidden max-w-[88rem] mx-auto"
        style={{ height: "calc(100vh - 96px)" }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-transparent" />
        <div className="relative z-10 flex flex-col items-start justify-start h-full p-12 pt-36">
          <h1
            id="hero-title"
            className="text-black text-5xl md:text-6xl font-medium leading-tight max-w-xl mb-4"
            style={{ letterSpacing: "-0.04em" }}
          >
            Your Dollar
            <br />
            Earns Itself.
          </h1>
          <p className="text-black/70 text-base md:text-lg max-w-md mb-8 leading-relaxed">
            AURUM is a unit-stable digital dollar on Sui. Stake it for sAURUM and watch the
            accumulation index rise daily — yield from Scallop, DeepBook, and Aftermath,
            compounded on-chain.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-3 bg-black text-white text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
          >
            Join us
            <span className="bg-white rounded-full p-2">
              <ArrowRight className="w-5 h-5 text-black" />
            </span>
          </Link>
          <Marquee />
        </div>
      </div>
    </section>
  );
}
