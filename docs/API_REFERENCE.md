# 📖 MidnightVitals — API Reference

**Version**: 0.4.0  
**Last Updated**: Feb 22, 2026

---

## Table of Contents

- [Hooks](#hooks)
  - [useVitals()](#usevitals)
  - [useVitalsLogger()](#usevitalslogger)
  - [useVitalsInteraction()](#usevitalsinteraction)
- [Components](#components)
  - [VitalsProvider](#vitalsprovider)
  - [VitalsPanel](#vitalspanel)
  - [VitalsToggleButton](#vitalstogglebutton)
  - [VitalsMonitorBar](#vitalsmonitorbar)
  - [VitalsTimeWheel](#vitalstimewheel)
  - [VitalsConsole](#vitalsconsole)
  - [VitalsNavigationLogger](#vitalsnavigationlogger)
- [Types](#types)
- [Actions](#actions)
- [Messages](#messages)
- [Providers](#providers)

---

## Hooks

### `useVitals()`

Full access to the vitals context. Returns state, dispatch, and utility functions.

```typescript
const { state, dispatch, refreshVital, runDiagnostic } = useVitals();
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `state` | `VitalsState` | Complete current state |
| `dispatch` | `(action: VitalsAction) => void` | Dispatch state updates |
| `refreshVital` | `(id: VitalId) => void` | Trigger immediate health check for one vital |
| `runDiagnostic` | `() => void` | Run full diagnostic scan of all vitals |

#### Usage

```tsx
function MyComponent() {
  const { state, refreshVital } = useVitals();
  
  return (
    <div>
      <p>Panel is {state.isOpen ? 'open' : 'closed'}</p>
      <p>Card position: {state.cardPosition}</p>
      <p>Proof server: {state.monitors[0].status}</p>
      <button onClick={() => refreshVital('proof-server')}>
        Check Proof Server
      </button>
    </div>
  );
}
```

> **Note**: Must be called inside a `<VitalsProvider>`. Throws if used outside the provider boundary.

---

### `useVitalsLogger()`

Convenience hook for pushing log entries. Returns shorthand methods for each log level.

```typescript
const vitals = useVitalsLogger();
```

#### Returns

| Method | Signature | Description |
|--------|-----------|-------------|
| `action` | `(message: string) => void` | Log a user action (blue) |
| `info` | `(message: string) => void` | Log informational context (gray) |
| `success` | `(message: string) => void` | Log a success event (green) |
| `warning` | `(message: string) => void` | Log a warning (amber) |
| `error` | `(message: string, detail?: string, suggestion?: string) => void` | Log an error with optional explanation and fix (red) |
| `log` | `(level: LogLevel, message: string, detail?: string, suggestion?: string) => void` | Generic log entry |

#### Usage

```tsx
function CreateCaseButton() {
  const vitals = useVitalsLogger();

  const handleClick = async () => {
    // Blue action log
    vitals.action('You clicked "Create New Case."');
    
    // Gray informational log
    vitals.info('Building a zero-knowledge proof. This takes about 20 seconds...');
    
    try {
      const result = await createCase();
      
      // Green success log
      vitals.success(`Case "${result.title}" created successfully. ID: ${result.id}`);
    } catch (err) {
      // Red error log with explanation and suggested fix
      vitals.error(
        'Failed to create case.',
        'The proof server could not generate a valid ZK proof. This usually means the Docker container is not running or has crashed.',
        'Try running: docker restart midnight-proof-server'
      );
    }
  };

  return <button onClick={handleClick}>Create Case</button>;
}
```

#### How Error Entries Render

When you call `vitals.error(message, detail, suggestion)`, the console displays:

```
11:03:47  ✕  Failed to create case.
             What this means: The proof server could not generate a valid
             ZK proof. This usually means the Docker container is not
             running or has crashed.
             💡 Try running: docker restart midnight-proof-server
```

---

### `useVitalsInteraction()`

Interaction tracking hook for hover and click logging. Hover events are debounced (3-second cooldown per label) to avoid spamming the console. Click events always log immediately.

```typescript
const track = useVitalsInteraction();
```

#### Returns

A callable `track` function with two additional method properties:

| API | Signature | Description |
|-----|-----------|-------------|
| `track(label)` | `(label: string) => { onMouseEnter, onClick }` | Returns both handlers — spread onto any element |
| `track.hover(label)` | `(label: string) => () => void` | Returns just the debounced hover handler |
| `track.click(label)` | `(label: string) => () => void` | Returns just the click handler |

#### Usage — Spread both handlers

```tsx
function MyButton() {
  const track = useVitalsInteraction();

  return (
    <button {...track('Create Case button')}>
      Create Case
    </button>
  );
}
```

This logs:
- `Hovered over "Create Case button".` (on mouse enter, debounced)
- `Clicked "Create Case button".` (on click)

#### Usage — Hover-only (element already has its own onClick)

```tsx
function CaseRow({ caseData, onClick }) {
  const track = useVitalsInteraction();

  return (
    <button onMouseEnter={track.hover(`Case: ${caseData.title}`)} onClick={onClick}>
      {caseData.title}
    </button>
  );
}
```

#### Usage — Click-only

```tsx
const track = useVitalsInteraction();

<button onClick={track.click('Submit form')}>Submit</button>
```

#### Log Levels

| Event | Level | Console Prefix |
|-------|-------|----------------|
| Hover | `info` | `ℹ` |
| Click | `action` | `►` |

#### Debouncing

Hover events are deduplicated per label — the same label won't log more than once every **3 seconds**. Different labels are tracked independently. Click events are never debounced.

> **Note**: Must be called inside a `<VitalsProvider>`. The hook uses `useVitals()` internally.

---

## Components

### `VitalsProvider`

The root context provider. Wraps your entire application (or the subtree that needs vitals).

```tsx
<VitalsProvider mode="mock" contracts={contracts}>
  {children}
</VitalsProvider>
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `mode` | `'mock' \| 'live'` | No | `'mock'` | Which provider to use |
| `contracts` | `ContractInfo[]` | No | `[]` | Smart contracts to monitor |
| `children` | `ReactNode` | Yes | — | Your application |

#### Example

```tsx
import { VitalsProvider } from '@/vitals';

function App() {
  return (
    <VitalsProvider
      mode="mock"
      contracts={[
        { id: 'discovery-core', name: 'Case Management', address: '0xa7f3e1b2c4d5f6' },
        { id: 'document-registry', name: 'Document Registry', address: '0xb8e4f2c3d6a7e8' },
      ]}
    >
      <RouterProvider router={router} />
    </VitalsProvider>
  );
}
```

---

### `VitalsPanel`

The main diagnostic panel. Renders fixed at the bottom of the viewport. Includes the monitor bar, console log, and drag-to-resize handle. Only renders when `state.isOpen === true`.

```tsx
<VitalsPanel />
```

#### Props

None. All state comes from context.

#### Behavior

- **Position**: `fixed bottom-0`, spans full width minus sidebar (left offset: 68px)
- **Z-index**: 40 (above content, below modals)
- **Height**: Controlled by `state.panelHeight` (default: 320px)
- **Resize**: Drag handle at top, range: 200px–70% viewport
- **Layout**: Adapts based on `state.cardPosition` (top/left/right)

---

### `VitalsToggleButton`

The 🩺 stethoscope button with integrated settings dropdown. Place this in your app header.

```tsx
<VitalsToggleButton />
```

#### Props

None. All state comes from context.

#### Behavior

- **Click stethoscope**: Toggles `state.isOpen`
- **Click chevron**: Opens/closes card layout settings dropdown
- **Critical badge**: Red pulse dot appears when any vital has `status === 'critical'`
- **Active indicator**: Green dot when panel is open (and no critical vitals)
- **Settings menu**: Three options — Cards on Top, Cards on Left, Cards on Right
- **Outside click**: Closes settings dropdown

---

### `VitalsMonitorBar`

Renders all 4 vital monitors. Adapts layout based on `state.cardPosition`.

```tsx
<VitalsMonitorBar />
```

#### Props

None. All state comes from context.

#### Behavior

- **Top position**: Horizontal `flex` row with `border-bottom`
- **Left/Right position**: Vertical `flex-col` stack with padding
- **Passes `compact` prop**: `true` when in vertical layout, `false` for horizontal

---

### `VitalsTimeWheel`

A single vital monitor card with an animated SVG countdown ring.

```tsx
<VitalsTimeWheel
  label="Proof Server"
  status="healthy"
  detailLine="Response: 52ms"
  lastCheckTimestamp={Date.now()}
  checkIntervalSeconds={20}
  onRefresh={() => refreshVital('proof-server')}
  compact={false}
/>
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | — | Display name (e.g., "Proof Server") |
| `status` | `VitalStatus` | Yes | — | Current health status |
| `detailLine` | `string` | Yes | — | Short detail text (e.g., "Response: 52ms") |
| `lastCheckTimestamp` | `number \| null` | Yes | — | Unix ms of last check, `null` if never checked |
| `checkIntervalSeconds` | `number` | Yes | — | Seconds between auto-checks |
| `onRefresh` | `() => void` | Yes | — | Callback for manual refresh button |
| `compact` | `boolean` | No | `false` | Render as compact card (for sidebar layouts) |

#### Rendering Modes

**Inline Pill** (`compact={false}`):
```
[○ 14s] Proof Server  ● Healthy  Response: 52ms  [↻]
```

**Compact Card** (`compact={true}`):
```
[○ 14s]  Proof Server  ●
         Healthy  52ms  [↻]
```

---

### `VitalsConsole`

Scrollable activity log with filtering, copy, clear, and auto-scroll.

```tsx
<VitalsConsole />
```

#### Props

None. All state comes from context.

#### Features

- **Entry order**: Newest entries at top, pushing older entries down
- **Auto-scroll**: Snaps to top when new entries arrive (if not manually scrolled)
- **Jump to latest**: Button appears when user scrolls away from top
- **Filter toolbar**: Click level buttons to filter by log level
- **Copy**: Copies all visible entries to clipboard as timestamped text
- **Clear**: Removes all log entries from state
- **Empty state**: Shows "No log entries yet" when log is empty

---

### `VitalsNavigationLogger`

Invisible component that auto-logs route changes. Uses `react-router-dom`'s `useLocation()`.

```tsx
<VitalsNavigationLogger />
```

#### Props

None.

#### Behavior

- Renders nothing (`null`)
- Listens for `pathname` changes via `useLocation()`
- Logs each navigation as an `action` level entry
- Example: `Navigated to /dashboard/cases`
- Place once inside your router layout

---

## Types

### `VitalStatus`

```typescript
type VitalStatus = 'healthy' | 'warning' | 'critical' | 'unknown';
```

| Value | Color | Meaning |
|-------|-------|---------|
| `healthy` | Emerald green | Running and responsive |
| `warning` | Amber | Running but degraded (slow, partial) |
| `critical` | Red | Down or unreachable |
| `unknown` | Gray | Not yet checked |

### `VitalId`

```typescript
type VitalId = 'proof-server' | 'network' | 'wallet' | 'contracts';
```

### `LogLevel`

```typescript
type LogLevel = 'action' | 'info' | 'success' | 'warning' | 'error';
```

| Level | Color | Icon | Use For |
|-------|-------|------|---------|
| `action` | Blue | `►` | User performed an action |
| `info` | Gray | `ℹ` | Informational context |
| `success` | Green | `✓` | Something completed successfully |
| `warning` | Amber | `⚠` | Something to watch, not broken |
| `error` | Red | `✕` | Something failed |

### `CardPosition`

```typescript
type CardPosition = 'top' | 'left' | 'right';
```

### `VitalMonitor`

```typescript
interface VitalMonitor {
  id: VitalId;
  label: string;                       // "Proof Server"
  status: VitalStatus;
  lastCheckTimestamp: number | null;    // Unix ms, null = never
  lastResponseTimeMs: number | null;   // Latency in ms
  message: string;                     // Plain-English status
  detailLine: string;                  // Short detail for card
  checkIntervalSeconds: number;        // Auto-check interval
}
```

### `VitalCheckResult`

```typescript
interface VitalCheckResult {
  status: VitalStatus;
  message: string;
  detailLine: string;
  responseTimeMs: number | null;
}
```

### `VitalsLogEntry`

```typescript
interface VitalsLogEntry {
  id: string;                         // Unique ID
  timestamp: number;                  // Unix ms
  level: LogLevel;
  message: string;                    // Primary message
  detail?: string;                    // "What this means" paragraph
  suggestion?: string;                // "What to do" guidance
}
```

### `ContractInfo`

```typescript
interface ContractInfo {
  id: string;                         // "discovery-core"
  name: string;                       // "Case Management"
  address: string;                    // On-chain address
}
```

### `DependencyCheckResult`

```typescript
interface DependencyCheckResult {
  name: string;                       // "Docker", "Node.js", etc.
  installed: boolean;
  version: string | null;
  message: string;
}
```

### `DiagnosticReport`

```typescript
interface DiagnosticReport {
  timestamp: number;
  vitals: VitalMonitor[];
  dependencies: DependencyCheckResult[];
  totalChecks: number;
  healthyCount: number;
  summary: string;                    // "10 out of 12 vitals are healthy."
}
```

### `VitalsState`

```typescript
interface VitalsState {
  isOpen: boolean;
  panelHeight: number;
  cardPosition: CardPosition;
  monitors: VitalMonitor[];
  logEntries: VitalsLogEntry[];
  logFilter: LogLevel | 'all';
  isRunningDiagnostic: boolean;
}
```

### `VitalsAction`

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

### `VitalsProviderInterface`

```typescript
interface VitalsProviderInterface {
  checkProofServer(): Promise<VitalCheckResult>;
  checkNetwork(): Promise<VitalCheckResult>;
  checkWallet(): Promise<VitalCheckResult>;
  checkContracts(contracts: ContractInfo[]): Promise<VitalCheckResult>;
  checkDependencies(): Promise<DependencyCheckResult[]>;
}
```

---

## Actions

### `TOGGLE_PANEL`

Toggles `state.isOpen` between `true` and `false`.

```typescript
dispatch({ type: 'TOGGLE_PANEL' });
```

### `SET_PANEL_HEIGHT`

Sets the panel height in pixels. Clamped between 200px and 70% of viewport.

```typescript
dispatch({ type: 'SET_PANEL_HEIGHT', height: 400 });
```

### `UPDATE_MONITOR`

Partially updates a single monitor by ID. Other monitors are untouched.

```typescript
dispatch({
  type: 'UPDATE_MONITOR',
  id: 'proof-server',
  update: { status: 'healthy', detailLine: 'Response: 52ms' }
});
```

### `ADD_LOG_ENTRY`

Appends a log entry. If total exceeds 500, oldest entries are pruned.

```typescript
dispatch({
  type: 'ADD_LOG_ENTRY',
  entry: {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    level: 'success',
    message: 'Case created successfully.',
  }
});
```

### `CLEAR_LOG`

Removes all log entries.

```typescript
dispatch({ type: 'CLEAR_LOG' });
```

### `SET_LOG_FILTER`

Sets the active log filter. `'all'` shows everything.

```typescript
dispatch({ type: 'SET_LOG_FILTER', filter: 'error' });
```

### `SET_RUNNING_DIAGNOSTIC`

Sets whether a full diagnostic scan is in progress.

```typescript
dispatch({ type: 'SET_RUNNING_DIAGNOSTIC', running: true });
```

### `SET_CARD_POSITION`

Changes the card layout position. Persists to localStorage.

```typescript
dispatch({ type: 'SET_CARD_POSITION', position: 'left' });
```

---

## Messages

The `messages.ts` module exports natural-language message template objects used by providers:

| Export | Description |
|--------|-------------|
| `PROOF_SERVER_MESSAGES` | Messages for proof server health states |
| `NETWORK_MESSAGES` | Messages for network/indexer states |
| `WALLET_MESSAGES` | Messages for wallet connection states |
| `CONTRACT_MESSAGES` | Messages for smart contract states |
| `DEPENDENCY_MESSAGES` | Messages for dependency check states |
| `ACTIVITY_MESSAGES` | Messages for user activity events |

These are designed to be customized. Override them by passing custom messages to the provider config (future API).

---

## Providers

### `MockVitalsProvider`

Simulated health checks with realistic timings for demo and development.

```typescript
import { MockVitalsProvider } from '@/vitals';

const provider = new MockVitalsProvider();
const result = await provider.checkProofServer();
// { status: 'healthy', message: '...', detailLine: 'Response: 87ms', responseTimeMs: 87 }
```

#### Behavior

- Random latency: 30–200ms per check
- Status distribution: ~85% healthy, ~10% warning, ~5% critical
- Simulated contract counts and dependency versions
- Thread-safe (no shared mutable state)

### `LiveVitalsProvider` (Planned)

Real HTTP health checks for production use. See [ROADMAP.md](ROADMAP.md) for timeline.

---

## Barrel Exports

Everything is exported from the barrel file `src/vitals/index.ts`:

```typescript
// Context & hooks
export { VitalsProvider, useVitals, useVitalsLogger } from './context';

// Components
export { VitalsPanel } from './components/VitalsPanel';
export { VitalsToggleButton } from './components/VitalsToggleButton';
export { VitalsMonitorBar } from './components/VitalsMonitorBar';
export { VitalsTimeWheel } from './components/VitalsTimeWheel';
export { VitalsConsole } from './components/VitalsConsole';
export { VitalsNavigationLogger } from './components/VitalsNavigationLogger';

// Types
export type {
  VitalStatus, VitalId, VitalMonitor, VitalCheckResult,
  LogLevel, VitalsLogEntry, ContractInfo, DependencyCheckResult,
  DiagnosticReport, VitalsProviderInterface, VitalsState,
  VitalsAction, CardPosition,
} from './types';

// Messages
export {
  PROOF_SERVER_MESSAGES, NETWORK_MESSAGES, WALLET_MESSAGES,
  CONTRACT_MESSAGES, DEPENDENCY_MESSAGES, ACTIVITY_MESSAGES,
} from './messages';

// Providers
export { MockVitalsProvider } from './mock-vitals-provider';
```

---

<p align="center">
  <sub>
    API Reference maintained by John (bytewizard42i) & Penny 🎀<br/>
    Part of the <strong>MidnightVitals</strong> project.
  </sub>
</p>
