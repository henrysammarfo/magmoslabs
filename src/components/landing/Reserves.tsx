import { ShieldCheck } from "lucide-react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchLandingReservesStats } from "../../lib/live-data";

const landingReservesQuery = queryOptions({
  queryKey: ["landing-reserves-live"],
  queryFn: fetchLandingReservesStats,
  staleTime: 10_000,
  refetchInterval: 30_000,
});

function formatUsdCompact(v: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);
}

function formatUpdated(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 1) return "Updated just now";
  if (mins < 60) return `Updated ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Updated ${days}d ago`;
}

export function Reserves() {
  const { data, isPending, isError } = useQuery(landingReservesQuery);
  const stats = [
    {
      label: "Total reserves",
      value: isPending || isError || !data ? "..." : formatUsdCompact(data.totalReservesUsd),
      sub: "100% in Scallop / Aftermath / DeepBook",
    },
    {
      label: "Accumulation index",
      value: isPending || isError || !data ? "..." : data.accumulationIndex.toFixed(4),
      sub: isPending || isError || !data ? "Fetching on-chain..." : formatUpdated(data.updatedAtMs),
    },
    {
      label: "30-day APY",
      value: isPending || isError || !data ? "..." : `${data.apr30dPct.toFixed(2)}%`,
      sub: "Multi-protocol yield, compounded daily",
    },
  ];

  return (
    <section id="reserves" className="px-6 py-28">
      <div className="max-w-[88rem] mx-auto bg-white rounded-2xl border border-black/5 p-10 md:p-16">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-5 h-5 text-[#c8a04a]" />
          <span className="text-sm font-medium uppercase tracking-widest text-[#c8a04a]">
            Proof of reserves
          </span>
        </div>
        <h2
          className="text-4xl md:text-5xl font-medium leading-tight max-w-3xl mb-12"
          style={{ letterSpacing: "-0.03em" }}
        >
          100% on-chain reserves, verified via Walrus MemWal.
        </h2>

        <div className="grid md:grid-cols-3 gap-10 md:gap-6">
          {stats.map((s) => (
            <div key={s.label} className="border-t border-black/10 pt-6">
              <p className="text-sm text-black/50 mb-3">{s.label}</p>
              <p
                className="text-5xl font-medium mb-3"
                style={{ letterSpacing: "-0.04em" }}
              >
                {s.value}
              </p>
              <p className="text-sm text-black/60">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
