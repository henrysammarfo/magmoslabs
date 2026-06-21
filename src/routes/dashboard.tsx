import { Navigate, createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useMemo } from "react";
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
import { ErrorState } from "../components/landing/ErrorState";
import { EarningsChart } from "../components/dashboard/EarningsChart";
import { DashboardSkeleton } from "../components/dashboard/DashboardSkeleton";
import { TransactionsTable } from "../components/dashboard/TransactionsTable";
import { fetchDashboard, type Balance } from "../lib/live-data";
import { loadProfile } from "../lib/profile";

const dashboardQuery = queryOptions({
  queryKey: ["dashboard", { owner: "" }],
  queryFn: () => fetchDashboard(""),
  staleTime: 30_000,
});

export const Route = createFileRoute("/dashboard")({
  ssr: false,
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
  component: DashboardPage,
  pendingComponent: DashboardPending,
  errorComponent: DashboardError,
  notFoundComponent: () => (
    <DashboardChrome>
      <ErrorState
        title="Page not found."
        message="That dashboard view doesn't exist."
        homeHref="/dashboard"
      />
    </DashboardChrome>
  ),
});

const iconMap = {
  wallet: Wallet,
  layers: Layers,
  trending: TrendingUp,
  activity: Activity,
} as const;

function DashboardHeaderShell({ displayName }: { displayName: string }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 mb-10">
      <div>
        <p className="text-sm text-black/50 uppercase tracking-widest mb-3">Dashboard</p>
        <h1
          className="text-black text-4xl md:text-5xl font-medium"
          style={{ letterSpacing: "-0.04em" }}
        >
          Welcome back, {displayName}.
        </h1>
        <p className="text-black/60 mt-3 max-w-xl">
          Your AURUM stays $1. Your sAURUM compounds while you sleep. Track everything in one place.
        </p>
      </div>
    </header>
  );
}

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
  const account = useCurrentAccount();
  if (!account?.address) return <Navigate to="/" />;
  const displayName = useMemo(() => {
    const profileName = loadProfile(account?.address)?.name?.trim();
    return profileName || "Forgekeeper";
  }, [account?.address]);

  return (
    <DashboardChrome>
      <DashboardHeaderShell displayName={displayName} />
      <DashboardSkeleton />
    </DashboardChrome>
  );
}

function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const account = useCurrentAccount();
  if (!account?.address) return <Navigate to="/" />;
  const displayName = useMemo(() => {
    const profileName = loadProfile(account?.address)?.name?.trim();
    return profileName || "Forgekeeper";
  }, [account?.address]);
  return (
    <DashboardChrome>
      <DashboardHeaderShell displayName={displayName} />
      <ErrorState
        title="Your dashboard didn't load."
        message="We couldn't reach the yield indexer. Your positions are safe on-chain — only this view failed. Try again, or head home while we recover."
        details={error.message}
        homeHref="/"
        onRetry={() => {
          reset();
          router.invalidate();
        }}
      />
    </DashboardChrome>
  );
}

function DashboardPage() {
  const account = useCurrentAccount();
  if (!account?.address) return <Navigate to="/" />;
  const displayName = useMemo(() => {
    const profileName = loadProfile(account?.address)?.name?.trim();
    return profileName || "Forgekeeper";
  }, [account?.address]);

  return (
    <DashboardChrome>
      <header className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-sm text-black/50 uppercase tracking-widest mb-3">Dashboard</p>
          <h1
            className="text-black text-4xl md:text-5xl font-medium"
            style={{ letterSpacing: "-0.04em" }}
          >
            Welcome back, {displayName}.
          </h1>
          <p className="text-black/60 mt-3 max-w-xl">
            Your AURUM stays $1. Your sAURUM compounds while you sleep. Track everything in one
            place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/aurum"
            className="inline-flex items-center gap-3 bg-black text-white font-medium pl-6 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            Mint AURUM
            <span className="bg-white rounded-full p-1.5">
              <ArrowRight className="w-4 h-4 text-black" />
            </span>
          </Link>
          <Link
            to="/saurum"
            className="inline-flex items-center px-6 py-3 rounded-full border border-black/15 text-black font-medium hover:bg-black/5 transition-colors"
          >
            Stake to sAURUM
          </Link>
          <a
            href="/aurum#withdraw"
            className="inline-flex items-center px-6 py-3 rounded-full border border-black/15 text-black font-medium hover:bg-black/5 transition-colors"
          >
            Withdraw
          </a>
        </div>
      </header>

      <DashboardWidgets />
    </DashboardChrome>
  );
}

