/**
 * @midnight-vitals/core — headless diagnostics for the Midnight ecosystem.
 *
 * THE BIG PICTURE (why this package is shaped this way):
 * Vitals is an ecosystem organ, not an app feature. Every consumer speaks
 * the same two nouns:
 *   - VitalsTarget  — WHERE to look (a network's endpoints), and
 *   - VitalReading  — WHAT was found (one uniform result shape).
 * Probes are standalone functions: import one, some, or run the whole
 * panel via checkVitals(). Renderers are someone else's job — the CLI
 * prints tables, the (planned) React panel draws cards, an MCP server
 * returns JSON — all over this identical core. Modular by construction:
 * a new probe is one file returning a VitalReading; nothing else changes.
 */

import type { VitalReading, VitalsTarget } from './types.js';
import { probeNode } from './probes/node.js';
import { probeIndexer } from './probes/indexer.js';
import { probeProofServer } from './probes/proof-server.js';
import { probeToolchain } from './probes/toolchain.js';
import { probeDockerStack } from './probes/docker-stack.js';
import { probeAddress } from './probes/address.js';

export * from './types.js';
export { probeNode, probeIndexer, probeProofServer, probeToolchain, probeDockerStack, probeAddress };

export interface CheckVitalsOptions {
  /** Also check this address's on-chain activity/balance. */
  readonly address?: string;
  /** Skip local-machine probes (toolchain, docker) — e.g. when run in CI. */
  readonly networkOnly?: boolean;
}

/** Run the standard panel of probes against one target, in parallel. */
export async function checkVitals(target: VitalsTarget, options: CheckVitalsOptions = {}): Promise<VitalReading[]> {
  const probes: Promise<VitalReading>[] = [
    probeNode(target),
    probeIndexer(target),
    probeProofServer(target),
  ];
  if (!options.networkOnly) {
    probes.push(probeToolchain(), probeDockerStack());
  }
  if (options.address) {
    probes.push(probeAddress(target, options.address));
  }
  return Promise.all(probes);
}
