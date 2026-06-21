import type { YieldAdapter, YieldQuote } from "./types";
import { normalizeBps, postJsonWithTimeout } from "./http";

interface AftermathPoolStats {
  apy?: number | string;
  apr?: number | string;
  volume24hUsd?: number | string;
}

interface AftermathStatsResponse {
  data?: AftermathPoolStats[] | AftermathPoolStats;
  poolId?: string;
  objectId?: string;
}

const FALLBACK_APR_BPS = 900;
const DEFAULT_AFTERMATH_STATS_URL = "https://aftermath.finance/api/pools/stats";
const DEFAULT_AFTERMATH_POOLS_URL = "https://aftermath.finance/api/pools";

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export class AftermathAdapter implements YieldAdapter {
  constructor(
    // Official REST API endpoint from Aftermath docs.
    private readonly statsUrl: string = DEFAULT_AFTERMATH_STATS_URL,
    private readonly poolsUrl: string = DEFAULT_AFTERMATH_POOLS_URL,
    private readonly bearerToken?: string,
  ) {}

  async fetchQuote(): Promise<YieldQuote> {
    try {
      const headers = this.bearerToken
        ? { Authorization: `Bearer ${this.bearerToken}` }
        : undefined;
      const pools = await postJsonWithTimeout<Array<{ objectId?: string; poolId?: string }>>(
        this.poolsUrl,
        {},
        8_000,
        headers,
      );
      const ids = pools.map((p) => p.objectId ?? p.poolId ?? "").filter(Boolean);
      const chunks = chunk(ids.slice(0, 80), 40);
      const list: AftermathPoolStats[] = [];
      const responses = await Promise.all(
        chunks.map((group) =>
          postJsonWithTimeout<AftermathStatsResponse[]>(this.statsUrl, { poolIds: group }, 8_000, headers),
        ),
      );
      for (const stats of responses) {
        for (const s of stats) list.push(s);
      }
      if (list.length === 0) {
        return {
          source: "aftermath",
          aprBps: FALLBACK_APR_BPS,
          confidence: 0.35,
          fetchedAtMs: Date.now(),
          details: "fallback:empty_stats",
        };
      }
      const avgRaw =
        list.reduce((sum, s) => sum + Number(s.apy ?? s.apr ?? 0), 0) / Math.max(1, list.length);
      const aprBps = normalizeBps(
        avgRaw > 0 && avgRaw < 1 ? avgRaw * 10_000 : avgRaw * 100,
        FALLBACK_APR_BPS,
      );
      return {
        source: "aftermath",
        aprBps,
        confidence: 0.7,
        fetchedAtMs: Date.now(),
        details: `samples=${list.length}`,
      };
    } catch (error) {
      return {
        source: "aftermath",
        aprBps: FALLBACK_APR_BPS,
        confidence: 0.2,
        fetchedAtMs: Date.now(),
        details: `fallback:${error instanceof Error ? error.message : "unknown_error"}`,
      };
    }
  }
}
