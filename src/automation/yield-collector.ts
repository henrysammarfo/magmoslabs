import { Transaction } from "@mysten/sui/transactions";
import { fetchProtocolSnapshot } from "@/lib/live-data";
import { fetchBlendedYieldSnapshot } from "@/protocols/index";

export interface YieldCollectorConfig {
  usdcType: string;
  packageId: string;
  allocationRegistryId: string;
  thermalConfigId: string;
  scallopMarketPoolsUrl?: string;
  aftermathPoolsUrl?: string;
  aftermathPoolStatsUrl?: string;
  aftermathBearerToken?: string;
  deepbookSummaryUrl?: string;
}

export interface RebalanceInstruction {
  scallopBps: number;
  aftermathBps: number;
  deepbookBps: number;
  nonce: number;
}

export interface CollectedYieldReport {
  sampledAtMs: number;
  onchainAllocation: { scallopBps: number; aftermathBps: number; deepbookBps: number };
  blendedAprBps: number;
  quotes: Array<{ source: string; aprBps: number; confidence: number; details?: string }>;
}

export async function collectYieldReport(cfg: YieldCollectorConfig): Promise<CollectedYieldReport> {
  const snapshot = await fetchProtocolSnapshot();
  const blended = await fetchBlendedYieldSnapshot(
    {
      scallopBps: snapshot.scallopBps,
      aftermathBps: snapshot.aftermathBps,
      deepbookBps: snapshot.deepbookBps,
    },
    {
      scallopMarketPoolsUrl: cfg.scallopMarketPoolsUrl,
      aftermathPoolsUrl: cfg.aftermathPoolsUrl,
      aftermathPoolStatsUrl: cfg.aftermathPoolStatsUrl,
      aftermathBearerToken: cfg.aftermathBearerToken,
      deepbookSummaryUrl: cfg.deepbookSummaryUrl,
    },
  );
  return {
    sampledAtMs: blended.fetchedAtMs,
    onchainAllocation: blended.allocation,
    blendedAprBps: blended.blendedAprBps,
    quotes: blended.quotes.map((q) => ({
      source: q.source,
      aprBps: q.aprBps,
      confidence: q.confidence,
      details: q.details,
    })),
  };
}

export function buildRebalanceTx(args: {
  cfg: YieldCollectorConfig;
  instruction: RebalanceInstruction;
  signature: number[];
}): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${args.cfg.packageId}::automation::verify_and_rebalance`,
    arguments: [
      tx.object(args.cfg.allocationRegistryId),
      tx.object(args.cfg.thermalConfigId),
      tx.pure.u64(args.instruction.scallopBps),
      tx.pure.u64(args.instruction.aftermathBps),
      tx.pure.u64(args.instruction.deepbookBps),
      tx.pure.u64(args.instruction.nonce),
      tx.pure.vector("u8", args.signature),
    ],
  });
  return tx;
}
