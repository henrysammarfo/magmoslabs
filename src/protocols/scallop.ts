import type { YieldAdapter, YieldQuote } from "./types";
import { getJsonWithTimeout, normalizeBps } from "./http";

interface ScallopPoolLike {
  coinName?: string;
  supplyApy?: number | string;
  apy?: number | string;
}

interface ScallopMarketResponse {
  pools?: ScallopPoolLike[];
}

const FALLBACK_APR_BPS = 1100;
const DEFAULT_SCALLOP_MARKET_URL = "https://sdk.api.scallop.io/api/market/migrate";

export class ScallopAdapter implements YieldAdapter {
  constructor(
    // Official Scallop SDK indexer market endpoint from SDK docs/source.
    private readonly marketPoolsUrl: string = DEFAULT_SCALLOP_MARKET_URL,
    private readonly targetCoin = "wusdc",
  ) {}

  async fetchQuote(): Promise<YieldQuote> {
    try {
      const payload = await getJsonWithTimeout<ScallopMarketResponse>(this.marketPoolsUrl, 8_000);
      const pools = payload.pools ?? [];
      const pool = pools.find(
        (p) => (p.coinName ?? "").toLowerCase() === this.targetCoin.toLowerCase(),
      );
      const raw = Number(pool?.supplyApy ?? pool?.apy ?? 0);
      const aprBps = normalizeBps(raw > 0 && raw < 1 ? raw * 10_000 : raw * 100, FALLBACK_APR_BPS);
      return {
        source: "scallop",
        aprBps,
        confidence: pool ? 0.75 : 0.45,
        fetchedAtMs: Date.now(),
        details: pool ? `coin=${this.targetCoin}` : `coin_not_found:${this.targetCoin}`,
      };
    } catch (error) {
      return {
        source: "scallop",
        aprBps: FALLBACK_APR_BPS,
        confidence: 0.2,
        fetchedAtMs: Date.now(),
        details: `fallback:${error instanceof Error ? error.message : "unknown_error"}`,
      };
    }
  }
}
