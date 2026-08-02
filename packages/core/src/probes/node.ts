/**
 * probes/node.ts — Is the Midnight node alive, synced, and peered?
 *
 * Talks plain JSON-RPC over HTTP (system_health + system_syncState) — the
 * same calls the old check-preprod.sh script curled, now returning the
 * universal VitalReading shape.
 */

import { type VitalReading, type VitalsTarget, reading } from '../types.js';

async function rpc(url: string, method: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params: [] }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`node RPC ${method}: HTTP ${res.status}`);
  const json = (await res.json()) as { result?: Record<string, unknown>; error?: { message: string } };
  if (json.error) throw new Error(`node RPC ${method}: ${json.error.message}`);
  return json.result ?? {};
}

export async function probeNode(target: VitalsTarget): Promise<VitalReading> {
  return reading('node', `Midnight Node (${target.name})`, async () => {
    const health = await rpc(target.nodeUrl, 'system_health');
    const version = await rpc(target.nodeUrl, 'system_version').catch(() => ({}));
    const syncing = health['isSyncing'] === true;
    const peers = Number(health['peers'] ?? 0);
    // A dev node legitimately has 0 peers; a public node without peers is sick.
    const isolated = peers === 0 && health['shouldHavePeers'] === true;
    return {
      status: isolated ? 'degraded' : syncing ? 'degraded' : 'healthy',
      summary: syncing
        ? 'node is still syncing'
        : isolated
          ? 'node reachable but has no peers'
          : `node healthy (${peers} peers)`,
      details: { ...health, version: (version as { toString?: unknown }) ?? undefined },
    };
  });
}
