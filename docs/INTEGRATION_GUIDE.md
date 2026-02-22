# 🔌 MidnightVitals — Integration Guide

**Version**: 0.4.0  
**Last Updated**: Feb 22, 2026

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Step 1: Add the Provider](#step-1-add-the-provider)
- [Step 2: Add the Toggle Button](#step-2-add-the-toggle-button)
- [Step 3: Add the Panel](#step-3-add-the-panel)
- [Step 4: Auto-Log Navigation](#step-4-auto-log-navigation)
- [Step 5: Log User Actions](#step-5-log-user-actions)
- [Advanced Integration](#advanced-integration)
- [Integration Examples](#integration-examples)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Dependency | Version | Required |
|-----------|---------|----------|
| React | 18+ | Yes |
| TypeScript | 5.0+ | Recommended |
| Tailwind CSS | 3.0+ or 4.0+ | Yes (for styling) |
| Lucide React | Any | Yes (for icons) |
| react-router-dom | 6+ | Optional (for navigation logging) |

---

## Installation

### Option A: Copy the Module (Current)

Until the npm package is published, copy the vitals source directly:

```bash
# From the AutoDiscovery.legal repo (or wherever the source lives)
cp -r src/vitals/ your-project/src/vitals/
```

### Option B: npm Package (Coming Soon)

```bash
npm install @midnight-vitals/core
# or
yarn add @midnight-vitals/core
# or
pnpm add @midnight-vitals/core
```

---

## Step 1: Add the Provider

Wrap your application (or the relevant subtree) with `VitalsProvider`. This must be the outermost vitals component — all other vitals components and hooks must be descendants.

```tsx
// src/App.tsx
import { VitalsProvider } from '@/vitals';

function App() {
  return (
    <VitalsProvider mode="mock">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="cases/:id" element={<CaseView />} />
            {/* ... */}
          </Route>
        </Routes>
      </BrowserRouter>
    </VitalsProvider>
  );
}
```

#### Mode Selection

| Mode | When to Use |
|------|-------------|
| `"mock"` | Development, demos, presentations — no real backend needed |
| `"live"` | Production — real HTTP health checks to proof server, indexer, etc. |

#### With Smart Contracts

If your DApp deploys smart contracts, pass them for monitoring:

```tsx
<VitalsProvider
  mode="live"
  contracts={[
    { id: 'discovery-core', name: 'Case Management', address: import.meta.env.VITE_CONTRACT_DISCOVERY },
    { id: 'document-registry', name: 'Document Registry', address: import.meta.env.VITE_CONTRACT_DOCUMENTS },
    { id: 'compliance-proof', name: 'Compliance Proofs', address: import.meta.env.VITE_CONTRACT_COMPLIANCE },
  ]}
>
```

---

## Step 2: Add the Toggle Button

Place the stethoscope button in your app header. It toggles the panel open/closed and includes the settings dropdown.

```tsx
// src/components/Header.tsx
import { VitalsToggleButton } from '@/vitals';

function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b">
      <Logo />
      <nav>{/* ... */}</nav>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <VitalsToggleButton />  {/* ← Add here */}
        <UserMenu />
      </div>
    </header>
  );
}
```

The button automatically shows:
- 🩺 Stethoscope icon (click to toggle panel)
- ⌄ Settings chevron (click for card layout options)
- 🔴 Red pulse badge when any vital is critical
- 🟢 Green dot when panel is open and all vitals healthy

---

## Step 3: Add the Panel

Place the panel component anywhere inside the provider. It renders as a `fixed` element at the bottom of the viewport, so its position in the component tree doesn't matter visually.

```tsx
// src/App.tsx (or your root layout)
import { VitalsProvider, VitalsPanel, VitalsToggleButton } from '@/vitals';

function App() {
  return (
    <VitalsProvider mode="mock">
      <Layout>
        <VitalsToggleButton />
        <Outlet />
      </Layout>
      <VitalsPanel />  {/* ← Renders fixed at bottom */}
    </VitalsProvider>
  );
}
```

The panel:
- Slides up from the bottom when opened
- Has a drag handle for resizing (200px–70% viewport)
- Remembers its height across sessions (localStorage)
- Contains the monitor bar and console log
- Layout adapts based on user's card position preference

---

## Step 4: Auto-Log Navigation

Drop the `VitalsNavigationLogger` into your router layout to automatically log every route change.

```tsx
// src/layouts/AppLayout.tsx
import { VitalsNavigationLogger } from '@/vitals';

function AppLayout() {
  return (
    <>
      <VitalsNavigationLogger />  {/* ← Invisible, logs all route changes */}
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
```

This will produce log entries like:
```
11:03:18  ►  Navigated to /dashboard
11:04:02  ►  Navigated to /cases/abc-123
11:04:15  ►  Navigated to /settings
```

> **Requires `react-router-dom`** — uses `useLocation()` internally.

---

## Step 5: Log User Actions

Use the `useVitalsLogger()` hook to log specific user interactions from any component.

### Basic Usage

```tsx
import { useVitalsLogger } from '@/vitals';

function CaseListItem({ case }) {
  const vitals = useVitalsLogger();

  return (
    <div onClick={() => {
      vitals.action(`Opened case "${case.title}".`);
      navigate(`/cases/${case.id}`);
    }}>
      {case.title}
    </div>
  );
}
```

### All Log Levels

```tsx
const vitals = useVitalsLogger();

// User did something
vitals.action('You clicked "Submit Evidence."');

// Context about what's happening
vitals.info('Uploading document to IPFS and generating content hash...');

// Something worked
vitals.success('Evidence submitted. Transaction confirmed in block #4,231.');

// Something to watch
vitals.warning('Wallet balance is low. You have 2.3 tDUST remaining.');

// Something failed (with explanation + fix suggestion)
vitals.error(
  'Evidence upload failed.',
  'The proof server returned a timeout error. This usually happens when the Docker container is overloaded or has crashed.',
  'Try restarting the proof server: docker restart midnight-proof-server'
);
```

### Logging Guidelines

Write log messages as if you're talking to a non-technical user:

| ❌ Bad | ✅ Good |
|--------|---------|
| `"POST /api/cases 201"` | `'Case "Smith v. Jones" created successfully.'` |
| `"tx hash: 0xa7f3..."` | `'Transaction confirmed. Your evidence is now on-chain.'` |
| `"ECONNREFUSED"` | `'Cannot reach the proof server. It may not be running.'` |
| `"ZK proof failed"` | `'The zero-knowledge proof could not be generated. This might mean the proof server is overloaded.'` |

---

## Advanced Integration

### Custom Health Check Intervals

Override the default check intervals per vital:

```tsx
// Future API (v0.9.0+)
<VitalsProvider
  mode="live"
  config={{
    checkIntervals: {
      'proof-server': 10,  // Check every 10 seconds
      'network': 30,       // Check every 30 seconds
      'wallet': 60,        // Check every 60 seconds
      'contracts': 45,     // Check every 45 seconds
    }
  }}
>
```

### Programmatic Control

```tsx
const { dispatch, refreshVital, runDiagnostic } = useVitals();

// Open the panel programmatically
dispatch({ type: 'TOGGLE_PANEL' });

// Force-refresh a specific vital
refreshVital('proof-server');

// Run a full diagnostic scan
runDiagnostic();

// Change card layout
dispatch({ type: 'SET_CARD_POSITION', position: 'left' });

// Clear the console
dispatch({ type: 'CLEAR_LOG' });

// Filter to errors only
dispatch({ type: 'SET_LOG_FILTER', filter: 'error' });
```

### Conditional Rendering

Only show vitals in development:

```tsx
{import.meta.env.DEV && (
  <>
    <VitalsToggleButton />
    <VitalsPanel />
  </>
)}
```

### Using Individual Components

You can use components independently:

```tsx
import { VitalsConsole, VitalsTimeWheel } from '@/vitals';

// Just the console log, embedded in your own layout
function MyCustomPanel() {
  return (
    <div className="my-custom-container">
      <VitalsConsole />
    </div>
  );
}

// Just a single time wheel
function ProofServerStatus() {
  const { state, refreshVital } = useVitals();
  const proofServer = state.monitors.find(m => m.id === 'proof-server')!;
  
  return (
    <VitalsTimeWheel
      label={proofServer.label}
      status={proofServer.status}
      detailLine={proofServer.detailLine}
      lastCheckTimestamp={proofServer.lastCheckTimestamp}
      checkIntervalSeconds={proofServer.checkIntervalSeconds}
      onRefresh={() => refreshVital('proof-server')}
    />
  );
}
```

---

## Integration Examples

### AutoDiscovery.legal (Full Integration)

The reference implementation — a legal discovery platform on Midnight:

```tsx
// App.tsx
<VitalsProvider
  mode="mock"
  contracts={[
    { id: 'discovery-core', name: 'Case Management', address: '0xa7f3...' },
    { id: 'document-registry', name: 'Documents', address: '0xb8e4...' },
    { id: 'compliance-proof', name: 'Compliance', address: '0xc9d5...' },
    { id: 'jurisdiction-registry', name: 'Jurisdictions', address: '0xd0e6...' },
    { id: 'access-control', name: 'Access Control', address: '0xe1f7...' },
    { id: 'expert-witness', name: 'Expert Witnesses', address: '0xf2a8...' },
  ]}
>
```

Logged interactions:
- Dashboard case clicks, sidebar navigation, notification clicks
- Case-view tab switches, jurisdiction toggle
- Search queries, filter changes, result clicks
- Compliance data loading, attestation counts
- Settings theme changes, notification preference toggles
- Contact star rating changes
- All route navigations (automatic)

### Midnight Counter Example (Minimal Integration)

For Midnight's official counter example:

```tsx
<VitalsProvider mode="live" contracts={[
  { id: 'counter', name: 'Counter Contract', address: counterAddress },
]}>
  <VitalsToggleButton />
  <CounterApp />
  <VitalsPanel />
</VitalsProvider>
```

```tsx
// In the counter component
const vitals = useVitalsLogger();

const handleIncrement = async () => {
  vitals.action('You clicked "Increment Counter."');
  vitals.info('Building a zero-knowledge proof for the increment operation...');
  
  try {
    await contract.increment();
    vitals.success(`Counter incremented to ${newValue}.`);
  } catch (err) {
    vitals.error('Increment failed.', err.message, 'Check that the proof server is running.');
  }
};
```

### Midnight Bulletin Board Example

```tsx
<VitalsProvider mode="live" contracts={[
  { id: 'bboard', name: 'Bulletin Board', address: bboardAddress },
]}>
```

```tsx
const vitals = useVitalsLogger();

const handlePost = async (message: string) => {
  vitals.action(`You posted a message to the bulletin board.`);
  vitals.info('Generating ZK proof to post anonymously...');
  
  try {
    await contract.postMessage(message);
    vitals.success('Message posted anonymously. Nobody can link this to your identity.');
  } catch (err) {
    vitals.error(
      'Failed to post message.',
      'The bulletin board contract rejected the transaction.',
      'Make sure your wallet is connected and has sufficient tDUST.'
    );
  }
};
```

---

## Troubleshooting

### Panel doesn't appear

1. Verify `<VitalsPanel />` is inside `<VitalsProvider>`
2. Verify `<VitalsToggleButton />` is also inside the provider
3. Click the 🩺 stethoscope icon to open the panel
4. Check that no CSS is hiding `position: fixed` elements (e.g., `overflow: hidden` on body)
5. Check z-index conflicts (panel uses `z-40`)

### Logs not showing

1. Verify `useVitalsLogger()` is called inside a `<VitalsProvider>` descendant
2. Check browser console for React context errors
3. Verify you're calling `vitals.action()`, `vitals.info()`, etc. — not just `vitals.log()`
4. Check if the log filter is hiding entries (click "All" in the filter bar)

### Time wheels stuck at "--"

1. Time wheels show "--" until the first health check completes
2. Wait 20 seconds for the auto-check timer to fire
3. Click the ↻ refresh button on the wheel to force an immediate check
4. In mock mode, the first check happens ~1-3 seconds after mount

### Navigation logger not working

1. Verify `<VitalsNavigationLogger />` is inside both `<VitalsProvider>` and a `<BrowserRouter>`
2. It requires `react-router-dom` v6+ — check your dependencies
3. The logger uses `useLocation()` — it must be a descendant of the router

### Settings dropdown doesn't appear

1. Click the small chevron (⌄) to the right of the stethoscope icon
2. If the menu appears behind other elements, check z-index (menu uses `z-50`)
3. Clicking outside the menu dismisses it

### Panel height resets

1. Panel height is stored in `localStorage` under key `midnight-vitals-height`
2. Check if your app clears localStorage on logout
3. Private/incognito mode may not persist localStorage

### TypeScript errors after copying module

1. Verify your `tsconfig.json` has `"jsx": "react-jsx"` or `"react"`
2. Verify path aliases are set up (e.g., `@/vitals` → `src/vitals`)
3. Install missing dependencies: `npm install lucide-react`
4. If using Tailwind v3, the utility classes should still work

---

<p align="center">
  <sub>
    Integration Guide maintained by John (SpyCrypto) & Penny 🎀<br/>
    Part of the <strong>MidnightVitals</strong> project.
  </sub>
</p>
