import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { PageShell } from "../components/landing/PageShell";
import { ErrorState } from "../components/landing/ErrorState";
import { fetchProtocolSnapshot } from "../lib/mock-data";

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

const reservesQuery = queryOptions({
  queryKey: ["reserves-live"],
  queryFn: fetchProtocolSnapshot,
  staleTime: 2_000,
  refetchInterval: 5_000,
  refetchOnMount: "always",
  refetchOnWindowFocus: true,
});

function money(v: number): string {
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function ReservesPage() {
  const { data, isPending, isError, error, refetch } = useQuery(reservesQuery);
  if (isPending || !data) {
    return (
      <PageShell
        eyebrow="Reserves"
        title="Backing you can verify in a single transaction."
        description="Loading live reserve state from Sui testnet."
      />
    );
  }
  if (isError) {
    return (
      <PageShell
        eyebrow="Reserves"
        title="Backing you can verify in a single transaction."
        description="Magmos reserves live in transparent on-chain vaults."
      >
        <ErrorState
          title="Reserves unavailable."
          message="We couldn't read live reserve data from Sui right now."
          details={error.message}
          onRetry={() => void refetch()}
        />
      </PageShell>
    );
  }
  const reserves = [
    {
      asset: "Scallop Allocation",
      amount: money((data.reserves * data.scallopBps) / 10_000),
      share: `${(data.scallopBps / 100).toFixed(0)}%`,
    },
    {
      asset: "Aftermath Allocation",
      amount: money((data.reserves * data.aftermathBps) / 10_000),
      share: `${(data.aftermathBps / 100).toFixed(0)}%`,
    },
    {
      asset: "DeepBook Allocation",
      amount: money((data.reserves * data.deepbookBps) / 10_000),
      share: `${(data.deepbookBps / 100).toFixed(0)}%`,
    },
  ];

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
          <span className="text-black font-medium tabular-nums">{money(data.reserves)}</span>
        </div>
      </div>
    </PageShell>
  );
}
