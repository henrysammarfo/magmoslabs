import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - font side-effect import has no types
import "@fontsource-variable/figtree";

import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { TokenCards } from "../components/landing/TokenCards";
import { HowItWorks } from "../components/landing/HowItWorks";
import { WhySui } from "../components/landing/WhySui";
import { Reserves } from "../components/landing/Reserves";
import { CtaBand } from "../components/landing/CtaBand";
import { Footer } from "../components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Magmos — Composable Yield Dollar on Sui" },
      {
        name: "description",
        content:
          "AURUM is a unit-stable digital dollar on Sui. Stake it for sAURUM and earn multi-protocol yield from Scallop, DeepBook, and Aftermath — compounded daily, verified on-chain.",
      },
      { property: "og:title", content: "Magmos — Composable Yield Dollar on Sui" },
      {
        property: "og:description",
        content:
          "Deposit USDC, receive AURUM. Stake for sAURUM and watch the accumulation index rise daily.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col bg-[#F5F5F5]">
      <main id="main">
        <div className="h-screen flex flex-col overflow-hidden relative">
          <Navbar />
          <Hero />
        </div>
        <TokenCards />
        <HowItWorks />
        <WhySui />
        <Reserves />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
