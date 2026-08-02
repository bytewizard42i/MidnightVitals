#!/usr/bin/env node
/**
 * vitals — the MidnightVitals CLI.
 *
 * A deliberately THIN renderer over @midnight-vitals/core: parse args,
 * run probes, print a table (or JSON with --json for scripts/CI).
 * All intelligence lives in core so every other surface (React panel,
 * MCP server) behaves identically.
 *
 * Usage:
 *   vitals check                          # localnet, full panel
 *   vitals check --target preprod        # remote network
 *   vitals check --address mn_addr_...   # + on-chain address activity
 *   vitals check --network-only --json   # CI-friendly
 */

import { TARGETS, type VitalReading, checkVitals } from '@midnight-vitals/core';

const ICON: Record<VitalReading['status'], string> = {
  healthy: '\u001b[32m●\u001b[0m', // green
  degraded: '\u001b[33m●\u001b[0m', // yellow
  down: '\u001b[31m●\u001b[0m', // red
  unknown: '\u001b[90m○\u001b[0m', // grey
};

function usage(): never {
  console.log('usage: vitals check [--target localnet|preprod|preview] [--address mn_addr_...] [--network-only] [--json]');
  process.exit(2);
}

const args = process.argv.slice(2);
if (args[0] !== 'check') usage();

const flag = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const has = (name: string): boolean => args.includes(`--${name}`);

const targetName = flag('target') ?? 'localnet';
const target = TARGETS[targetName];
if (!target) {
  console.error(`unknown target '${targetName}' (have: ${Object.keys(TARGETS).join(', ')})`);
  process.exit(2);
}

const address = flag('address');
const readings = await checkVitals(target, {
  networkOnly: has('network-only'),
  ...(address !== undefined && { address }),
});

if (has('json')) {
  console.log(JSON.stringify(readings, null, 2));
} else {
  console.log(`\nMidnightVitals — target: ${target.name}\n`);
  for (const r of readings) {
    console.log(`  ${ICON[r.status]} ${r.label.padEnd(34)} ${r.summary}  \u001b[90m(${r.elapsedMs}ms)\u001b[0m`);
  }
  console.log();
}

// Exit code mirrors overall health so CI can gate on it:
// 0 = all healthy, 1 = something down/unknown, 0 with warning text on degraded.
const worst = readings.some((r) => r.status === 'down' || r.status === 'unknown');
process.exit(worst ? 1 : 0);
