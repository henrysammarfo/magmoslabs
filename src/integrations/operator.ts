import {
  buildRebalanceTx,
  collectYieldReport,
  type CollectedYieldReport,
  type YieldCollectorConfig,
} from "@/automation/yield-collector";
import type { NautilusClient, NautilusSignedDecision } from "./nautilus";
import { signatureBytesFromDecision, verifyNautilusDecision } from "./nautilus";

export interface OperatorThermalLimits {
  maxConcentrationBps: number;
  minAprBps: number;
}

export interface OperatorConfig extends YieldCollectorConfig {
  thermal: OperatorThermalLimits;
  nautilusPublicKeySpkiBase64: string;
  minDecisionLifetimeMs?: number;
  nautilusMaxClockSkewMs?: number;
  nautilusExpectedKeyId?: string;
}

export interface OperatorCycleSuccess {
  ok: true;
  report: CollectedYieldReport;
  decision: NautilusSignedDecision;
  txBuilt: true;
  skipped: false;
}

export interface OperatorCycleSkipped {
  ok: true;
  report: CollectedYieldReport;
  txBuilt: false;
  skipped: true;
  reason: string;
}

export interface OperatorCycleFailure {
  ok: false;
  stage: "collect" | "nautilus" | "verify" | "build";
  message: string;
}

export type OperatorCycleResult =
  | OperatorCycleSuccess
  | OperatorCycleSkipped
  | OperatorCycleFailure;

export class ExternalIntegrationOperator {
  constructor(
    private readonly cfg: OperatorConfig,
    private readonly nautilus: NautilusClient,
  ) {}

  async runCycle(): Promise<OperatorCycleResult> {
    let report: CollectedYieldReport;
    try {
      report = await collectYieldReport(this.cfg);
    } catch (error) {
      return {
        ok: false,
        stage: "collect",
        message: error instanceof Error ? error.message : "collect_failed",
      };
    }

    let decision: NautilusSignedDecision;
    try {
      decision = await this.nautilus.requestDecision(report);
    } catch (error) {
      return {
        ok: false,
        stage: "nautilus",
        message: error instanceof Error ? error.message : "nautilus_failed",
      };
    }

    try {
      await verifyNautilusDecision(decision, this.cfg.nautilusPublicKeySpkiBase64, {
        maxClockSkewMs: this.cfg.nautilusMaxClockSkewMs,
        expectedKeyId: this.cfg.nautilusExpectedKeyId,
      });
    } catch (error) {
      return {
        ok: false,
        stage: "verify",
        message: error instanceof Error ? error.message : "verification_failed",
      };
    }

    const lifetime = decision.payload.expiresAtMs - decision.payload.issuedAtMs;
    if (lifetime < (this.cfg.minDecisionLifetimeMs ?? 30_000)) {
      return { ok: true, report, txBuilt: false, skipped: true, reason: "decision_ttl_too_short" };
    }
    if (
      report.blendedAprBps < this.cfg.thermal.minAprBps &&
      decision.payload.rationale.length === 0
    ) {
      return {
        ok: true,
        report,
        txBuilt: false,
        skipped: true,
        reason: "missing_emergency_rationale",
      };
    }

    try {
      buildRebalanceTx({
        cfg: this.cfg,
        instruction: decision.payload.instruction,
        signature: signatureBytesFromDecision(decision),
      });
      return { ok: true, report, decision, txBuilt: true, skipped: false };
    } catch (error) {
      return {
        ok: false,
        stage: "build",
        message: error instanceof Error ? error.message : "tx_build_failed",
      };
    }
  }
}
