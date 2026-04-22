# Blockfrost Midnight Indexer — MidnightVitals Integration Guide

**Source**: https://docs.blockfrost.io/midnight/
**Date**: April 21, 2026
**Impact**: Blockfrost is the production-ready data layer MidnightVitals needs. It replaces the need for a self-hosted Midnight indexer node and provides all the queries and subscriptions for our monitoring dashboard.

---

## 1. Why Blockfrost for MidnightVitals

MidnightVitals monitors Midnight network health. Blockfrost provides **every data point we need**:

| MidnightVitals Feature | Blockfrost Query/Subscription |
|------------------------|------------------------------|
| Block explorer | `block(offset?)` — by hash or height |
| Real-time block feed | `subscription { blocks { ... } }` |
| Transaction details | `transactions(offset!)` — by hash |
| Contract state viewer | `contractAction(address!)` — state + balances |
| Contract activity feed | `subscription { contractActions(address!) { ... } }` |
| Epoch dashboard | `currentEpochInfo` — epoch number, duration, elapsed |
| Epoch performance | `epochPerformance` / `epochUtilization` |
| SPO tracker | `spoList`, `spoByPoolId`, `spoPerformanceLatest` |
| Committee viewer | `committee(epoch!)` |
| DUST generation status | `dustGenerationStatus(cardanoRewardAddresses!)` |
| DUST events | `subscription { dustLedgerEvents { ... } }` |
| D-parameter history | `dParameterHistory` — governance audit trail |
| Stake distribution | `stakeDistribution` |
| Shielded tx monitor | `connect(viewingKey)` → `shieldedTransactions(sessionId)` |
| Unshielded tx monitor | `subscription { unshieldedTransactions(address!) { ... } }` |
| Zswap events | `subscription { zswapLedgerEvents { ... } }` |

---

## 2. Endpoint Configuration

```typescript
// MidnightVitals provider config
const BLOCKFROST_PROJECT_ID = process.env.BLOCKFROST_MIDNIGHT_PROJECT_ID;

const config = {
  // GraphQL query endpoint
  indexerUrl: `https://midnight-${network}.blockfrost.io/api/v0`,

  // WebSocket subscription endpoint
  indexerWsUrl: `wss://midnight-${network}.blockfrost.io/api/v0/ws`,

  // Node RPC (for midnight.js SDK integration)
  nodeRpcUrl: `https://rpc.midnight-${network}.blockfrost.io`,

  // Auth — passed as query param (midnight.js compatible)
  authParam: `?project_id=${BLOCKFROST_PROJECT_ID}`,
};
```

---

## 3. Core GraphQL Queries for Dashboard

### Latest Block
```graphql
query {
  block {
    hash height timestamp author protocolVersion
    transactions { hash }
    systemParameters {
      dParameter { numPermissionedCandidates numRegisteredCandidates }
    }
  }
}
```

### Epoch Overview
```graphql
query {
  currentEpochInfo { epochNo durationSeconds elapsedSeconds }
}
```

### DUST Generation for User
```graphql
query DustStatus($addrs: [CardanoRewardAddress!]!) {
  dustGenerationStatus(cardanoRewardAddresses: $addrs) {
    cardanoRewardAddress dustAddress registered
    nightBalance generationRate maxCapacity currentCapacity
  }
}
```

### Contract State
```graphql
query ContractState($addr: HexEncoded!) {
  contractAction(address: $addr) {
    address state zswapState
    transaction { hash block { height timestamp } }
    unshieldedBalances { tokenType amount }
  }
}
```

### SPO Performance
```graphql
query {
  spoPerformanceLatest {
    spoSk performance epoch
  }
}
```

### Governance Audit Trail
```graphql
query {
  dParameterHistory {
    blockHeight timestamp numPermissionedCandidates numRegisteredCandidates
  }
  termsAndConditionsHistory {
    blockHeight timestamp hash url
  }
}
```

---

## 4. Real-Time WebSocket Subscriptions

### Block Streaming (for live dashboard)

```typescript
const url = `wss://midnight-preprod.blockfrost.io/api/v0/ws?project_id=${PROJECT_ID}`;
const ws = new WebSocket(url, "graphql-transport-ws");

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "connection_init" }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "connection_ack") {
    ws.send(JSON.stringify({
      id: "blocks",
      type: "subscribe",
      payload: {
        query: `subscription {
          blocks {
            hash height timestamp author
            transactions { hash contractActions { address } }
          }
        }`
      }
    }));
  }
  if (msg.type === "next") {
    updateDashboard(msg.payload.data.blocks);
  }
};
```

### Contract Action Monitoring

```typescript
// Watch a specific deployed contract
ws.send(JSON.stringify({
  id: "contract-watch",
  type: "subscribe",
  payload: {
    query: `subscription($addr: HexEncoded!) {
      contractActions(address: $addr) {
        address state
        transaction { hash }
        unshieldedBalances { tokenType amount }
      }
    }`,
    variables: { addr: CONTRACT_ADDRESS }
  }
}));
```

### DUST Ledger Events

```typescript
ws.send(JSON.stringify({
  id: "dust-events",
  type: "subscribe",
  payload: {
    query: `subscription { dustLedgerEvents { id raw maxId protocolVersion } }`
  }
}));
```

---

## 5. Architecture Recommendation

```
┌──────────────────────────────────────────────┐
│ MidnightVitals Dashboard (React)             │
│  ├─ Block Explorer panel                     │
│  ├─ Epoch/SPO panel                          │
│  ├─ Contract State panel                     │
│  ├─ DUST Generation panel                    │
│  └─ Governance Audit panel                   │
└───────┬──────────────────────┬───────────────┘
        │ HTTP POST (GraphQL)  │ WSS (subscriptions)
        ▼                      ▼
┌──────────────────────────────────────────────┐
│ Blockfrost Midnight Indexer                   │
│  https://midnight-{network}.blockfrost.io     │
│  Auth: project_id header or query param       │
└──────────────────────────────────────────────┘
```

No self-hosted infrastructure needed. Blockfrost handles indexing, caching, and WebSocket management.

---

## 6. Action Items

- [ ] Create Blockfrost Midnight project at blockfrost.io
- [ ] Add `BLOCKFROST_MIDNIGHT_PROJECT_ID` to env config
- [ ] Build GraphQL client layer (Apollo Client or lightweight fetch wrapper)
- [ ] Implement WebSocket subscription manager with auto-reconnect
- [ ] Wire dashboard panels to Blockfrost queries
- [ ] Add DUST generation status panel
- [ ] Add governance audit trail panel (D-parameter + T&C history)
- [ ] Implement resumable subscriptions (pass offset on reconnect)

---

*Prepared by Cassie for MidnightVitals, April 21, 2026*
