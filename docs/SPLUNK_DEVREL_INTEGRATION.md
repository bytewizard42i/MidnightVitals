# MidnightVitals — Splunk DevRel Integration Design

**Status**: Design Specification  
**Last Updated**: Apr 21, 2026  
**Cross-reference**: `ZKSplunk_Splunking_w_Midnight/docs/DEVREL_SPLUNK_HEALTH_AND_ATTACK_DETECTION.md`

---

## Overview

MidnightVitals is the **data collection layer** for a planned DevRel observability tool built
on ZKSplunk. Any Midnight DApp that embeds the vitals module automatically becomes a sensor
node in a network-wide health monitoring mesh — with zero extra infrastructure required.

This document describes:
1. How MidnightVitals feeds the ZKSplunk DevRel health pulse.
2. What extension points are needed to support real-time attack signal detection.
3. New `VitalId` candidates that would improve attack signal fidelity.

---

## Role of MidnightVitals in the DevRel Tool

```
MidnightVitals (embedded in DApp)
        │
        │  onVitalCheck(vitalId, result)   ← callback from VitalsProvider
        │  onLogEntry(entry)               ← callback for console log events
        ▼
ZKSplunk Connector (SplunkForwarder)
        │
        │  HTTP POST (batch HEC events)
        ▼
Splunk Cloud  →  DevRel Health Dashboard
              →  Attack Detection AI Agent
```

### What Already Works

- `VitalsProvider` exposes `onVitalCheck` and `onLogEntry` callback props.
- Four built-in vitals: `proof-server`, `network`, `wallet`, `contracts`.
- `DiagnosticReport` type aggregates all vitals + dependencies into a single snapshot.
- `VitalsLogEntry` captures plain-English console messages with severity levels.
- All of this maps 1:1 to the `vitals-adapter.ts` transformers in the ZKSplunk connector.

### What Needs to Be Extended

The current four vitals are sufficient for a basic health pulse but are too coarse
for nuanced attack detection. The sections below propose targeted extensions.

---

## Proposed New VitalIds for Attack Detection

The following new vital monitors would dramatically improve attack signal fidelity.
Each requires a corresponding `checkXxx()` method on `VitalsProviderInterface`.

### `VitalId: 'proof-rejection-rate'`

**What it measures**: The ratio of rejected ZK proof submissions to total submissions
over a rolling 5-minute window.

**Source**: Blockfrost `contractActions` subscription — look for `REJECTED` action types.

**Attack signal it enables**: Signal 2 (Invalid Proof Flooding) — a sudden spike in
rejection rate indicates someone is flooding the proof server with malformed proofs.

**Threshold heuristics**:
- healthy: < 5% rejection rate
- warning: 5–20%
- critical: > 20%

---

### `VitalId: 'block-production-rate'`

**What it measures**: Time between successive blocks on the Midnight chain.
Normal: ~5–10 seconds per block.

**Source**: Blockfrost `blocks` subscription — compute Δt between consecutive block timestamps.

**Attack signal it enables**: Signal 3 (Network Partition) — if block production stalls
(no new block for 60+ seconds), the network may be partitioned or under attack.

**Threshold heuristics**:
- healthy: < 30s since last block
- warning: 30–90s
- critical: > 90s

---

### `VitalId: 'dust-supply-health'`

**What it measures**: Whether the ecosystem DUST supply is within normal bounds —
specifically, whether the DUST faucet or shielding pool appears to be draining.

**Source**: Blockfrost `dustLedgerEvents` subscription.

**Attack signal it enables**: Signal 4 (DUST Drain Attack) — an adversary draining
DUST from developer wallets to block transaction submission.

**Threshold heuristics**: Compare current DUST distribution to a baseline snapshot.
Flag if mean balance drops > 50% in a 10-minute window.

---

### `VitalId: 'contract-call-rate'`

**What it measures**: Rate of calls to monitored contract addresses per minute.

**Source**: Blockfrost `contractActions` subscription — count events per contract address.

**Attack signal it enables**: Signal 5 (Contract Griefing) — abnormally high call
frequency on a specific contract may indicate a griefing/spamming campaign.

**Threshold heuristics**:
- healthy: < 60 calls/min per contract (baseline)
- warning: 60–300 calls/min
- critical: > 300 calls/min

---

## Extension to `VitalsProviderInterface`

To add the four new vitals, extend the interface in `vitals/types.ts`:

