import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { PageShell } from "../components/landing/PageShell";
import { fetchUsdcRateSnapshot } from "../lib/live-data";

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

const usdcRateQuery = queryOptions({
  queryKey: ["usdc-rate-live"],
  queryFn: fetchUsdcRateSnapshot,
  staleTime: 10_000,
  refetchInterval: 30_000,
});

function AurumPage() {
  const { data } = useQuery(usdcRateQuery);
  const rate = data?.usdcUsd ?? 1;
  const source = data?.source ?? "coinbase";
  const previewAmount = (100 * rate).toFixed(2);
  const facts = [
    { k: "Live USDC/USD", v: `${rate.toFixed(4)} (${source})` },
    { k: "Forge preview", v: `100 USDC -> ${previewAmount} AURUM` },
    { k: "Backing", v: "USDC + short-duration treasuries" },
    { k: "Reserve ratio", v: "Live on-chain proof in /reserves" },
    { k: "Chain", v: "Sui testnet" },
    { k: "Mint / redeem", v: "Permissionless, market-rate aware" },
    { k: "Composability", v: "Native Move object" },
  ];
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
