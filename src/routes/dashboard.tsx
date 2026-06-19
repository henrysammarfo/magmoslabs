import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  ArrowUpRight,
  TrendingUp,
  Wallet,
  Activity,
  Layers,
  ArrowDownLeft,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "../components/landing/Navbar";
import { Footer } from "../components/landing/Footer";
import { Spinner } from "../components/landing/Spinner";
import { ErrorState } from "../components/landing/ErrorState";
import { EarningsChart } from "../components/dashboard/EarningsChart";
import { useWaitlistModal } from "../components/landing/WaitlistModal";
import { fetchDashboard, type Balance } from "../lib/mock-data";

const dashboardQuery = queryOptions({
  queryKey: ["dashboard"],
  queryFn: fetchDashboard,
  staleTime: 30_000,
});

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Magmos" },
      {
        name: "description",
        content:
          "Track your AURUM and sAURUM positions, monitor protocol yield, and manage allocations across Scallop, DeepBook, and Aftermath.",
      },
      { property: "og:title", content: "Dashboard — Magmos" },
      { property: "og:description", content: "Your AURUM and sAURUM positions, at a glance." },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  component: DashboardPage,
  pendingComponent: DashboardPending,
  errorComponent: DashboardError,
  notFoundComponent: () => (
    <DashboardChrome>
      <ErrorState title="Page not found." message="That dashboard view doesn't exist." />
    </DashboardChrome>
  ),
});

const iconMap = {
  wallet: Wallet,
  layers: Layers,
  trending: TrendingUp,
  activity: Activity,
} as const;

function DashboardChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
      <div className="relative">
        <Navbar />
      </div>
      <main className="px-6 pt-32 pb-16 flex-1">
        <div className="max-w-[88rem] mx-auto">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

function DashboardPending() {
  return (
    <DashboardChrome>
      <Spinner label="Loading your positions" />
    </DashboardChrome>
  );
}

function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <DashboardChrome>
      <ErrorState
        title="We couldn't load your dashboard."
        message={error.message || "The yield indexer didn't respond. Please retry."}
        onRetry={() => {
          reset();
          router.invalidate();
        }}
      />
    </DashboardChrome>
  );
}

function DashboardPage() {
  const { open } = useWaitlistModal();
  return (
    <DashboardChrome>
      <header className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-sm text-black/50 uppercase tracking-widest mb-3">Dashboard</p>
          <h1
            className="text-black text-4xl md:text-5xl font-medium"
            style={{ letterSpacing: "-0.04em" }}
          >
            Welcome back, Forgekeeper.
          </h1>
          <p className="text-black/60 mt-3 max-w-xl">
            Your AURUM stays $1. Your sAURUM compounds while you sleep. Track everything in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => open("wallet")}
            className="inline-flex items-center gap-3 bg-black text-white font-medium pl-6 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            Mint AURUM
            <span className="bg-white rounded-full p-1.5">
              <ArrowRight className="w-4 h-4 text-black" />
            </span>
          </button>
          <Link
            to="/saurum"
            className="inline-flex items-center px-6 py-3 rounded-full border border-black/15 text-black font-medium hover:bg-black/5 transition-colors"
          >
            Stake to sAURUM
          </Link>
        </div>
      </header>

      <Suspense fallback={<Spinner label="Loading widgets" />}>
        <DashboardWidgets />
      </Suspense>
    </DashboardChrome>
  );
}

