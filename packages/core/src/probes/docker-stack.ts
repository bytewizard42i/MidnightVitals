/**
 * probes/docker-stack.ts — Which Midnight containers are running locally?
 *
 * Looks for the standalone-network trio (node / indexer / proof server) by
 * image name, so it works regardless of what a given project named its
 * containers. Reports each container's status string verbatim.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { type VitalReading, reading } from '../types.js';

const run = promisify(execFile);

export async function probeDockerStack(): Promise<VitalReading> {
  return reading('docker-stack', 'Local Docker Stack', async () => {
    const { stdout } = await run(
      'docker',
      ['ps', '--format', '{{.Image}}|{{.Names}}|{{.Status}}'],
      { timeout: 15_000 },
    );
    const midnight = stdout
      .trim()
      .split('\n')
      .filter((line) => /midnight/i.test(line))
      .map((line) => {
        const [image, name, status] = line.split('|');
        return { image, name, status };
      });
    const unhealthy = midnight.filter((c) => /unhealthy|restarting|exited/i.test(c.status ?? ''));
    return {
      status: midnight.length === 0 ? 'down' : unhealthy.length > 0 ? 'degraded' : 'healthy',
      summary:
        midnight.length === 0
          ? 'no Midnight containers running'
          : `${midnight.length} Midnight container(s) up${unhealthy.length ? `, ${unhealthy.length} unhealthy` : ''}`,
      details: { containers: midnight },
    };
  });
}
