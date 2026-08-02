/**
 * probes/address.ts — Does an address have on-chain activity, and how much
 * unshielded value does it hold?
 *
 * Subscribes to the indexer's unshieldedTransactions stream (graphql-ws),
 * replays the address's history, and folds created/spent UTXOs into a
 * balance. This is the "instant on-chain truth" trick from the didz-kernel
 * deployment night — no wallet build, no chain-history sync, seconds not
 * minutes. Works for ANY address on ANY network the indexer serves.
 */

import WebSocket from 'ws';
import { type VitalReading, type VitalsTarget, reading } from '../types.js';

interface Utxo {
  readonly value: string;
  readonly owner: string;
  readonly tokenType: string;
}

export async function probeAddress(
  target: VitalsTarget,
  address: string,
  waitMs = 12_000,
): Promise<VitalReading> {
  return reading('address', `Address activity (${address.slice(0, 24)}…)`, async () => {
    const events = await collectAddressEvents(target.indexerWsUrl, address, waitMs);
    let txCount = 0;
    let balance = 0n;
    for (const ev of events) {
      txCount++;
      for (const u of ev.created) if (u.owner === address) balance += BigInt(u.value);
      for (const u of ev.spent) balance -= BigInt(u.value);
    }
    return {
      status: 'healthy' as const, // the PROBE succeeded; activity level is data, not health
      summary:
        txCount === 0
          ? 'no on-chain activity for this address'
          : `${txCount} transaction(s); unshielded balance ${balance}`,
      details: { txCount, unshieldedBalance: balance.toString() },
    };
  });
}

function collectAddressEvents(
  wsUrl: string,
  address: string,
  waitMs: number,
): Promise<{ created: Utxo[]; spent: Utxo[] }[]> {
  return new Promise((resolve, rejectPromise) => {
    const ws = new WebSocket(wsUrl, 'graphql-transport-ws');
    const events: { created: Utxo[]; spent: Utxo[] }[] = [];
    let idleTimer: NodeJS.Timeout;
    const finish = () => {
      clearTimeout(hardCap);
      clearTimeout(idleTimer);
      ws.close();
      resolve(events);
    };
    // STREAM SEMANTICS (learned the hard way): the progress marker announces
    // the replay TARGET — history events can still arrive after it. So we
    // close on QUIET (no messages for 3s), with waitMs as the hard cap.
    const idle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(finish, 3_000);
    };
    const hardCap = setTimeout(finish, waitMs);
    idle();
    ws.on('error', (e) => {
      clearTimeout(hardCap);
      clearTimeout(idleTimer);
      rejectPromise(e);
    });
    ws.on('open', () => ws.send(JSON.stringify({ type: 'connection_init' })));
    ws.on('message', (raw) => {
      idle(); // any traffic restarts the quiet-window clock
      const msg = JSON.parse(raw.toString()) as {
        type: string;
        payload?: { data?: { unshieldedTransactions?: Record<string, unknown> }; errors?: unknown };
      };
      if (msg.type === 'connection_ack') {
        ws.send(
          JSON.stringify({
            id: '1',
            type: 'subscribe',
            payload: {
              query: `subscription($a: UnshieldedAddress!) {
                unshieldedTransactions(address: $a) {
                  ... on UnshieldedTransaction {
                    transaction { hash }
                    createdUtxos { value owner tokenType }
                    spentUtxos { value owner tokenType }
                  }
                  ... on UnshieldedTransactionsProgress { highestTransactionId }
                }
              }`,
              variables: { a: address },
            },
          }),
        );
      } else if (msg.type === 'next') {
        const ev = msg.payload?.data?.unshieldedTransactions;
        if (!ev) return;
        if ('highestTransactionId' in ev) return; // target marker, not "done"
        events.push({
          created: (ev['createdUtxos'] as Utxo[] | undefined) ?? [],
          spent: (ev['spentUtxos'] as Utxo[] | undefined) ?? [],
        });
      } else if (msg.type === 'error') {
        clearTimeout(hardCap);
        clearTimeout(idleTimer);
        ws.close();
        rejectPromise(new Error(JSON.stringify(msg.payload)));
      }
    });
  });
}
