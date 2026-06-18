import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "../components/landing/PageShell";

export const Route = createFileRoute("/reserves")({
  head: () => ({
    meta: [
      { title: "Reserves — Magmos Proof of Backing" },
      {
        name: "description",
        content:
          "Every AURUM is backed 1:1 by on-chain USDC and short-duration treasuries. Verify the reserve set in real time.",
      },
      { property: "og:title", content: "Reserves — Magmos Proof of Backing" },
      { property: "og:description", content: "Real-time, verifiable, over-collateralized." },
    ],
    links: [{ rel: "canonical", href: "/reserves" }],
  }),
  component: ReservesPage,
});

const reserves = [
  { asset: "USDC (Sui)", amount: "$18,420,118", share: "74%" },
  { asset: "T-Bill backed (BlackRock BUIDL)", amount: "$5,128,402", share: "21%" },
  { asset: "Yield buffer", amount: "$1,250,000", share: "5%" },
];

function ReservesPage() {
  return (
    <PageShell
      eyebrow="Reserves"
      title="Backing you can verify in a single transaction."
      description="Magmos reserves live in transparent on-chain vaults. Anyone can call the proof function to confirm 1:1 backing."
    >
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <div className="px-8 py-6 border-b border-black/5 flex items-center justify-between">
          <h2 className="text-xl font-medium text-black" style={{ letterSpacing: "-0.03em" }}>
            Reserve composition
          </h2>
          <span className="text-sm text-black/50">Updated every block</span>
        </div>
        <ul className="divide-y divide-black/5">
          {reserves.map((r) => (
            <li key={r.asset} className="px-8 py-5 grid grid-cols-[1fr_auto_auto] items-center gap-4">
              <span className="text-black font-medium">{r.asset}</span>
              <span className="text-black/60 tabular-nums">{r.amount}</span>
              <span className="text-black/40 text-sm w-12 text-right">{r.share}</span>
            </li>
          ))}
        </ul>
        <div className="px-8 py-5 bg-black/[0.02] flex items-center justify-between">
          <span className="text-black font-medium">Total backing</span>
          <span className="text-black font-medium tabular-nums">$24,798,520</span>
        </div>
      </div>
    </PageShell>
  );
}