function DashboardWidgets() {
  const account = useCurrentAccount();
  const owner = account?.address ?? "";
  if (!owner) return <Navigate to="/" />;
  const { data, isPending, isError, error, refetch } = useQuery({
    ...dashboardQuery,
    queryKey: ["dashboard", { owner }],
    queryFn: () => fetchDashboard(owner),
    enabled: Boolean(owner),
  });
  if (isError) {
    return (
      <ErrorState
        title="Your dashboard didn't load."
        message="Live data sources did not respond. Retry to fetch on-chain state again."
        details={error.message}
        onRetry={() => void refetch()}
      />
    );
  }
  if (isPending || !data) return <DashboardSkeleton />;

  return (
    <>
      <BalanceGrid balances={data.balances} />

      <div className="grid lg:grid-cols-3 gap-6 mt-10">
        <section
          aria-labelledby="earnings-title"
          className="lg:col-span-2 magmos-card rounded-3xl p-6 sm:p-8 relative overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-60"
            style={{
              background: "radial-gradient(circle, rgba(200,160,74,0.18), transparent 65%)",
            }}
          />
          <div className="relative flex flex-wrap items-end justify-between gap-3 mb-6">
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
              <span
                className="text-3xl font-medium text-black tabular-nums"
                style={{ letterSpacing: "-0.03em" }}
              >
                +${data.earnings[data.earnings.length - 1].value.toFixed(3)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[#C8A04A]/15 text-[#8B6A22] font-medium">
                <TrendingUp className="w-3 h-3" /> +18.4%
              </span>
            </div>
          </div>
          <div className="relative">
            <EarningsChart data={data.earnings} />
          </div>
        </section>

        <section aria-labelledby="activity-title" className="magmos-card rounded-3xl p-6 sm:p-8">
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
        className="mt-10 magmos-card rounded-3xl p-6 sm:p-8"
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
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: p.allocation,
                      background: "linear-gradient(90deg, #8B6A22, #C8A04A 60%, #F1D38A)",
                    }}
                  />
                </div>
                <p className="text-xs text-black/50 mt-1">{p.allocation}</p>
              </div>
              <span className="hidden sm:inline text-sm text-black/70">{p.apy}</span>
              <span className="text-black font-medium tabular-nums">{p.value}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10">
        <TransactionsTable owner={owner} />
      </div>

      <section
        aria-labelledby="reserve-title"
        className="mt-10 magmos-card-dark text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(800px 400px at 90% 50%, rgba(200,160,74,0.45), transparent 60%)",
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
            <article key={b.label} className="magmos-card rounded-2xl p-6 relative overflow-hidden">
              <span
                aria-hidden="true"
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-50"
                style={{
                  background: "radial-gradient(circle, rgba(200,160,74,0.18), transparent 70%)",
                }}
              />
              <div className="relative flex items-center justify-between mb-6">
                <span className="text-sm text-black/50">{b.label}</span>
                <span className="bg-black/5 rounded-full p-2 border border-black/5">
                  <Icon className="w-4 h-4 text-black" />
                </span>
              </div>
              <div
                className="relative text-3xl font-medium text-black"
                style={{ letterSpacing: "-0.03em" }}
              >
                {b.value}
                {b.suffix && <span className="text-base text-black/40 ml-2">{b.suffix}</span>}
              </div>
              <p className="relative text-sm text-black/50 mt-2">{b.sub}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
