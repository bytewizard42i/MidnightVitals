/**
 * probes/toolchain.ts — Are the local dev tools present and current-ish?
 *
 * Reports Node.js, the compact devtool + active compiler toolchain, and
 * Docker. Deliberately does NOT pin "correct" versions — per house rules
 * version truth lives in the support matrix, which moves; this probe
 * reports WHAT IS so the caller (or the human) can compare.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { type VitalReading, reading } from '../types.js';

const run = promisify(execFile);

async function versionOf(cmd: string, args: string[]): Promise<string | undefined> {
  try {
    const { stdout } = await run(cmd, args, { timeout: 15_000 });
    return stdout.trim().split('\n')[0];
  } catch {
    return undefined;
  }
}

export async function probeToolchain(): Promise<VitalReading> {
  return reading('toolchain', 'Local Toolchain', async () => {
    const [node, compact, compactc, docker] = await Promise.all([
      versionOf('node', ['--version']),
      versionOf('compact', ['--version']),
      versionOf('compact', ['compile', '--version']),
      versionOf('docker', ['--version']),
    ]);
    const missing = [
      !node && 'node',
      !compact && 'compact devtool',
      !docker && 'docker',
    ].filter(Boolean);
    return {
      status: missing.length === 0 ? 'healthy' : 'degraded',
      summary:
        missing.length === 0
          ? `toolchain present (compactc: ${compactc ?? 'unknown'})`
          : `missing: ${missing.join(', ')}`,
      details: { node, compactDevtool: compact, compactCompiler: compactc, docker },
    };
  });
}
