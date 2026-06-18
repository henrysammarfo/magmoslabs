import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "../components/landing/PageShell";

export const Route = createFileRoute("/saurum")({
  head: () => ({
    meta: [
      { title: "sAURUM — Yield-Accruing Index Token" },
      {
        name: "description",
        content:
          "sAURUM is an accumulation index token. Its value rises every block as the Magmos protocol routes yield from Scallop, DeepBook, and Aftermath.",
      },
      { property: "og:title", content: "sAURUM — Yield-Accruing Index Token" },
      { property: "og:description", content: "Stake AURUM. Watch the index rise. Unstake anytime." },
    ],
    links: [{ rel: "canonical", href: "/saurum" }],
  }),
  component: SaurumPage,
});

const stats = [
  { k: "Current index", v: "1.1247" },
  { k: "30d APY", v: "12.4%" },
  { k: "TVL staked", v: "$18.6M" },
  { k: "Holders", v: "4,212" },
];

function SaurumPage() {
  return (
    <PageShell
      eyebrow="sAURUM"
      title="Stake the dollar. Earn the protocol."
      description="sAURUM doesn't rebase. Instead, the index that converts sAURUM back into AURUM ticks up every block as yield accrues."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.k} className="bg-white rounded-2xl p-6 border border-black/5">
            <p className="text-sm text-black/50">{s.k}</p>
            <p className="text-3xl font-medium text-black mt-2" style={{ letterSpacing: "-0.03em" }}>
              {s.v}
            </p>
          </div>
        ))}
      </div>
      <section className="bg-white rounded-2xl border border-black/5 p-10 mt-6">
        <h2 className="text-2xl font-medium text-black mb-4" style={{ letterSpacing: "-0.03em" }}>
          How the index works
        </h2>
        <p className="text-black/60 leading-relaxed max-w-2xl">
          When you stake N AURUM, you receive N / index sAURUM. When you unstake, you receive
          sAURUM × index AURUM. As the protocol earns, the index rises — no token balance changes
          required, no taxable rebase event.
        </p>
      </section>
    </PageShell>
  );
}
