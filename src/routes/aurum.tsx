import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "../components/landing/PageShell";

export const Route = createFileRoute("/aurum")({
  head: () => ({
    meta: [
      { title: "AURUM — Unit-stable Dollar on Sui" },
      {
        name: "description",
        content:
          "AURUM is a unit-stable digital dollar on Sui. Always $1, fully backed, transferable across the Sui ecosystem.",
      },
      { property: "og:title", content: "AURUM — Unit-stable Dollar on Sui" },
      { property: "og:description", content: "Always $1. Always composable." },
    ],
    links: [{ rel: "canonical", href: "/aurum" }],
  }),
  component: AurumPage,
});

const facts = [
  { k: "Peg", v: "1 AURUM = 1 USDC" },
  { k: "Backing", v: "USDC + short-duration treasuries" },
  { k: "Reserve ratio", v: "102.4% over-collateralized" },
  { k: "Chain", v: "Sui mainnet" },
  { k: "Mint / redeem", v: "Permissionless, 1:1" },
  { k: "Composability", v: "Native Move object" },
];

function AurumPage() {
  return (
    <PageShell
      eyebrow="AURUM"
      title="A stable unit of account that goes anywhere on Sui."
      description="AURUM never moves. It's the dollar you spend, lend, and route — the base layer that sAURUM grows on top of."
    >
      <section className="bg-white rounded-2xl border border-black/5 divide-y divide-black/5">
        {facts.map((f) => (
          <div key={f.k} className="px-8 py-5 flex items-center justify-between gap-4">
            <span className="text-black/60">{f.k}</span>
            <span className="text-black font-medium text-right">{f.v}</span>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
