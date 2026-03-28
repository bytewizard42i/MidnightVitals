# 🏗️ MidnightVitals — Architecture

**Version**: 0.4.0  
**Last Updated**: Feb 22, 2026  
**Status**: Active Development

---

## Table of Contents

- [Overview](#overview)
- [Design Philosophy](#design-philosophy)
- [System Architecture](#system-architecture)
- [Module Structure](#module-structure)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [Provider Architecture](#provider-architecture)
- [Component Hierarchy](#component-hierarchy)
- [Layout Engine](#layout-engine)
- [Persistence Layer](#persistence-layer)
- [Security Considerations](#security-considerations)
- [Performance Budget](#performance-budget)
- [Extension Points](#extension-points)

---

## Overview

MidnightVitals is a **pluggable, provider-agnostic diagnostic module** for Midnight blockchain DApps. It is designed as a self-contained React module that can be dropped into any React application with three lines of code:

```tsx
<VitalsProvider mode="mock">
  <VitalsToggleButton />
  <VitalsPanel />
</VitalsProvider>
```

The module has two responsibilities:

1. **Health Monitoring** — Continuously check the status of every component in the Midnight stack (proof server, network indexer, wallet, smart contracts)
2. **Activity Logging** — Record and explain every user action and blockchain interaction in natural language

---

## Design Philosophy

### 1. Provider-Agnostic
The UI layer never knows whether it's talking to mock data or real infrastructure. Both modes implement an identical `VitalsProviderInterface`. You can demo the full UI without any blockchain running.

### 2. Zero-Jargon Output
Every message shown to the user is written in plain English. Errors always include three parts:
- **What happened** — the primary message
- **What this means** — a human explanation of the technical failure
- **What to do** — a concrete action to resolve it

### 3. Non-Blocking
MidnightVitals never blocks the main application. Health checks run on timers. If the proof server is down, the app still works — the panel just shows a red indicator and explains the situation.

### 4. Minimal Footprint
The module is designed to have the smallest possible visual and performance impact. The panel can collapse to zero height. Time wheels use lightweight SVG. Log entries are capped at 500. No external dependencies beyond React and Lucide icons.

### 5. Composable
Every component is independently usable. You can use `VitalsTimeWheel` alone, or `VitalsConsole` alone, or the full `VitalsPanel`. The `useVitalsLogger()` hook works anywhere inside the provider boundary.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HOST APPLICATION                              │
│  (Any React app using Midnight — e.g., DiscoveryManagement)         │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                      VitalsProvider                            │  │
│  │                                                                │  │
│  │  ┌──────────────┐   ┌───────────────┐   ┌─────────────────┐  │  │
│  │  │  VitalsState  │   │ vitalsReducer │   │ VitalsProvider  │  │  │
│  │  │  (useReducer) │◄──│  (pure fn)    │   │  Interface      │  │  │
│  │  │               │   │               │   │  (Mock / Live)  │  │  │
│  │  │  - isOpen     │   │  TOGGLE_PANEL │   │                 │  │  │
│  │  │  - panelHeight│   │  ADD_LOG_ENTRY│   │  checkProof()   │  │  │
│  │  │  - cardPos    │   │  UPDATE_MON.. │   │  checkNetwork() │  │  │
│  │  │  - monitors[] │   │  SET_CARD_POS │   │  checkWallet()  │  │  │
│  │  │  - logEntries │   │  CLEAR_LOG    │   │  checkContracts│  │  │
│  │  │  - logFilter  │   │  SET_FILTER   │   │  checkDeps()    │  │  │
│  │  │  - isRunning  │   │  SET_HEIGHT   │   │                 │  │  │
│  │  └──────┬───────┘   └───────────────┘   └────────┬────────┘  │  │
│  │         │                                         │           │  │
│  │         │  React Context                          │ async     │  │
│  │         ▼                                         ▼           │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │                    UI Components                          │ │  │
│  │  │                                                           │ │  │
│  │  │  ┌──────────────────┐  ┌──────────────────────────────┐  │ │  │
│  │  │  │ VitalsToggleBtn  │  │ VitalsPanel                  │  │ │  │
│  │  │  │  🩺 + ⌄ dropdown │  │  ┌────────────────────────┐  │  │ │  │
│  │  │  │  (settings menu) │  │  │ VitalsMonitorBar       │  │  │ │  │
│  │  │  └──────────────────┘  │  │  [TimeWheel x4]        │  │  │ │  │
│  │  │                        │  ├────────────────────────┤  │  │ │  │
│  │  │  ┌──────────────────┐  │  │ VitalsConsole          │  │  │ │  │
│  │  │  │ VitalsNavLogger  │  │  │  [LogEntry x N]        │  │  │ │  │
│  │  │  │  (auto-logs      │  │  │  (newest on top)       │  │  │ │  │
│  │  │  │   route changes) │  │  └────────────────────────┘  │  │ │  │
│  │  │  └──────────────────┘  └──────────────────────────────┘  │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Host App Components (pages, forms, buttons, etc.)           │    │
│  │  Each can call useVitalsLogger() to push log entries         │    │
│  └──────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Module Structure

```
src/vitals/
│
├── index.ts                         # Barrel exports — single entry point
│
├── types.ts                         # All TypeScript interfaces and types
│   ├── VitalStatus                  #   'healthy' | 'warning' | 'critical' | 'unknown'
│   ├── VitalId                      #   'proof-server' | 'network' | 'wallet' | 'contracts'
│   ├── VitalMonitor                 #   Complete monitor state object
│   ├── VitalCheckResult             #   Return type from provider checks
│   ├── LogLevel                     #   'action' | 'info' | 'success' | 'warning' | 'error'
│   ├── VitalsLogEntry               #   Single console log entry
│   ├── ContractInfo                 #   Deployed contract descriptor
│   ├── DependencyCheckResult        #   System dependency check result
│   ├── DiagnosticReport             #   Full diagnostic report aggregate
│   ├── VitalsProviderInterface      #   Provider contract (mock/live)
│   ├── CardPosition                 #   'top' | 'left' | 'right'
│   ├── VitalsState                  #   Complete global state shape
│   └── VitalsAction                 #   Union of all reducer actions
│
├── context.tsx                      # React Context + Reducer + Provider wrapper
│   ├── DEFAULT_MONITORS             #   Initial monitor definitions
│   ├── INITIAL_STATE                #   Default state values
│   ├── vitalsReducer()              #   Pure state reducer function
│   ├── VitalsContext                 #   React.createContext
│   ├── VitalsProvider               #   <VitalsProvider> component
│   ├── useVitals()                  #   Hook: full state access
│   └── useVitalsLogger()            #   Hook: convenience logging
│
├── messages.ts                      # Natural-language message templates
│   ├── PROOF_SERVER_MESSAGES        #   Messages for proof server states
│   ├── NETWORK_MESSAGES             #   Messages for network states
│   ├── WALLET_MESSAGES              #   Messages for wallet states
│   ├── CONTRACT_MESSAGES            #   Messages for contract states
│   ├── DEPENDENCY_MESSAGES          #   Messages for dependency states
│   └── ACTIVITY_MESSAGES            #   Messages for user activity
│
├── mock-vitals-provider.ts          # Mock implementation of VitalsProviderInterface
│   └── MockVitalsProvider           #   Simulated health checks with realistic timings
│
└── components/
    ├── VitalsPanel.tsx              # Main panel container
    │   ├── Drag-to-resize handle    #   Mouse events for resizing
    │   ├── Header bar               #   Title, Run Diagnostics, Close
    │   └── Layout switcher          #   Top vs Left vs Right card position
    │
    ├── VitalsMonitorBar.tsx         # Strip of all 4 monitors
    │   └── Adapts horizontal/vertical based on cardPosition
    │
    ├── VitalsTimeWheel.tsx          # Individual countdown ring
    │   ├── SVG circular arc         #   Depletes over check interval
    │   ├── Seconds display          #   Center number
    │   ├── Status dot + label       #   Color-coded
    │   ├── Detail line              #   Latency, count, etc.
    │   ├── Refresh button           #   Manual re-check
    │   ├── Inline pill mode         #   For "top" card position
    │   └── Compact card mode        #   For "left"/"right" sidebar
    │
    ├── VitalsConsole.tsx            # Scrollable activity log
    │   ├── Filter toolbar           #   All / Action / Info / Success / Warning / Error
    │   ├── Copy + Clear buttons     #   Clipboard and reset
    │   ├── Reversed entry list      #   Newest on top
    │   ├── Auto-scroll to top       #   When new entries arrive
    │   ├── "Jump to latest" button  #   When user scrolls away
    │   └── LogEntry sub-component   #   Individual log row
    │
    ├── VitalsToggleButton.tsx       # 🩺 stethoscope + settings
    │   ├── Toggle click             #   Opens/closes panel
    │   ├── Critical badge           #   Red pulse when vital is critical
    │   ├── Settings chevron         #   Opens card layout dropdown
    │   └── Position picker menu     #   Top / Left / Right options
    │
    └── VitalsNavigationLogger.tsx   # Auto-logs route changes
        └── useLocation() listener   #   Fires on every navigation
```

---

## State Management

### Single Source of Truth

All vitals state lives in a single `VitalsState` object managed by React's `useReducer`:

```typescript
interface VitalsState {
  isOpen: boolean;                    // Panel visible?
  panelHeight: number;                // Panel height in px
  cardPosition: CardPosition;         // 'top' | 'left' | 'right'
  monitors: VitalMonitor[];           // 4 monitor objects
  logEntries: VitalsLogEntry[];       // Up to 500 log entries
  logFilter: LogLevel | 'all';        // Active filter
  isRunningDiagnostic: boolean;       // Full diagnostic in progress?
}
```

### Actions

```typescript
type VitalsAction =
  | { type: 'TOGGLE_PANEL' }
  | { type: 'SET_PANEL_HEIGHT'; height: number }
  | { type: 'UPDATE_MONITOR'; id: VitalId; update: Partial<VitalMonitor> }
  | { type: 'ADD_LOG_ENTRY'; entry: VitalsLogEntry }
  | { type: 'CLEAR_LOG' }
  | { type: 'SET_LOG_FILTER'; filter: LogLevel | 'all' }
  | { type: 'SET_RUNNING_DIAGNOSTIC'; running: boolean }
  | { type: 'SET_CARD_POSITION'; position: CardPosition };
```

### Reducer Rules

1. **Pure function** — no side effects inside the reducer (localStorage writes are the one exception for persistence, handled inline)
2. **Log cap** — `ADD_LOG_ENTRY` prunes entries beyond 500 (FIFO)
3. **Monitor updates** — `UPDATE_MONITOR` patches a single monitor by ID, leaving others untouched
4. **Card position** — `SET_CARD_POSITION` persists to localStorage immediately

---

## Data Flow

### User Action → Log Entry

```
  User clicks "Create Case" button
         │
         ▼
  Component calls vitals.action('You clicked "Create Case."')
         │
         ▼
  useVitalsLogger() creates VitalsLogEntry {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    level: 'action',
    message: 'You clicked "Create Case."'
  }
         │
         ▼
  dispatch({ type: 'ADD_LOG_ENTRY', entry })
         │
         ▼
  vitalsReducer appends to state.logEntries[]
         │
         ▼
  VitalsConsole re-renders → new entry appears at top
```

### Health Check Timer → Monitor Update

```
  setInterval (every 20 seconds)
         │
         ▼
  provider.checkProofServer()
         │
         ├── MockVitalsProvider: await sleep(random), return simulated result
         │
         └── LiveVitalsProvider: fetch('http://localhost:6300/version')
                                   │
                                   ├── 200 OK  → { status: 'healthy', responseTime: 52 }
                                   └── Error    → { status: 'critical', message: '...' }
         │
         ▼
  dispatch({ type: 'UPDATE_MONITOR', id: 'proof-server', update: { status, detailLine, ... } })
         │
         ▼
  VitalsTimeWheel re-renders → ring resets, color updates
         │
         ▼
  Auto-generated log entry: "Proof server checked. Healthy — responded in 52ms."
```

### Card Position Change

```
  User clicks chevron → selects "Cards on Left"
         │
         ▼
  dispatch({ type: 'SET_CARD_POSITION', position: 'left' })
         │
         ▼
  Reducer: localStorage.setItem('midnight-vitals-card-position', 'left')
           return { ...state, cardPosition: 'left' }
         │
         ▼
  VitalsPanel re-renders:
    - cardPosition === 'left' → flex-row layout
    - VitalsMonitorBar gets isVertical=true → stacks cards vertically
    - VitalsTimeWheel gets compact=true → renders compact card mode
```

---

## Provider Architecture

### Interface Contract

```typescript
interface VitalsProviderInterface {
  checkProofServer(): Promise<VitalCheckResult>;
  checkNetwork(): Promise<VitalCheckResult>;
  checkWallet(): Promise<VitalCheckResult>;
  checkContracts(contracts: ContractInfo[]): Promise<VitalCheckResult>;
  checkDependencies(): Promise<DependencyCheckResult[]>;
}
```

### Mock Provider

The `MockVitalsProvider` returns simulated results with realistic timings:
- Random latency between 30-200ms
- 85% healthy, 10% warning, 5% critical distribution
- Simulated contract counts and dependency versions
- Designed to make the UI look and feel exactly like production

### Live Provider (Planned)

The `LiveVitalsProvider` will make real HTTP requests:

| Check | Method | Endpoint |
|-------|--------|----------|
| Proof Server | `GET` | `http://localhost:6300/version` |
| Network | `POST` | `{INDEXER_URL}/api/v1/graphql` (introspection) |
| Wallet | Internal | Check `WalletProvider` state in memory |
| Contracts | `POST` | GraphQL query per contract address |
| Dependencies | `exec` | `docker --version`, `node --version`, `compact --version` |

### Adding a Custom Provider

Implement `VitalsProviderInterface` and pass it to `VitalsProvider`:

```tsx
<VitalsProvider mode="live" provider={myCustomProvider}>
```

---

## Component Hierarchy

```
VitalsProvider (Context)
│
├── VitalsToggleButton
│   ├── Stethoscope icon (toggle click)
│   ├── Critical badge (conditional)
│   ├── Active dot (conditional)
│   └── Settings dropdown
│       ├── "Card Layout" header
│       ├── "Cards on Top" option
│       ├── "Cards on Left" option
│       └── "Cards on Right" option
│
├── VitalsNavigationLogger (invisible, auto-logs routes)
│
└── VitalsPanel
    ├── Drag handle (resize)
    ├── Header bar
    │   ├── 🩺 icon + "MidnightVitals" title
    │   ├── Critical count badge
    │   ├── "Run Diagnostics" button
    │   └── "Close" button
    │
    └── Content area (layout depends on cardPosition)
        │
        ├── [top] VitalsMonitorBar (horizontal) → VitalsConsole
        │         └── VitalsTimeWheel x4 (inline pill mode)
        │
        ├── [left] VitalsMonitorBar (vertical, left) | VitalsConsole
        │          └── VitalsTimeWheel x4 (compact card mode)
        │
        └── [right] VitalsConsole | VitalsMonitorBar (vertical, right)
                                    └── VitalsTimeWheel x4 (compact card mode)
```

---

## Layout Engine

The `VitalsPanel` implements a flexible layout engine driven by `state.cardPosition`:

### Top Layout (Default)
```
┌─────────────────────────────────────────┐
│ [Header]                                │
│ [MonitorBar — flex-row, border-bottom]  │  ← ~40px
│ [Console — flex-1, overflow-y-auto]     │  ← fills remaining
└─────────────────────────────────────────┘
```

### Left Layout
```
┌─────────────────────────────────────────┐
│ [Header]                                │
│ ┌──────────┬────────────────────────┐   │
│ │ MonitorBar│ Console               │   │
│ │ (220px,   │ (flex-1,              │   │
│ │  vertical)│  overflow-y-auto)     │   │
│ │ border-r  │                       │   │
│ └──────────┴────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Right Layout
```
┌─────────────────────────────────────────┐
│ [Header]                                │
│ ┌────────────────────────┬──────────┐   │
│ │ Console                │MonitorBar│   │
│ │ (flex-1,               │(220px,   │   │
│ │  overflow-y-auto)      │ vertical)│   │
│ │                        │ border-l │   │
│ └────────────────────────┴──────────┘   │
└─────────────────────────────────────────┘
```

The `VitalsMonitorBar` switches between:
- **Horizontal**: `flex items-stretch gap-1.5` (for top)
- **Vertical**: `flex flex-col gap-1.5` (for left/right)

The `VitalsTimeWheel` switches between:
- **Inline pill**: `flex items-center` — ring + label + status all in one row
- **Compact card**: `flex items-center` — ring on left, label + status stacked on right

---

## Persistence Layer

| Key | Value | Purpose |
|-----|-------|---------|
| `midnight-vitals-open` | `'true' \| 'false'` | Whether panel was open when user last closed the tab |
| `midnight-vitals-height` | `number` (px) | Panel height preference |
| `midnight-vitals-card-position` | `'top' \| 'left' \| 'right'` | Card layout preference |

All persistence is via `localStorage` — no cookies, no server state, no external dependencies.

---

## Security Considerations

1. **No sensitive data in logs** — MidnightVitals logs user actions (button clicks, navigation) but never logs private keys, wallet seeds, or ZK proof contents
2. **No external network calls in mock mode** — Mock provider is entirely in-memory
3. **Live mode respects CORS** — Health checks go to localhost endpoints only; no cross-origin calls to external APIs
4. **Log entries are client-side only** — Never transmitted to any server
5. **localStorage is domain-scoped** — Preferences are isolated per origin

---

## Performance Budget

| Metric | Target | Actual |
|--------|--------|--------|
| Bundle size (gzipped) | < 15KB | ~12KB |
| Initial render time | < 5ms | ~3ms |
| Log entry render | < 1ms per entry | ~0.5ms |
| Memory (500 log entries) | < 2MB | ~1.2MB |
| Timer overhead | < 0.1% CPU | Negligible |
| SVG animation FPS | 60fps | 60fps (CSS transitions) |

### Optimizations

- **Log cap**: Maximum 500 entries, oldest pruned on overflow
- **CSS transitions**: SVG arcs animate via CSS, not JavaScript
- **Conditional rendering**: Panel content doesn't render when `isOpen === false`
- **No re-renders on timer tick**: Time wheel state is local (`useState`), not global context
- **Efficient filtering**: Log filter is applied in render, not as a separate state transformation

---

## Extension Points

### 1. Custom Providers
Implement `VitalsProviderInterface` to check any backend:

```typescript
class MyCustomProvider implements VitalsProviderInterface {
  async checkProofServer() { /* your logic */ }
  async checkNetwork() { /* your logic */ }
  // ...
}
```

### 2. Custom Log Levels
The type system allows extending `LogLevel` for domain-specific levels:

```typescript
// Future: 'debug' | 'trace' | 'audit' levels
```

### 3. Custom Monitors
The `VitalId` type can be extended to add new vital categories:

```typescript
// Future: 'docker' | 'compiler' | 'environment' | custom IDs
```

### 4. Event Webhooks (Planned)
Future versions will support dispatching log entries and monitor changes to external services:

```typescript
vitalsConfig.onLogEntry = (entry) => sendToSlack(entry);
vitalsConfig.onStatusChange = (monitor) => sendToDatadog(monitor);
```

### 5. Plugin System (Planned)
Register custom health check plugins:

```typescript
vitals.registerPlugin({
  id: 'redis-cache',
  label: 'Redis Cache',
  check: async () => pingRedis(),
  interval: 30,
});
```

---

## Dependency Graph

```
MidnightVitals
├── react (peer)
├── react-dom (peer)
├── react-router-dom (peer, for VitalsNavigationLogger)
├── lucide-react (icons)
└── tailwindcss (styling, peer)
```

No other runtime dependencies. The module is designed to work with any React 18+ application using Tailwind CSS for styling.

---

<p align="center">
  <sub>
    Architecture document maintained by John (bytewizard42i) & Penny 🎀<br/>
    Part of the <strong>MidnightVitals</strong> project — diagnostics for the Midnight blockchain ecosystem.
  </sub>
</p>
