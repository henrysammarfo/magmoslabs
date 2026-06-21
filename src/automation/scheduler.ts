export interface PulsePolicy {
  pulsesPerWeek: number;
  minGapHours: number;
  maxJitterHours: number;
}

export interface PulseState {
  lastPulseAtMs: number;
  nextPulseNotBeforeMs: number;
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * 24 * ONE_HOUR_MS;

export function defaultPulsePolicy(): PulsePolicy {
  return {
    pulsesPerWeek: 3,
    minGapHours: 24,
    maxJitterHours: 18,
  };
}

export function computeNextPulseNotBefore(nowMs: number, policy: PulsePolicy): number {
  const baseGap = Math.floor(ONE_WEEK_MS / Math.max(1, policy.pulsesPerWeek));
  const jitter = Math.floor(Math.random() * policy.maxJitterHours * ONE_HOUR_MS);
  return nowMs + Math.max(policy.minGapHours * ONE_HOUR_MS, baseGap - jitter);
}

export function shouldFirePulse(nowMs: number, state: PulseState): boolean {
  return nowMs >= state.nextPulseNotBeforeMs;
}

export class YieldPulseScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly runPulse: () => Promise<void>,
    private readonly policy: PulsePolicy = defaultPulsePolicy(),
    private state: PulseState = {
      lastPulseAtMs: 0,
      nextPulseNotBeforeMs: computeNextPulseNotBefore(Date.now(), defaultPulsePolicy()),
    },
  ) {}

  start(pollEveryMs = 60_000): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.tick();
    }, pollEveryMs);
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  getState(): PulseState {
    return this.state;
  }

  private async tick(): Promise<void> {
    const now = Date.now();
    if (!shouldFirePulse(now, this.state)) return;
    await this.runPulse();
    this.state = {
      lastPulseAtMs: now,
      nextPulseNotBeforeMs: computeNextPulseNotBefore(now, this.policy),
    };
  }
}