function DashboardWidgets() {
  const { data } = useSuspenseQuery(dashboardQuery);

  return (
    <>
      <BalanceGrid balances={data.balances} />

      <div className="grid lg:grid-cols-3 gap-6 mt-10">
        <section
          aria-labelledby="earnings-title"
          className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-black/5"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <h2
                id="earnings-title"
                className="text-2xl font-medium text-black"
                style={{ letterSpacing: "-0.03em" }}
              >
                Cumulative earnings
              </h2>
              <p className="text-sm text-black/50 mt-1">Last 12 weeks · USDC denominated</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-medium text-black tabular-nums" style={{ letterSpacing: "-0.03em" }}>
                +${data.earnings[data.earnings.length - 1].value}
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[#C8A04A]/15 text-[#8B6A22] font-medium">
                <TrendingUp className="w-3 h-3" /> +18.4%
              </span>
            </div>
          </div>
          <EarningsChart data={data.earnings} />
        </section>

        <section
          aria-labelledby="activity-title"
          className="bg-white rounded-2xl p-6 sm:p-8 border border-black/5"
        >
          <h2
            id="activity-title"
            className="text-2xl font-medium text-black mb-6"
            style={{ letterSpacing: "-0.03em" }}
          >
            Recent activity
          </h2>
          <ul className="space-y-4">
            {data.activity.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={`mt-1 rounded-full p-2 ${
                    a.in ? "bg-black/5 text-black" : "bg-black text-white"
                  }`}
                >
                  {a.in ? (
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-black font-medium">{a.type}</p>
                  <p className="text-sm text-black/50 truncate">{a.token}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-black tabular-nums">{a.amount}</p>
                  <p className="text-xs text-black/40">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section
        aria-labelledby="positions-title"
        className="mt-10 bg-white rounded-2xl p-6 sm:p-8 border border-black/5"
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            id="positions-title"
            className="text-2xl font-medium text-black"
            style={{ letterSpacing: "-0.03em" }}
          >
            Yield allocations
          </h2>
          <Link
            to="/protocol"
            className="text-sm text-black/60 hover:text-black inline-flex items-center gap-1"
          >
            How it works <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-black/5">
          {data.positions.map((p) => (
            <div
              key={p.venue}
              className="py-4 grid grid-cols-[1fr_auto] sm:grid-cols-[1.4fr_1fr_auto_auto] items-center gap-4"
            >
              <div className="min-w-0">
                <p className="text-black font-medium">{p.venue}</p>
                <p className="text-sm text-black/50 truncate">{p.strategy}</p>
              </div>
              <div className="hidden sm:block">
                <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#C8A04A]" style={{ width: p.allocation }} />
                </div>
                <p className="text-xs text-black/50 mt-1">{p.allocation}</p>
              </div>
              <span className="hidden sm:inline text-sm text-black/70">{p.apy}</span>
              <span className="text-black font-medium tabular-nums">{p.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="reserve-title"
        className="mt-10 bg-black text-white rounded-2xl p-8 sm:p-10 relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(800px 400px at 90% 50%, rgba(200,160,74,0.4), transparent 60%)",
          }}
        />
        <div className="relative grid md:grid-cols-3 gap-8">
          <div>
            <h2
              id="reserve-title"
              className="text-2xl font-medium mb-2"
              style={{ letterSpacing: "-0.03em" }}
            >
              Proof of reserves
            </h2>
            <p className="text-white/60 text-sm">Verifiable on-chain, refreshed every block.</p>
          </div>
          <div>
            <p className="text-white/50 text-sm">Reserve ratio</p>
            <p className="text-4xl font-medium mt-1" style={{ letterSpacing: "-0.03em" }}>
              {data.reserveRatio}
            </p>
          </div>
          <div>
            <p className="text-white/50 text-sm">Total backing</p>
            <p className="text-4xl font-medium mt-1" style={{ letterSpacing: "-0.03em" }}>
              {data.totalBacking}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function BalanceGrid({ balances }: { balances: Balance[] }) {
  return (
    <section aria-labelledby="balances-title">
      <h2 id="balances-title" className="sr-only">
        Balances
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((b) => {
          const Icon = iconMap[b.iconKey];
          return (
            <article key={b.label} className="bg-white rounded-2xl p-6 border border-black/5">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-black/50">{b.label}</span>
                <span className="bg-black/5 rounded-full p-2">
                  <Icon className="w-4 h-4 text-black" />
                </span>
              </div>
              <div className="text-3xl font-medium text-black" style={{ letterSpacing: "-0.03em" }}>
                {b.value}
                {b.suffix && <span className="text-base text-black/40 ml-2">{b.suffix}</span>}
              </div>
              <p className="text-sm text-black/50 mt-2">{b.sub}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
