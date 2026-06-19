// Mock async loaders so dashboard/docs routes exercise Suspense + error boundaries.
// Pure client-side; swap with real fetchers when the chain wiring lands.

export interface Balance {
  label: string;
  value: string;
  suffix: string;
  sub: string;
  iconKey: "wallet" | "layers" | "trending" | "activity";
}

export interface Position {
  venue: string;
  strategy: string;
  allocation: string;
  apy: string;
  value: string;
}

export interface ActivityItem {
  type: string;
  token: string;
  amount: string;
  time: string;
  in: boolean;
}

export interface EarningsPoint {
  day: string;
  value: number;
}

export type TxKind = "Mint" | "Stake" | "Unstake" | "Rebalance" | "Refine" | "Withdraw";
export type TxStatus = "Confirmed" | "Pending" | "Failed";

export interface Transaction {
  id: string;
  hash: string;
  kind: TxKind;
  token: string;
  amount: string;
  numeric: number; // signed USDC equivalent for sorting
  status: TxStatus;
  timestamp: number; // ms since epoch
}

export interface DashboardData {
  balances: Balance[];
  positions: Position[];
  activity: ActivityItem[];
  earnings: EarningsPoint[];
  reserveRatio: string;
  totalBacking: string;
}

export interface TransactionsQuery {
  search?: string;
  kind?: TxKind | "all";
  status?: TxStatus | "all";
  page?: number;
  pageSize?: number;
}

export interface TransactionsPage {
  rows: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DocSection {
  slug: string;
  title: string;
  body: string;
  tag: string;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchDashboard(): Promise<DashboardData> {
  await wait(450);
  return {
    balances: [
      { label: "AURUM balance", value: "12,480.00", suffix: "AURUM", sub: "≈ $12,480.00", iconKey: "wallet" },
      { label: "sAURUM holdings", value: "9,842.13", suffix: "sAURUM", sub: "Index 1.1247", iconKey: "layers" },
      { label: "30d yield", value: "+148.22", suffix: "USDC", sub: "Net of fees", iconKey: "trending" },
      { label: "Live APY", value: "12.4%", suffix: "", sub: "7-day blended", iconKey: "activity" },
    ],
    positions: [
      { venue: "Scallop", strategy: "USDC lending", allocation: "38%", apy: "9.8%", value: "$4,742" },
      { venue: "DeepBook", strategy: "Market making", allocation: "27%", apy: "14.2%", value: "$3,370" },
      { venue: "Aftermath", strategy: "AMM LP", allocation: "21%", apy: "11.6%", value: "$2,621" },
      { venue: "Reserve buffer", strategy: "T-bill backed", allocation: "14%", apy: "5.1%", value: "$1,747" },
    ],
    activity: [
      { type: "Stake", token: "AURUM → sAURUM", amount: "+2,000.00", time: "2h ago", in: true },
      { type: "Rebalance", token: "Scallop ↔ DeepBook", amount: "—", time: "8h ago", in: true },
      { type: "Mint", token: "USDC → AURUM", amount: "+5,000.00", time: "1d ago", in: true },
      { type: "Unstake", token: "sAURUM → AURUM", amount: "−420.00", time: "3d ago", in: false },
      { type: "Refine", token: "Yield accrued", amount: "+12.40", time: "4d ago", in: true },
    ],
    earnings: [
      { day: "W1", value: 18 },
      { day: "W2", value: 26 },
      { day: "W3", value: 31 },
      { day: "W4", value: 44 },
      { day: "W5", value: 52 },
      { day: "W6", value: 71 },
      { day: "W7", value: 89 },
      { day: "W8", value: 104 },
      { day: "W9", value: 122 },
      { day: "W10", value: 138 },
      { day: "W11", value: 148 },
      { day: "W12", value: 162 },
    ],
    reserveRatio: "102.4%",
    totalBacking: "$24.8M",
  };
}

// ---- Transactions: paginated + filterable ----

const KINDS: TxKind[] = ["Mint", "Stake", "Unstake", "Rebalance", "Refine", "Withdraw"];
const STATUSES: TxStatus[] = ["Confirmed", "Confirmed", "Confirmed", "Confirmed", "Pending", "Failed"];
const TOKENS = [
  "USDC → AURUM",
  "AURUM → sAURUM",
  "sAURUM → AURUM",
  "Scallop ↔ DeepBook",
  "Yield accrued",
  "AURUM → USDC",
];

function seeded(i: number) {
  // Deterministic pseudo-random in [0,1)
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const ALL_TX: Transaction[] = Array.from({ length: 94 }, (_, i) => {
  const kind = KINDS[i % KINDS.length];
  const status = STATUSES[Math.floor(seeded(i) * STATUSES.length)];
  const token = TOKENS[Math.floor(seeded(i + 5) * TOKENS.length)];
  const sign = kind === "Unstake" || kind === "Withdraw" ? -1 : 1;
  const n = Math.round(seeded(i + 11) * 5000 + 20);
  const amount = `${sign < 0 ? "−" : "+"}${n.toLocaleString("en-US")}.${String(
    Math.floor(seeded(i + 17) * 100),
  ).padStart(2, "0")}`;
  const hash = `0x${Math.floor(seeded(i + 23) * 0xfffffff)
    .toString(16)
    .padStart(7, "0")}…${Math.floor(seeded(i + 31) * 0xfffff)
    .toString(16)
    .padStart(5, "0")}`;
  return {
    id: `tx-${i + 1}`,
    hash,
    kind,
    token,
    amount,
    numeric: sign * n,
    status,
    timestamp: Date.now() - i * 1000 * 60 * 47,
  };
});

function fmtTime(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function formatTxTime(ts: number) {
  return fmtTime(ts);
}

export async function fetchTransactions(q: TransactionsQuery = {}): Promise<TransactionsPage> {
  await wait(300);
  // Simulate transient failure rarely (disabled by default)
  const { search = "", kind = "all", status = "all", page = 1, pageSize = 8 } = q;
  const needle = search.trim().toLowerCase();
  const filtered = ALL_TX.filter((t) => {
    if (kind !== "all" && t.kind !== kind) return false;
    if (status !== "all" && t.status !== status) return false;
    if (!needle) return true;
    return (
      t.hash.toLowerCase().includes(needle) ||
      t.token.toLowerCase().includes(needle) ||
      t.kind.toLowerCase().includes(needle)
    );
  });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    rows: filtered.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export async function fetchDocs(): Promise<DocSection[]> {
  await wait(350);
  return [
    { slug: "quickstart", tag: "Start here", title: "Quickstart", body: "Mint AURUM and stake to sAURUM from a script in under 20 lines." },
    { slug: "sdk", tag: "SDK", title: "Move SDK", body: "Typed bindings for every public entry function in the Magmos package." },
    { slug: "indexer", tag: "Data", title: "Indexer", body: "GraphQL endpoint for positions, yields, and reserve history." },
    { slug: "audits", tag: "Security", title: "Audits", body: "Reports from OtterSec and MoveBit, plus an on-chain bug bounty." },
    { slug: "brand", tag: "Design", title: "Brand kit", body: "Logos, wordmarks, and color guidelines for integrators." },
    { slug: "changelog", tag: "Releases", title: "Changelog", body: "Versioned releases of the Magmos Move package." },
  ];
}
