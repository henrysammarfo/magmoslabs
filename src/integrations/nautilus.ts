import type { CollectedYieldReport, RebalanceInstruction } from "@/automation/yield-collector";
import { withExponentialBackoff } from "@/protocols/http";
export interface NautilusDecisionPayload {
  instruction: RebalanceInstruction;
  rationale: string;
  issuedAtMs: number;
  expiresAtMs: number;
}

export interface NautilusSignedDecision {
  payload: NautilusDecisionPayload;
  signatureBase64: string;
  keyId: string;
  algorithm: "Ed25519";
}

export interface NautilusClient {
  requestDecision(report: CollectedYieldReport): Promise<NautilusSignedDecision>;
}

export interface HttpNautilusClientConfig {
  endpoint: string;
  bearerToken?: string;
  timeoutMs?: number;
}

export interface VerifyNautilusDecisionOptions {
  maxClockSkewMs?: number;
  expectedKeyId?: string;
  nowMs?: number;
}

function encodeU64LE(value: number): Uint8Array {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid u64 value: ${value}`);
  }
  const big = BigInt(value);
  const out = new Uint8Array(8);
  let tmp = big;
  for (let i = 0; i < 8; i += 1) {
    out[i] = Number(tmp & 0xffn);
    tmp >>= 8n;
  }
  return out;
}

export function encodeInstructionForOnchainSignature(
  instruction: RebalanceInstruction,
): Uint8Array {
  const out = new Uint8Array(32);
  out.set(encodeU64LE(instruction.scallopBps), 0);
  out.set(encodeU64LE(instruction.aftermathBps), 8);
  out.set(encodeU64LE(instruction.deepbookBps), 16);
  out.set(encodeU64LE(instruction.nonce), 24);
  return out;
}

function base64ToBytes(base64: string): Uint8Array {
  const withPad = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = withPad.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof atob === "function") {
    const bin = atob(normalized);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  }
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(normalized, "base64"));
  }
  throw new Error("base64 decode unavailable in this runtime");
}

async function importEd25519Spki(spkiBase64: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "spki",
    base64ToBytes(spkiBase64),
    { name: "Ed25519" },
    false,
    ["verify"],
  );
}

export function signatureBytesFromDecision(decision: NautilusSignedDecision): number[] {
  return Array.from(base64ToBytes(decision.signatureBase64));
}

export async function verifyNautilusDecision(
  decision: NautilusSignedDecision,
  spkiPublicKeyBase64: string,
  options: VerifyNautilusDecisionOptions = {},
): Promise<void> {
  const maxClockSkewMs = options.maxClockSkewMs ?? 60_000;
  const now = options.nowMs ?? Date.now();
  if (decision.algorithm !== "Ed25519") {
    throw new Error(`Unsupported Nautilus algorithm: ${decision.algorithm}`);
  }
  if (options.expectedKeyId && decision.keyId !== options.expectedKeyId) {
    throw new Error(
      `Nautilus key mismatch. expected=${options.expectedKeyId} got=${decision.keyId}`,
    );
  }
  if (decision.payload.expiresAtMs <= decision.payload.issuedAtMs) {
    throw new Error("Nautilus decision validity window is invalid.");
  }
  if (decision.payload.issuedAtMs - maxClockSkewMs > now) {
    throw new Error("Nautilus decision issued in the future.");
  }
  if (decision.payload.expiresAtMs + maxClockSkewMs < now) {
    throw new Error("Nautilus decision expired.");
  }
  const key = await importEd25519Spki(spkiPublicKeyBase64);
  const message = encodeInstructionForOnchainSignature(decision.payload.instruction);
  const signature = base64ToBytes(decision.signatureBase64);
  const ok = await crypto.subtle.verify({ name: "Ed25519" }, key, signature, message);
  if (!ok) throw new Error("Nautilus signature verification failed.");
}

export async function checkNautilusEndpointReachable(cfg: HttpNautilusClientConfig): Promise<{
  ok: boolean;
  status: number;
  details?: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs ?? 6_000);
  try {
    const headers: Record<string, string> = {};
    if (cfg.bearerToken) headers.authorization = `Bearer ${cfg.bearerToken}`;
    const res = await fetch(cfg.endpoint, { method: "HEAD", headers, signal: controller.signal });
    if (res.ok || res.status === 401 || res.status === 403 || res.status === 405) {
      return { ok: true, status: res.status, details: "reachable" };
    }
    return { ok: false, status: res.status, details: res.statusText };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      details: error instanceof Error ? error.message : "unknown_error",
    };
  } finally {
    clearTimeout(timer);
  }
}

function assertDecisionShape(value: unknown): asserts value is NautilusSignedDecision {
  if (!value || typeof value !== "object") {
    throw new Error("Nautilus response is not an object.");
  }
  const candidate = value as Partial<NautilusSignedDecision>;
  if (!candidate.payload || typeof candidate.payload !== "object") {
    throw new Error("Nautilus response missing payload.");
  }
  const payload = candidate.payload as Partial<NautilusDecisionPayload>;
  if (
    !payload.instruction ||
    typeof payload.issuedAtMs !== "number" ||
    typeof payload.expiresAtMs !== "number" ||
    typeof payload.rationale !== "string"
  ) {
    throw new Error("Nautilus payload is malformed.");
  }
  if (typeof candidate.signatureBase64 !== "string" || candidate.signatureBase64.length < 16) {
    throw new Error("Nautilus signature is missing.");
  }
  if (typeof candidate.keyId !== "string" || candidate.keyId.length < 2) {
    throw new Error("Nautilus keyId is missing.");
  }
  if (candidate.algorithm !== "Ed25519") {
    throw new Error(`Nautilus algorithm not supported: ${String(candidate.algorithm)}`);
  }
}

export class HttpNautilusClient implements NautilusClient {
  constructor(private readonly cfg: HttpNautilusClientConfig) {}

  async requestDecision(report: CollectedYieldReport): Promise<NautilusSignedDecision> {
    return await withExponentialBackoff(async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.cfg.timeoutMs ?? 12_000);
      const headers: Record<string, string> = { "content-type": "application/json" };
      if (this.cfg.bearerToken) headers.authorization = `Bearer ${this.cfg.bearerToken}`;
      try {
        const res = await fetch(this.cfg.endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({ report }),
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Nautilus HTTP ${res.status} ${res.statusText}`);
        }
        const parsed = (await res.json()) as unknown;
        assertDecisionShape(parsed);
        return parsed;
      } finally {
        clearTimeout(timer);
      }
    });
  }
}
