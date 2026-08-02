/**
 * types.ts — The MidnightVitals vocabulary.
 *
 * ONE SHAPE FOR EVERY PROBE (teaching note):
 * Every diagnostic — whether it pinged a node, read a GraphQL endpoint, or
 * shelled out to `docker ps` — answers in the same shape: a VitalReading.
 * That is what makes Vitals composable: a CLI renders readings as a table,
 * a React panel renders them as cards, an MCP server returns them as JSON,
 * and none of them care which probe produced what.
 */

/** Traffic-light status. 'unknown' = the probe itself could not run. */
export type VitalStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

/** One diagnostic result. */
export interface VitalReading {
  /** Stable machine id, e.g. 'node', 'indexer', 'proof-server'. */
  readonly id: string;
  /** Human label, e.g. 'Midnight Node (preprod)'. */
  readonly label: string;
  readonly status: VitalStatus;
  /** One-line human summary of what was found. */
  readonly summary: string;
  /** Probe-specific details (versions, block heights, balances...). */
  readonly details: Readonly<Record<string, unknown>>;
  /** How long the probe took, in ms. */
  readonly elapsedMs: number;
  /** Unix ms when the reading was taken. */
  readonly at: number;
}

/** Endpoints of the network being examined. */
export interface VitalsTarget {
  readonly name: string; // 'localnet' | 'preprod' | 'preview' | custom
  readonly nodeUrl: string;
  readonly indexerUrl: string;
  readonly indexerWsUrl: string;
  readonly proofServerUrl: string;
}

/** Built-in targets (mirror the didz-kernel adapter configs). */
export const TARGETS: Readonly<Record<string, VitalsTarget>> = {
  localnet: {
    name: 'localnet',
    nodeUrl: 'http://127.0.0.1:9944',
    indexerUrl: 'http://127.0.0.1:8088/api/v4/graphql',
    indexerWsUrl: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
    proofServerUrl: 'http://127.0.0.1:6300',
  },
  preprod: {
    name: 'preprod',
    nodeUrl: 'https://rpc.preprod.midnight.network',
    indexerUrl: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWsUrl: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    proofServerUrl: 'http://127.0.0.1:6300', // proof server is ALWAYS local
  },
  preview: {
    name: 'preview',
    nodeUrl: 'https://rpc.preview.midnight.network',
    indexerUrl: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWsUrl: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    proofServerUrl: 'http://127.0.0.1:6300',
  },
};

/** Helper for probes: time an async body and wrap it as a VitalReading. */
export async function reading(
  id: string,
  label: string,
  body: () => Promise<Pick<VitalReading, 'status' | 'summary' | 'details'>>,
): Promise<VitalReading> {
  const started = Date.now();
  try {
    const result = await body();
    return { id, label, ...result, elapsedMs: Date.now() - started, at: started };
  } catch (error) {
    return {
      id,
      label,
      status: 'unknown',
      summary: `probe failed: ${error instanceof Error ? error.message : String(error)}`,
      details: {},
      elapsedMs: Date.now() - started,
      at: started,
    };
  }
}
