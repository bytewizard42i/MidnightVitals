/**
 * probes/indexer.ts — Is the indexer serving fresh chain data?
 *
 * One GraphQL query for the latest block; freshness = how old that block's
 * timestamp is. An indexer that answers but serves stale blocks is
 * 'degraded' — reachable is not the same as useful.
 */

import { type VitalReading, type VitalsTarget, reading } from '../types.js';

export async function probeIndexer(target: VitalsTarget): Promise<VitalReading> {
  return reading('indexer', `Indexer (${target.name})`, async () => {
    const res = await fetch(target.indexerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ block { height hash timestamp } }' }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`indexer HTTP ${res.status}`);
    const json = (await res.json()) as {
      data?: { block?: { height: number; hash: string; timestamp: string | number } };
      errors?: { message: string }[];
    };
    if (json.errors?.length) throw new Error(`indexer GraphQL: ${json.errors[0]?.message}`);
    const block = json.data?.block;
    if (!block) throw new Error('indexer returned no latest block');

    const blockTime = new Date(block.timestamp).getTime();
    const ageSeconds = Number.isFinite(blockTime) ? Math.round((Date.now() - blockTime) / 1000) : undefined;
    // Midnight blocks land every ~6s; a minute of silence means lag somewhere.
    const stale = ageSeconds !== undefined && ageSeconds > 60;
    return {
      status: stale ? 'degraded' : 'healthy',
      summary: stale
        ? `latest block is ${ageSeconds}s old (stale)`
        : `serving block ${block.height}${ageSeconds !== undefined ? ` (${ageSeconds}s old)` : ''}`,
      details: { height: block.height, hash: block.hash, ageSeconds },
    };
  });
}
