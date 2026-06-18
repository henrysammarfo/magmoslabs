import { createFileRoute } from "@tanstack/react-router";
import { Flame, Droplets, Sparkles, Shield } from "lucide-react";
import { PageShell } from "../components/landing/PageShell";

export const Route = createFileRoute("/protocol")({
  head: () => ({
    meta: [
      { title: "Protocol — Magmos" },
      {
        name: "description",
        content:
          "How Magmos works: forge AURUM from USDC, smelt it into sAURUM, and let on-chain yield compound into the accumulation index.",
      },
      { property: "og:title", content: "Protocol — Magmos" },
      { property: "og:description", content: "Forge, smelt, compound, refine — the four steps of Magmos." },
    ],
    links: [{ rel: "canonical", href: "/protocol" }],
  }),
  component: ProtocolPage,
});

const pillars = [
  {
    icon: Flame,
    title: "Forge",
    body: "Deposit USDC and mint AURUM 1:1. Every AURUM is fully backed by reserves you can verify on-chain.",
  },
  {
    icon: Droplets,
    title: "Smelt",
    body: "Stake AURUM to receive sAURUM, a yield-bearing index token whose value rises as the protocol earns.",
  },
  {
    icon: Sparkles,
    title: "Compound",
    body: "Yield from Scallop, DeepBook, and Aftermath is rebalanced and compounded into the sAURUM index daily.",
  },
  {
    icon: Shield,
    title: "Refine",
    body: "Unstake sAURUM at any time to receive AURUM at the current index. No lockups, no protocol custody.",
  },
];

function ProtocolPage() {
  return (
    <PageShell
      eyebrow="Protocol"
      title="A composable yield dollar, forged on Sui."
      description="Magmos turns idle USDC into a productive on-chain dollar without giving up custody, transparency, or composability."
    >
      <section aria-labelledby="pillars-title" className="mt-4">
        <h2 id="pillars-title" className="sr-only">Protocol pillars</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <article key={p.title} className="bg-white rounded-2xl p-8 border border-black/5">
                <span className="inline-flex w-12 h-12 rounded-full bg-black text-white items-center justify-center mb-6">
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="text-2xl font-medium text-black mb-2" style={{ letterSpacing: "-0.03em" }}>
                  {p.title}
                </h3>
                <p className="text-black/60 leading-relaxed">{p.body}</p>
              </article>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
