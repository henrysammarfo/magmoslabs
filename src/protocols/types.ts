export type YieldSource = "scallop" | "aftermath" | "deepbook";

export interface YieldQuote {
  source: YieldSource;
  aprBps: number;
  confidence: number; // 0..1
  fetchedAtMs: number;
  details?: string;
}

export interface AllocationBps {
  scallopBps: number;
  aftermathBps: number;
  deepbookBps: number;
}

export interface BlendedYieldSnapshot {
  blendedAprBps: number;
  quotes: YieldQuote[];
  allocation: AllocationBps;
  fetchedAtMs: number;
}

export interface YieldAdapter {
  fetchQuote(): Promise<YieldQuote>;
}
