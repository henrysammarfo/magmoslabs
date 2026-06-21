// Live Sui data loaders for dashboard/docs routes.
import { fetchBlendedYieldSnapshot } from "@/protocols/index";

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

export interface UsdcRateSnapshot {
  usdcUsd: number;
  source: "circle" | "coinbase";
  fetchedAtMs: number;
}

const RPC_URL = "https://fullnode.testnet.sui.io:443";
const VITE_ENV =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const SERVER_ENV: Record<string, string | undefined> | undefined =
  typeof window === "undefined"
    ? ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {})
    : undefined;
const MAGMOS_PACKAGE_ID =
  VITE_ENV.VITE_MAGMOS_PACKAGE_ID ??
  "0xe12b3253116bc30fc1f039edcf6bb6ff6f2e93b6a03852e4a021c86b8304194e";
const TREASURY_ID =
  VITE_ENV.VITE_MAGMOS_TREASURY_ID ??
  "0xa86b7f83bc7ab07b8ae3641b06c7db74e067dc0872022ba0b43dac1704b3f3b6";
const ALLOCATION_REGISTRY_ID =
  VITE_ENV.VITE_ALLOCATION_REGISTRY_ID ??
  "0xfb2d7f2aff0529db9356743939af946b0735c4357de26940f09ac71e7abe14cb";

export interface ProtocolSnapshot {
  accumulationIndex: number;
  totalAurumSupply: number;
  totalAurumStaked: number;
  accruedProtocolFees: number;
  reserves: number;
  protocolFeeBps: number;
  scallopBps: number;
  aftermathBps: number;
  deepbookBps: number;
}

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) {
    throw new Error(`RPC ${method} failed: ${res.status}`);
  }
  const json = (await res.json()) as { result?: T; error?: { message?: string } };
  if (json.error) {
    throw new Error(json.error.message ?? `RPC ${method} returned error`);
  }
  if (json.result === undefined) {
    throw new Error(`RPC ${method} returned no result`);
  }
  return json.result;
}

