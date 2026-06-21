import { useEffect, useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { fetchTransactions, formatTxTime, type TxKind, type TxStatus } from "../../lib/live-data";
import { Skeleton } from "../landing/Skeleton";
import { ErrorState } from "../landing/ErrorState";

const KINDS: (TxKind | "all")[] = [
  "all",
  "Mint",
  "Stake",
  "Unstake",
  "Rebalance",
  "Refine",
  "Withdraw",
];
const STATUSES: (TxStatus | "all")[] = ["all", "Confirmed", "Pending", "Failed"];

const statusStyles: Record<TxStatus, { dot: string; pill: string; Icon: typeof CheckCircle2 }> = {
  Confirmed: { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700", Icon: CheckCircle2 },
  Pending: { dot: "bg-amber-500", pill: "bg-amber-50 text-amber-700", Icon: Clock },
  Failed: { dot: "bg-red-500", pill: "bg-red-50 text-red-700", Icon: XCircle },
};

export function TransactionsTable({ owner }: { owner?: string }) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [kind, setKind] = useState<TxKind | "all">("all");
  const [status, setStatus] = useState<TxStatus | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debounced, kind, status]);

  const query = useQuery({
    queryKey: ["transactions", { owner, search: debounced, kind, status, page, pageSize }],
    queryFn: () => fetchTransactions({ owner, search: debounced, kind, status, page, pageSize }),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    enabled: Boolean(owner),
  });

  const data = query.data;
  const showInitialSkeleton = query.isPending;
  const isFetching = query.isFetching && !showInitialSkeleton;

  const range = useMemo(() => {
    if (!data || data.total === 0) return "0";
    const start = (data.page - 1) * data.pageSize + 1;
    const end = Math.min(start + data.rows.length - 1, data.total);
    return `${start}–${end} of ${data.total}`;
  }, [data]);

  return (
    <section aria-labelledby="tx-title" className="magmos-card rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2
            id="tx-title"
            className="text-2xl font-medium text-black"
            style={{ letterSpacing: "-0.03em" }}
          >
            Transactions
          </h2>
          <p className="text-sm text-black/50 mt-1">
            {showInitialSkeleton ? "Loading ledger…" : `Showing ${range}`}
            {isFetching && !showInitialSkeleton && (
              <span className="ml-2 text-[#8B6A22]">· updating</span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Search transactions</span>
            <Search className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hash, token, type…"
              className="pl-9 pr-3 py-2 w-64 max-w-full text-sm rounded-full bg-[#F5F5F5] border border-transparent focus:border-black focus:outline-none text-black placeholder:text-black/40"
            />
          </label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as TxKind | "all")}
            aria-label="Filter by type"
            className="text-sm px-3 py-2 rounded-full bg-[#F5F5F5] border border-transparent focus:border-black focus:outline-none text-black"
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k === "all" ? "All types" : k}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TxStatus | "all")}
            aria-label="Filter by status"
            className="text-sm px-3 py-2 rounded-full bg-[#F5F5F5] border border-transparent focus:border-black focus:outline-none text-black"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!owner ? (
        <EmptyState
          hasFilters={false}
          onClear={() => {
            setSearch("");
            setKind("all");
            setStatus("all");
          }}
          title="Connect wallet to view your history."
          message="This ledger view is wallet-bound and shows only the connected wallet activity."
        />
      ) : query.isError ? (
        <ErrorState
          compact
          title="Couldn't load transactions."
          message="The ledger feed didn't respond. Retry to refetch the latest activity."
          onRetry={() => query.refetch()}
        />
      ) : showInitialSkeleton ? (
        <TableSkeleton />
      ) : data && data.rows.length === 0 ? (
        <EmptyState
          hasFilters={!!debounced || kind !== "all" || status !== "all"}
          onClear={() => {
            setSearch("");
            setKind("all");
            setStatus("all");
          }}
        />
      ) : (
        <>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-black/45 text-xs uppercase tracking-widest">
                  <th className="text-left font-medium px-2 py-3">Type</th>
                  <th className="text-left font-medium px-2 py-3">Pair</th>
                  <th className="text-left font-medium px-2 py-3 hidden md:table-cell">Hash</th>
                  <th className="text-left font-medium px-2 py-3 hidden sm:table-cell">Status</th>
                  <th className="text-right font-medium px-2 py-3">Amount</th>
                  <th className="text-right font-medium px-2 py-3 hidden md:table-cell">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {data!.rows.map((t) => {
                  const s = statusStyles[t.status];
                  const incoming = t.numeric >= 0;
                  return (
                    <tr key={t.id} className="hover:bg-black/[0.02] transition-colors">
                      <td className="px-2 py-4">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`rounded-full p-1.5 ${incoming ? "bg-black/5 text-black" : "bg-black text-white"}`}
                          >
                            {incoming ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                          </span>
                          <span className="text-black font-medium">{t.kind}</span>
                        </span>
                      </td>
                      <td className="px-2 py-4 text-black/70">{t.token}</td>
                      <td className="px-2 py-4 hidden md:table-cell">
                        <code className="text-xs text-black/55 font-mono">{t.hash}</code>
                      </td>
                      <td className="px-2 py-4 hidden sm:table-cell">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {t.status}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-right font-medium text-black tabular-nums">
                        {t.amount}
                      </td>
                      <td className="px-2 py-4 text-right text-black/50 tabular-nums hidden md:table-cell">
                        {formatTxTime(t.timestamp)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-black/50">
              Page {data!.page} of {data!.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={data!.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
                className="p-2 rounded-full border border-black/10 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={data!.page >= data!.totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
                className="p-2 rounded-full border border-black/10 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="grid grid-cols-6 gap-3 px-2 py-3 border-b border-black/5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, r) => (
        <div key={r} className="grid grid-cols-6 gap-3 px-2 py-4 items-center">
          {Array.from({ length: 6 }).map((_, c) => (
            <Skeleton key={c} className="h-4" style={{ width: `${60 + ((c * 7) % 35)}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
  title,
  message,
}: {
  hasFilters: boolean;
  onClear: () => void;
  title?: string;
  message?: string;
}) {
  return (
    <div className="text-center py-14 px-6">
      <span className="inline-flex rounded-full bg-black/[0.04] border border-black/5 p-4 mb-4">
        <Inbox className="w-6 h-6 text-black/60" />
      </span>
      <h3 className="text-lg font-medium text-black mb-1" style={{ letterSpacing: "-0.02em" }}>
        {title ?? (hasFilters ? "No transactions match those filters." : "No transactions yet.")}
      </h3>
      <p className="text-black/55 max-w-sm mx-auto mb-5">
        {message ??
          (hasFilters
            ? "Try widening the date range or clearing filters to see more activity."
            : "Mint AURUM or stake to sAURUM to start your on-chain history.")}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center px-5 py-2 rounded-full border border-black/15 text-black font-medium hover:bg-black/5"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
