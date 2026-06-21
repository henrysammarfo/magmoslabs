import { fetchBlendedYieldSnapshot, type YieldIntegrationConfig } from "@/protocols/index";
import type { AllocationBps } from "@/protocols/types";
import { checkWalrusApiReachable, type WalrusConfig } from "@/walrus/reserves";
import { checkNautilusEndpointReachable } from "./nautilus";

export interface ExternalHealthReport {
  ok: boolean;
  atMs: number;
  blendedYieldBps?: number;
  sourceStatuses: Array<{ source: string; confidence: number; aprBps: number; details?: string }>;
  walrusApiReachable: boolean;
  nautilusReachable: boolean;
  errors: string[];
}

export async function runExternalHealthCheck(args: {
  allocation: AllocationBps;
  integrations?: YieldIntegrationConfig;
  walrus?: WalrusConfig;
  nautilus?: { endpoint: string; bearerToken?: string };
}): Promise<ExternalHealthReport> {
  const errors: string[] = [];
  let blendedYieldBps: number | undefined;
  let sourceStatuses: ExternalHealthReport["sourceStatuses"] = [];
  let walrusApiReachable = false;
  let nautilusReachable = false;

  try {
    const blended = await fetchBlendedYieldSnapshot(args.allocation, args.integrations);
    blendedYieldBps = blended.blendedAprBps;
    sourceStatuses = blended.quotes.map((q) => ({
      source: q.source,
      confidence: q.confidence,
      aprBps: q.aprBps,
      details: q.details,
    }));
  } catch (error) {
    errors.push(`yield:${error instanceof Error ? error.message : "unknown_error"}`);
  }

  try {
    walrusApiReachable = await checkWalrusApiReachable(args.walrus);
    if (!walrusApiReachable) {
      errors.push("walrus:api_unreachable");
    }
  } catch (error) {
    errors.push(`walrus:${error instanceof Error ? error.message : "unknown_error"}`);
  }

  if (args.nautilus?.endpoint) {
    try {
      const probe = await checkNautilusEndpointReachable({
        endpoint: args.nautilus.endpoint,
        bearerToken: args.nautilus.bearerToken,
      });
      nautilusReachable = probe.ok;
      if (!probe.ok) {
        errors.push(`nautilus:http_${probe.status}${probe.details ? `:${probe.details}` : ""}`);
      }
    } catch (error) {
      errors.push(`nautilus:${error instanceof Error ? error.message : "unknown_error"}`);
    }
  }

  return {
    ok: errors.length === 0,
    atMs: Date.now(),
    blendedYieldBps,
    sourceStatuses,
    walrusApiReachable,
    nautilusReachable,
    errors,
  };
}