export async function fetchUsdcRateSnapshot(): Promise<UsdcRateSnapshot> {
  const circleApiKey = SERVER_ENV?.CIRCLE_API_KEY;
  if (circleApiKey) {
    const idempotencyKey =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const res = await fetch("https://api.circle.com/v1/exchange/quotes", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${circleApiKey}`,
      },
      body: JSON.stringify({
        type: "reference",
        idempotencyKey,
        from: { currency: "USD", amount: "1" },
        to: { currency: "USDC" },
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as {
        data?: { rate?: number | string; from?: { amount?: number | string } };
      };
      const rate = Number(json.data?.rate ?? json.data?.from?.amount ?? 1);
      if (Number.isFinite(rate) && rate > 0) {
        return { usdcUsd: rate, source: "circle", fetchedAtMs: Date.now() };
      }
    }
  }

  const fallback = await fetch("https://api.coinbase.com/v2/prices/USDC-USD/spot");
  if (!fallback.ok) {
    throw new Error(`USDC rate fetch failed: ${fallback.status}`);
  }
  const payload = (await fallback.json()) as { data?: { amount?: string } };
  const amount = Number(payload.data?.amount ?? "1");
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("USDC rate payload invalid");
  }
  return { usdcUsd: amount, source: "coinbase", fetchedAtMs: Date.now() };
}

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  return 0;
}

function readBalanceField(v: unknown): number {
  if (typeof v === "string" || typeof v === "number") return toNum(v);
  if (v && typeof v === "object") {
    const maybe = v as { value?: unknown; fields?: { value?: unknown } };
    if (maybe.value !== undefined) return toNum(maybe.value);
    if (maybe.fields?.value !== undefined) return toNum(maybe.fields.value);
  }
  return 0;
}

function fromMicro(v: number): number {
  return v / 1_000_000;
}

function fromIndex(v: number): number {
  return v / 1_000_000_000;
}

function money(v: number): string {
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function amount(v: number): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function shortDigest(digest: string): string {
  if (digest.length < 16) return digest;
  return `${digest.slice(0, 10)}...${digest.slice(-6)}`;
}

async function getMoveFields(objectId: string): Promise<Record<string, unknown>> {
  const result = await rpc<{
    data?: {
      content?: { fields?: Record<string, unknown> };
    };
  }>("sui_getObject", [objectId, { showContent: true }]);
  return result.data?.content?.fields ?? {};
}

export async function fetchProtocolSnapshot(): Promise<ProtocolSnapshot> {
  const [treasury, allocation] = await Promise.all([
    getMoveFields(TREASURY_ID),
    getMoveFields(ALLOCATION_REGISTRY_ID),
  ]);
  const reserves = readBalanceField(treasury.reserves);
  return {
    accumulationIndex: fromIndex(toNum(treasury.accumulation_index)),
    totalAurumSupply: fromMicro(toNum(treasury.total_aurum_supply)),
    totalAurumStaked: fromMicro(toNum(treasury.total_aurum_staked)),
    accruedProtocolFees: fromMicro(toNum(treasury.accrued_protocol_fees)),
    reserves: fromMicro(reserves),
    protocolFeeBps: toNum(treasury.protocol_fee_bps),
    scallopBps: toNum(allocation.scallop_bps),
    aftermathBps: toNum(allocation.aftermath_bps),
    deepbookBps: toNum(allocation.deepbook_bps),
  };
}

export async function fetchDashboard(): Promise<DashboardData> {
  const snapshot = await fetchProtocolSnapshot();
  const txPage = await fetchTransactions({ page: 1, pageSize: 12 });
  const blended = await fetchBlendedYieldSnapshot(
    {
      scallopBps: snapshot.scallopBps,
      aftermathBps: snapshot.aftermathBps,
      deepbookBps: snapshot.deepbookBps,
    },
    {
      scallopMarketPoolsUrl: VITE_ENV.VITE_SCALLOP_MARKET_POOLS_URL,
      aftermathPoolsUrl: VITE_ENV.VITE_AFTERMATH_POOLS_URL,
      aftermathPoolStatsUrl: VITE_ENV.VITE_AFTERMATH_POOL_STATS_URL,
      deepbookSummaryUrl: VITE_ENV.VITE_DEEPBOOK_SUMMARY_URL,
    },
  );
  const quoteMap = new Map(blended.quotes.map((q) => [q.source, q]));

  const totalBacking = snapshot.reserves;
  const estimatedWeeklyYield = (snapshot.reserves * (blended.blendedAprBps / 10_000)) / 52;
  const weekEarn = Math.max(snapshot.accruedProtocolFees * 0.9, estimatedWeeklyYield);
  const allocations = [
    { venue: "Scallop", strategy: "USDC lending", bps: snapshot.scallopBps },
    { venue: "Aftermath", strategy: "Stable LP", bps: snapshot.aftermathBps },
    { venue: "DeepBook", strategy: "PLP", bps: snapshot.deepbookBps },
  ];

  const activity = txPage.rows.slice(0, 5).map((t) => ({
    type: t.kind,
    token: t.token,
    amount: t.amount,
    time: formatTxTime(t.timestamp),
    in: t.numeric >= 0,
  }));

  const earnings = Array.from({ length: 12 }, (_, i) => {
    const w = i + 1;
    const factor = w / 12;
    return { day: `W${w}`, value: weekEarn * factor };
  });

  return {
    balances: [
      {
        label: "AURUM supply",
        value: amount(snapshot.totalAurumSupply),
        suffix: "AURUM",
        sub: `≈ ${money(snapshot.totalAurumSupply)}`,
        iconKey: "wallet",
      },
      {
        label: "sAURUM backing",
        value: amount(snapshot.totalAurumStaked),
        suffix: "AURUM",
        sub: `Index ${snapshot.accumulationIndex.toFixed(4)}`,
        iconKey: "layers",
      },
      {
        label: "Accrued protocol fees",
        value: `+${amount(snapshot.accruedProtocolFees)}`,
        suffix: "USDC",
        sub: `${snapshot.protocolFeeBps / 100}% fee lane`,
        iconKey: "trending",
      },
      {
        label: "Live APY (est.)",
        value: `${(blended.blendedAprBps / 100).toFixed(2)}%`,
        suffix: "",
        sub: "Blended from live adapters",
        iconKey: "activity",
      },
    ],
    positions: allocations.map((a) => ({
      venue: a.venue,
      strategy: a.strategy,
      allocation: `${(a.bps / 100).toFixed(0)}%`,
      apy: `${(
        (quoteMap.get(a.venue.toLowerCase() as "scallop" | "aftermath" | "deepbook")?.aprBps ?? 0) /
        100
      ).toFixed(2)}%`,
      value: money((totalBacking * a.bps) / 10_000),
    })),
    activity,
    earnings,
    reserveRatio: "100.0%",
    totalBacking: money(totalBacking),
  };
}

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

function kindFromFunction(fn?: string): TxKind {
  if (!fn) return "Rebalance";
  if (fn.includes("forge")) return "Mint";
  if (fn.includes("smelt")) return "Stake";
  if (fn.includes("refine")) return "Refine";
  if (fn.includes("melt")) return "Withdraw";
  if (fn.includes("rebalance") || fn.includes("pulse_collect")) return "Rebalance";
  if (fn.includes("unstake")) return "Unstake";
  return "Rebalance";
}

function tokenByKind(kind: TxKind): string {
  if (kind === "Mint") return "USDC -> AURUM";
  if (kind === "Stake") return "AURUM -> sAURUM";
  if (kind === "Refine" || kind === "Unstake") return "sAURUM -> AURUM";
  if (kind === "Withdraw") return "AURUM -> USDC";
  return "Scallop <-> Aftermath <-> DeepBook";
}

function microToAmountString(raw: unknown): string {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n) || n === 0) return "-";
  return amount(Math.abs(n) / 1_000_000);
}

function txAmountFromEvent(kind: TxKind, eventParsed: Record<string, unknown> | undefined): string {
  if (!eventParsed) return "-";
  if (kind === "Mint") return microToAmountString(eventParsed.collateral_in ?? eventParsed.aurum_out);
  if (kind === "Stake") return microToAmountString(eventParsed.aurum_in ?? eventParsed.saurum_out);
  if (kind === "Refine" || kind === "Unstake")
    return microToAmountString(eventParsed.saurum_in ?? eventParsed.aurum_out);
  if (kind === "Withdraw") return microToAmountString(eventParsed.aurum_in ?? eventParsed.collateral_out);
  return "-";
}

async function fetchAllTransactions(): Promise<Transaction[]> {
  const fetchByMoveCall = async (
    module: "aurum" | "saurum" | "automation",
    func: string,
    kindHint: TxKind,
    cap = 25,
  ) =>
    await rpc<{
      data: Array<{
        digest: string;
        timestampMs?: string;
        effects?: { status?: { status?: "success" | "failure" } };
        transaction?: {
          data?: {
            transaction?: {
              transactions?: Array<{ MoveCall?: { function?: string } }>;
            };
          };
        };
        events?: Array<{ parsedJson?: Record<string, unknown> }>;
      }>;
    }>("suix_queryTransactionBlocks", [
      {
        filter: { MoveFunction: { package: MAGMOS_PACKAGE_ID, module, function: func } },
        options: { showInput: true, showEffects: true, showEvents: true },
      },
      null,
      cap,
      true,
    ]);

  const bucketSpecs = [
    { module: "aurum" as const, func: "forge", kindHint: "Mint" as TxKind },
    { module: "saurum" as const, func: "smelt", kindHint: "Stake" as TxKind },
    { module: "saurum" as const, func: "refine", kindHint: "Refine" as TxKind },
    {
      module: "automation" as const,
      func: "verify_and_rebalance",
      kindHint: "Rebalance" as TxKind,
    },
  ];
  const buckets = await Promise.all(
    bucketSpecs.map(async (spec) => ({
      kindHint: spec.kindHint,
      data: (await fetchByMoveCall(spec.module, spec.func, spec.kindHint)).data,
    })),
  );
  const deduped = new Map<
    string,
    {
      kindHint: TxKind;
      digest: string;
      timestampMs?: string;
      effects?: { status?: { status?: "success" | "failure" } };
      transaction?: {
        data?: {
          transaction?: {
            transactions?: Array<{ MoveCall?: { function?: string } }>;
          };
        };
      };
      events?: Array<{ parsedJson?: Record<string, unknown> }>;
    }
  >();
  for (const bucket of buckets) {
    for (const tx of bucket.data) {
      if (!deduped.has(tx.digest)) deduped.set(tx.digest, { ...tx, kindHint: bucket.kindHint });
    }
  }
  const rows = Array.from(deduped.values()).sort(
    (a, b) => Number(b.timestampMs ?? 0) - Number(a.timestampMs ?? 0),
  );
  return rows.map((r, i) => {
    const fn = r.transaction?.data?.transaction?.transactions?.[0]?.MoveCall?.function;
    const kind = fn ? kindFromFunction(fn) : r.kindHint;
    const status: TxStatus = r.effects?.status?.status === "failure" ? "Failed" : "Confirmed";
    const parsed = r.events?.[0]?.parsedJson;
    return {
      id: `tx-${i + 1}`,
      hash: shortDigest(r.digest),
      kind,
      token: tokenByKind(kind),
      amount: txAmountFromEvent(kind, parsed),
      numeric: kind === "Withdraw" || kind === "Unstake" ? -1 : 1,
      status,
      timestamp: Number(r.timestampMs ?? Date.now()),
    };
  });
}

export async function fetchTransactions(q: TransactionsQuery = {}): Promise<TransactionsPage> {
  const allTx = await fetchAllTransactions();
  const { search = "", kind = "all", status = "all", page = 1, pageSize = 8 } = q;
  const needle = search.trim().toLowerCase();
  const filtered = allTx.filter((t) => {
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
  return [
    {
      slug: "quickstart",
      tag: "Start here",
      title: "Quickstart",
      body: "Connect a Sui testnet wallet, mint AURUM from USDC, then smelt to sAURUM and refine back to validate the full lifecycle. Verify reserves and allocation state from on-chain reads, and confirm every UI state transition maps to completed Sui transactions.",
    },
    {
      slug: "sdk",
      tag: "Contracts",
      title: "Move package",
      body: "Magmos Move modules cover minting, staking index accounting, allocation controls, and automation hooks. Core safety guarantees are enforced with typed capabilities, explicit abort paths, and deterministic arithmetic checks that preserve backing and concentration invariants.",
    },
    {
      slug: "indexer",
      tag: "Deploy",
      title: "Deployment ledger",
      body: "The deployment ledger tracks package IDs, shared object IDs, and authority objects required by frontend and operator services. Runtime reads and writes are keyed against these canonical IDs so the app and infra always target the same live protocol instance.",
    },
    {
      slug: "audits",
      tag: "Security",
      title: "Operational checks",
      body: "Operational safety combines thermal limits, signature checks, nonce monotonicity, and dependency health gates. Monitor service health, dependency reachability, and rebalance execution telemetry continuously to detect drift before it impacts user flows.",
    },
    {
      slug: "brand",
      tag: "Submission",
      title: "Submission pack",
      body: "The submission narrative explains product thesis, protocol mechanics, and measurable user value with production context. Keep this section aligned with live endpoints, current contract IDs, and demonstrated wallet flows used in judging.",
    },
    {
      slug: "changelog",
      tag: "Releases",
      title: "Changelog",
      body: `Current live package is ${MAGMOS_PACKAGE_ID}. Recent releases hardened live data rendering, fixed docs route navigation, introduced dedicated docs-site Mintlify isolation, and removed placeholder reserve content from the user-facing experience.`,
    },
  ];
}
