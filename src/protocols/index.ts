import { AftermathAdapter } from "./aftermath";
import { DeepbookAdapter } from "./deepbook";
import { ScallopAdapter } from "./scallop";
import type { AllocationBps, BlendedYieldSnapshot, YieldQuote } from "./types";

function weightedBps(quotes: YieldQuote[], allocation: AllocationBps): number {
  const bySource = new Map(quotes.map((q) => [q.source, q]));
  const scallop = bySource.get("scallop")?.aprBps ?? 0;
  const aftermath = bySource.get("aftermath")?.aprBps ?? 0;
  const deepbook = bySource.get("deepbook")?.aprBps ?? 0;
  return Math.round(
    (scallop * allocation.scallopBps +
      aftermath * allocation.aftermathBps +
      deepbook * allocation.deepbookBps) /
      10_000,
  );
}

export interface YieldIntegrationConfig {
  scallopMarketPoolsUrl?: string;
  aftermathPoolsUrl?: string;
  aftermathPoolStatsUrl?: string;
  aftermathBearerToken?: string;
  deepbookSummaryUrl?: string;
  deepbookPair?: string;
}

export async function fetchBlendedYieldSnapshot(
  allocation: AllocationBps,
  cfg: YieldIntegrationConfig = {},
): Promise<BlendedYieldSnapshot> {
  const adapters = [
    new ScallopAdapter(cfg.scallopMarketPoolsUrl),
    new AftermathAdapter(
      cfg.aftermathPoolStatsUrl,
      cfg.aftermathPoolsUrl,
      cfg.aftermathBearerToken,
    ),
    new DeepbookAdapter(cfg.deepbookSummaryUrl, cfg.deepbookPair ?? "SUI_USDC"),
  ];
  const quotes = await Promise.all(adapters.map((a) => a.fetchQuote()));
  return {
    blendedAprBps: weightedBps(quotes, allocation),
    quotes,
    allocation,
    fetchedAtMs: Date.now(),
  };
}
