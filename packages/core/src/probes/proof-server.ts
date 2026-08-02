/**
 * probes/proof-server.ts — Is the LOCAL proof server up, and which version?
 *
 * The proof server always runs on the developer's machine (witnesses never
 * leave home). /health answers on newer images; older ones only have
 * /version — we try both, exactly like the ZKSplunk fork's live provider.
 */

import { type VitalReading, type VitalsTarget, reading } from '../types.js';

export async function probeProofServer(target: VitalsTarget): Promise<VitalReading> {
  return reading('proof-server', 'Proof Server (local)', async () => {
    for (const path of ['/health', '/version']) {
      const res = await fetch(`${target.proofServerUrl}${path}`, { signal: AbortSignal.timeout(5_000) }).catch(
        () => undefined,
      );
      if (res?.ok) {
        const body = (await res.text()).trim().slice(0, 200);
        return {
          status: 'healthy' as const,
          summary: `proof server answering on ${path}${body ? ` (${body})` : ''}`,
          details: { endpoint: `${target.proofServerUrl}${path}`, body },
        };
      }
    }
    return {
      status: 'down' as const,
      summary: `no proof server at ${target.proofServerUrl} — start one (docker: midnightntwrk/proof-server)`,
      details: { endpoint: target.proofServerUrl },
    };
  });
}