```typescript
// Extended VitalId union
export type VitalId =
  | 'proof-server'
  | 'network'
  | 'wallet'
  | 'contracts'
  // Attack-signal vitals (DevRel / ZKSplunk extension)
  | 'proof-rejection-rate'
  | 'block-production-rate'
  | 'dust-supply-health'
  | 'contract-call-rate';

// Extended provider interface
export interface VitalsProviderInterface {
  checkProofServer(): Promise<VitalCheckResult>;
  checkNetwork(): Promise<VitalCheckResult>;
  checkWallet(): Promise<VitalCheckResult>;
  checkContracts(contracts: ContractInfo[]): Promise<VitalCheckResult>;
  checkDependencies(): Promise<DependencyCheckResult[]>;
  // Optional — only implemented by attack-signal-aware providers:
  checkProofRejectionRate?(): Promise<VitalCheckResult>;
  checkBlockProductionRate?(): Promise<VitalCheckResult>;
  checkDustSupplyHealth?(): Promise<VitalCheckResult>;
  checkContractCallRate?(contracts: ContractInfo[]): Promise<VitalCheckResult>;
}
```

Making the attack-signal methods **optional** (via `?`) preserves backward compatibility —
the mock provider and basic live providers don't need to implement them. The
`BlockfrostVitalsProvider` in ZKSplunk can implement all eight.

---

## `VitalsProvider` Callback Additions

To let the ZKSplunk connector receive attack-signal data as fast as possible, add an
optional callback specifically for anomaly events:

```typescript
// Proposed addition to VitalsProvider props:
interface VitalsProviderProps {
  // ... existing props ...
  onVitalCheck?: (vitalId: VitalId, result: VitalCheckResult) => void;
  onLogEntry?: (entry: VitalsLogEntry) => void;
  onAttackSignal?: (signal: {
    vitalId: VitalId;
    result: VitalCheckResult;
    signalType: string;         // e.g. "proof_flood"
    confidence: 'low' | 'medium' | 'high';
    affectedDApps?: string[];   // if cross-DApp correlation is available
  }) => void;
}
```

The `onAttackSignal` callback fires *in addition to* `onVitalCheck` when the local
rolling-window analysis crosses a threshold, giving the connector a pre-correlated
warm signal before Splunk does its own statistical analysis.

---

## DevRel Mode Flag

The `VitalsProvider` should support a `devrelMode` prop that:

1. Reduces check intervals for all vitals (tighter pulse).
2. Tags every HEC event with `audience: "devrel"` — enabling the public dashboard
   to be filtered separately from internal developer telemetry.
3. Enables a "last known good" snapshot that the DevRel dashboard can display even
   during a brief outage (prevents the dashboard from going blank during incidents).

```typescript
// Proposed prop:
<VitalsProvider
  mode="live"
  devrelMode={true}
  onVitalCheck={forwarder.handleVitalCheck}
  onAttackSignal={forwarder.handleAttackSignal}
>
```

---

## Implementation Priority

| Task | Priority | Owner |
|------|----------|-------|
| Add 4 new `VitalId` values to `types.ts` | Medium | MidnightVitals |
| Extend `VitalsProviderInterface` (optional methods) | Medium | MidnightVitals |
| Add `onAttackSignal` callback prop to `VitalsProvider` | Medium | MidnightVitals |
| Add `devrelMode` prop | Low | MidnightVitals |
| Implement new vitals in `BlockfrostVitalsProvider` | High | ZKSplunk |
| Wire `onAttackSignal` into `SplunkForwarder` | High | ZKSplunk |

The ZKSplunk team drives the implementation of the Blockfrost-backed provider.
The MidnightVitals team's contribution is the type-system and callback interface
changes that make the extension clean and backward-compatible.

---

## Related Files

| File | Location |
|------|----------|
| `vitals/types.ts` | `ZKSplunk_Splunking_w_Midnight/vitals/types.ts` |
| `vitals/mock-vitals-provider.ts` | `ZKSplunk_Splunking_w_Midnight/vitals/mock-vitals-provider.ts` |
| `blockfrost-provider/src/chain-vitals-provider.ts` | `ZKSplunk_Splunking_w_Midnight/blockfrost-provider/src/` |
| `connector/src/vitals-adapter.ts` | `ZKSplunk_Splunking_w_Midnight/connector/src/` |
| Full attack detection design | `ZKSplunk_Splunking_w_Midnight/docs/DEVREL_SPLUNK_HEALTH_AND_ATTACK_DETECTION.md` |
