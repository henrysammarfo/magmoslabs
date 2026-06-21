import type { YieldAdapter, YieldQuote } from "./types";
import { normalizeBps, getJsonWithTimeout } from "./http";

interface DeepbookSummaryRow {
  trading_pairs?: string;
  base_currency?: string;
  quote_currency?: string;
  price_change_percent_24h?: number | string;
}

const DEFAULT_DEEPBOOK_SUMMARY_URL = "https://deepbook-indexer.mainnet.mystenlabs.com/summary";
const FALLBACK_APR_BPS = 800;

export class DeepbookAdapter implements YieldAdapter {
  constructor(
    private readonly summaryUrl = DEFAULT_DEEPBOOK_SUMMARY_URL,
    private readonly pair = "SUI_USDC",
  ) {}

  async fetchQuote(): Promise<YieldQuote> {
    try {
      const rows = await getJsonWithTimeout<DeepbookSummaryRow[]>(this.summaryUrl, 9_000);
      const row = rows.find(
        (r) =>
          (r.trading_pairs ?? "").toUpperCase() === this.pair ||
          ((r.base_currency ?? "").toUpperCase() === "SUI" &&
            (r.quote_currency ?? "").toUpperCase() === "USDC"),
      );
      const changePct = Number(row?.price_change_percent_24h ?? 0);
      // Conservative heuristic: map 24h price-volatility signal to strategy APR band.
      const aprBps = normalizeBps(700 + Math.abs(changePct) * 120, FALLBACK_APR_BPS);
      return {
        source: "deepbook",
        aprBps,
        confidence: row ? 0.8 : 0.45,
        fetchedAtMs: Date.now(),
        details: row ? `pair=${this.pair};change24h=${changePct.toFixed(2)}%` : "pair_not_found",
      };
    } catch (error) {
      return {
        source: "deepbook",
        aprBps: FALLBACK_APR_BPS,
        confidence: 0.2,
        fetchedAtMs: Date.now(),
        details: `fallback:${error instanceof Error ? error.message : "unknown_error"}`,
      };
    }
  }
}
