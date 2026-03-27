<p align="center">
  <img src="https://img.shields.io/badge/Midnight-Blockchain-6C3FE0?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIyIDEyaC00bC0zIDlMOSAzbC0zIDlIMiIvPjwvc3ZnPg==&logoColor=white" alt="Midnight Blockchain" />
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18+" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge" alt="MIT License" />
</p>

<br/>

<h1 align="center">
  <br/>
  🩺 MidnightVitals
  <br/>
  <sub><sup>Real-Time Diagnostics for Midnight Blockchain DApps</sup></sub>
</h1>

<p align="center">
  <strong>A real-time CLI diagnostic console for Midnight blockchain DApps.</strong><br/>
  Monitors your wallet, proof server, smart contracts, and network connection with timed health pings — while logging every physical interaction on your UI (hovers, clicks, and their outputs) in a human-readable console.
</p>

<br/>

<p align="center">
  <a href="#-project-status">Status</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-card-layouts">Card Layouts</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="docs/">Full Docs</a>
</p>

---

## What Is MidnightVitals?

MidnightVitals is a **developer/admin diagnostic console** built to help you debug and verify your Midnight DApp while being assured that all your dependencies are running and configured correctly. It pings everything on a timer — proof server, network indexer, wallet, smart contracts — and presents the results in a super intuitive UI that any DApp admin can attach to their project.

The CLI console also gives a real-time readout of everything happening physically on the UI: what the user hovered over, what they clicked, and what the output was. It's closable, moveable (dock it or float it anywhere on screen), and designed to stay out of the way until you need it.

### ⚠️ Project Status

> **This repo is the future standalone package.** The source code currently lives inside the [AutoDiscovery.legal](https://github.com/bytewizard42i/autoDiscovery_legal) frontend, where MidnightVitals was born and is actively developed. This repo contains the documentation, architecture, and roadmap — the actual source will be extracted here once the module is stable enough to work as a plug-and-play npm package for any Midnight DApp.
>
> **What's left to make it standalone:** build pipeline (tsup/vite lib mode), `package.json` with peer deps, CSS extraction strategy for Tailwind consumers, optional `react-router-dom` integration, and tests.

---

## The Problem

Building on Midnight means juggling **five concurrent systems** — proof server, network indexer, wallet, smart contracts, and a ZK compiler — each with its own cryptic error messages and failure modes.

When something breaks (and it will), you face:

```
Error: proof verification failed
```

Which component failed? What does it mean? What do you do next? **You have no idea.**

## The Solution

**MidnightVitals** gives you a single diagnostic panel that watches everything, explains everything in plain English, and tells you exactly what to fix.

```
┌─────────────────────────────────────────────────────────────────────┐
│  🩺 MidnightVitals                                      [Close]    │
│─────────────────────────────────────────────────────────────────────│
│  ○ Proof Server  ● Healthy  52ms  ↻ │ ○ Network  ● Healthy  ↻     │
│  ○ Wallet  ● Healthy  142 tDUST  ↻  │ ○ Contracts  ● Degraded  ↻  │
│─────────────────────────────────────────────────────────────────────│
│  11:03:47  ✓  Proof built successfully in 23.4 seconds.            │
│  11:03:24  ℹ  Building zero-knowledge proof for case creation...   │
│  11:03:22  ►  You clicked "Create New Case."                       │
│  11:03:18  ►  Navigated to /dashboard                              │
│  11:02:55  ✓  Wallet connected. Balance: 142.5 tDUST               │
│  11:02:50  ℹ  MidnightVitals initialized. Checking all systems...  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🫀 Continuous Health Monitoring
Four vital monitors track every component of your Midnight stack in real-time with animated SVG countdown timers and color-coded status indicators.

| Component | What It Checks | Interval |
|-----------|---------------|----------|
| **Proof Server** | Docker container, `/version` endpoint, response latency | 20s |
| **Network Indexer** | GraphQL connectivity, block height, sync status | 20s |
| **Wallet** | Connection state, balance, key availability | 20s |
| **Smart Contracts** | Deployment status, read-call health per contract | 30s |

### 📝 Natural-Language Console
Every user action, health check, and blockchain interaction is logged in **plain English** — no jargon without explanation. Errors include "What this means" and "What to do next" sections.

### 🔄 Animated Time Wheels
Each vital has a circular SVG countdown ring that depletes over the check interval and refills on each successful check. Visual at-a-glance health.

### ⚙️ Customizable Card Layouts
Users pick where diagnostic cards live relative to the console via a settings dropdown:

| Layout | Description | Best For |
|--------|------------|----------|
| **Top** | Slim horizontal pill strip above CLI | Maximum console space |
| **Left** | Vertical sidebar on the left | Wide monitors, side-by-side |
| **Right** | Vertical sidebar on the right | Wide monitors, preference |

### 📐 Resizable & Moveable Panel
Two panel modes give you full control of where MidnightVitals lives on your screen:

| Mode | Description | How to Activate |
|------|------------|-----------------|
| **Docked** | Fixed to the bottom of the viewport. Drag the top handle to resize vertically (up to 70% of viewport). | Default — or click "Dock" in the panel header |
| **Floating** | Free-positioned window you can drag anywhere on screen. Resize from the bottom-right corner in both dimensions. | Click "Float" in the panel header, or use the settings dropdown |

Both modes persist position, size, and mode preference to `localStorage` across sessions. Switch between them at any time via the panel header buttons or the settings dropdown on the stethoscope toggle.

### 🎯 Log Filtering
Filter console entries by level: Action, Info, Success, Warning, Error — or show all. Copy logs to clipboard. Clear with one click.

### 🔌 Provider Architecture
Swap between **Mock** (simulated data for demos) and **Live** (real HTTP pings and contract reads) without changing a single line of UI code.

### 🧭 Automatic Navigation Logging
The `VitalsNavigationLogger` component auto-captures every route change — no manual wiring needed.

### 🖱️ Interaction Tracking
The `useVitalsInteraction()` hook logs hover and click events to the CLI console. Hover events are **debounced** (3s cooldown per element) to avoid noise. Clicks always log immediately. Three API styles:

```tsx
const track = useVitalsInteraction();

// Spread both handlers onto any element
<button {...track('Create Case')}>Create</button>

// Hover-only (when the element already has its own onClick)
<div onMouseEnter={track.hover('Stats Card')}>...</div>

// Click-only
<button onClick={track.click('Submit')}>Submit</button>
```

---

## 🚀 Quick Start

### 1. Install

```bash
# Coming soon to npm — for now, copy the vitals/ module into your project
cp -r vitals/ your-project/src/vitals/
```

### 2. Wrap Your App

```tsx
import { VitalsProvider, VitalsPanel, VitalsToggleButton } from '@/vitals';

function App() {
  return (
    <VitalsProvider mode="mock">
      <YourAppLayout>
        {/* Add the toggle button in your header */}
        <VitalsToggleButton />
        
        {/* Routes, pages, etc. */}
        <Outlet />
      </YourAppLayout>
      
      {/* Panel renders fixed at the bottom */}
      <VitalsPanel />
    </VitalsProvider>
  );
}
```

### 3. Log Events

```tsx
import { useVitalsLogger } from '@/vitals';

function CreateCaseButton() {
  const vitals = useVitalsLogger();

  const handleClick = async () => {
    vitals.action('You clicked "Create New Case."');
    vitals.info('Building a zero-knowledge proof for the new case. This takes ~20 seconds...');
    
    try {
      const result = await createCase();
      vitals.success(`Case created successfully. Case ID: ${result.id}`);
    } catch (err) {
      vitals.error(
        'Failed to create case.',
        'The proof server could not generate a valid ZK proof. This usually means the proof server container is not running.',
        'Run: docker start midnight-proof-server'
      );
    }
  };

  return <button onClick={handleClick}>Create Case</button>;
}
```

### 4. Auto-Log Navigation

```tsx
import { VitalsNavigationLogger } from '@/vitals';

// Inside your router layout:
function Layout() {
  return (
    <>
      <VitalsNavigationLogger />
      <Sidebar />
      <main><Outlet /></main>
    </>
  );
}
```

---

## 🎨 Card Layouts

The stethoscope button includes a **settings dropdown** (small chevron) where users choose their preferred card position:

### Top (Default)
```
┌──────────────────────────────────────────────────┐
│  [○ Proof Server ● OK] [○ Network ● OK] [...]   │  ← Slim pills
│──────────────────────────────────────────────────│
│  11:03:47  ✓  Proof built successfully           │
│  11:03:24  ℹ  Building zero-knowledge proof...   │  ← Full-width CLI
│  11:03:22  ►  You clicked "Create New Case"      │
└──────────────────────────────────────────────────┘
```

### Left
```
┌────────────┬─────────────────────────────────────┐
│ ○ Proof    │  11:03:47  ✓  Proof built...        │
│   Server   │  11:03:24  ℹ  Building ZK proof...  │
│   ● OK     │  11:03:22  ►  Clicked "Create..."   │
│            │  11:03:18  ►  Navigated to /dash     │
│ ○ Network  │  11:02:55  ✓  Wallet connected       │
│   ● OK     │                                      │
│ ...        │                                      │
└────────────┴─────────────────────────────────────┘
```

### Right
```
┌─────────────────────────────────────┬────────────┐
│  11:03:47  ✓  Proof built...        │ ○ Proof    │
│  11:03:24  ℹ  Building ZK proof...  │   Server   │
│  11:03:22  ►  Clicked "Create..."   │   ● OK     │
│  11:03:18  ►  Navigated to /dash    │            │
│  11:02:55  ✓  Wallet connected      │ ○ Network  │
│                                     │   ● OK     │
│                                     │ ...        │
└─────────────────────────────────────┴────────────┘
```

---

## 📖 API Reference

### Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useVitals()` | `{ state, dispatch, refreshVital, runDiagnostic }` | Full access to vitals state and actions |
| `useVitalsLogger()` | `{ action, info, success, warning, error, log }` | Push log entries from any component |

### `useVitalsLogger()` Methods

```typescript
const vitals = useVitalsLogger();

vitals.action(message);                          // Blue — user did something
vitals.info(message);                            // Gray — informational context
vitals.success(message);                         // Green — something worked
vitals.warning(message);                         // Amber — watch out
vitals.error(message, detail?, suggestion?);     // Red — with explanation + fix
vitals.log(level, message, detail?, suggestion?); // Generic
```

### Components

| Component | Props | Description |
|-----------|-------|-------------|
| `VitalsProvider` | `mode: 'mock' \| 'live'`, `contracts?: ContractInfo[]` | Context provider — wraps your entire app |
| `VitalsPanel` | — | The main diagnostic panel (fixed, bottom) |
| `VitalsToggleButton` | — | Stethoscope button with settings dropdown |
| `VitalsMonitorBar` | — | The 4 vital indicators (adapts to card position) |
| `VitalsTimeWheel` | `label, status, detailLine, ...` | Individual countdown ring |
| `VitalsConsole` | — | Scrollable log area (newest on top) |
| `VitalsNavigationLogger` | — | Auto-logs route changes (render once) |

### Types

```typescript
type VitalStatus    = 'healthy' | 'warning' | 'critical' | 'unknown';
type VitalId        = 'proof-server' | 'network' | 'wallet' | 'contracts';
type LogLevel       = 'action' | 'info' | 'success' | 'warning' | 'error';
type CardPosition   = 'top' | 'left' | 'right';
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Midnight DApp                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 VitalsProvider                        │   │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │   │
│  │  │   State     │  │  Reducer    │  │  Provider    │  │   │
│  │  │  (Context)  │←─│  (Actions)  │  │  (Mock/Live) │  │   │
│  │  └──────┬─────┘  └─────────────┘  └──────┬───────┘  │   │
│  │         │                                 │          │   │
│  │         ▼                                 ▼          │   │
│  │  ┌─────────────────────────────────────────────┐     │   │
│  │  │              VitalsPanel                     │     │   │
│  │  │  ┌───────────────────────────────────────┐  │     │   │
│  │  │  │  VitalsMonitorBar                     │  │     │   │
│  │  │  │  [TimeWheel] [TimeWheel] [TimeWheel]  │  │     │   │
│  │  │  ├───────────────────────────────────────┤  │     │   │
│  │  │  │  VitalsConsole                        │  │     │   │
│  │  │  │  [LogEntry] [LogEntry] [LogEntry]     │  │     │   │
│  │  │  └───────────────────────────────────────┘  │     │   │
│  │  └─────────────────────────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Module Structure

```
src/vitals/
├── components/
│   ├── VitalsPanel.tsx              # Resizable container + layout switching
│   ├── VitalsMonitorBar.tsx         # Monitor strip (adapts horizontal/vertical)
│   ├── VitalsTimeWheel.tsx          # SVG countdown ring (inline pill or card)
│   ├── VitalsConsole.tsx            # Scrollable log (newest on top, filterable)
│   ├── VitalsToggleButton.tsx       # 🩺 button + settings dropdown
│   └── VitalsNavigationLogger.tsx   # Auto-logs route changes
├── context.tsx                      # React context, reducer, provider wrapper
├── mock-vitals-provider.ts          # Simulated health checks for demo mode
├── types.ts                         # All TypeScript interfaces
├── messages.ts                      # Natural-language message templates
└── index.ts                         # Barrel exports
```

### Two Operating Modes

| Mode | Data Source | Use Case |
|------|-----------|----------|
| **Mock** | Simulated responses with realistic timings | DemoLand, development, presentations |
| **Live** | Real HTTP pings, GraphQL queries, contract reads | Production DApps on Midnight preprod/mainnet |

Both modes implement the same `VitalsProviderInterface` — the UI is completely identical.

---

## 🗺️ Roadmap

### Completed ✅

| Version | Feature | Status |
|---------|---------|--------|
| v0.1.0 | Core panel, toggle button, drag-to-resize | ✅ Shipped |
| v0.2.0 | 4 vital monitors with animated time wheels | ✅ Shipped |
| v0.3.0 | Console log with filtering, newest-on-top, granular UI logging | ✅ Shipped |
| v0.3.5 | Card layout settings (top/left/right) + settings dropdown | ✅ Shipped |
| v0.3.7 | Interaction tracking — debounced hover + click logging via `useVitalsInteraction()` | ✅ Shipped |
| v0.3.8 | Floating panel mode — drag anywhere, resize from corner, dock/float toggle | ✅ Shipped |

### Coming Next

| Version | Feature | Priority |
|---------|---------|----------|
| v0.4.0 | Self-diagnostic report ("Run Diagnostics" full system scan) | High |
| v0.5.0 | Live provider — real HTTP health checks to proof server & indexer | High |
| v0.6.0 | Dependency verification (Docker, Node, Compact compiler) | Medium |
| v0.7.0 | npm package extraction (`@midnight-vitals/core`) | Medium |
| v1.0.0 | Stable public release with full documentation | High |

### Future Vision

| Feature | Description |
|---------|-------------|
| **Pro Dashboard** | Multi-contract monitoring, historical uptime, alerting (Slack/email/webhook) |
| **Enterprise Tier** | 24/7 monitoring, SLA guarantees, Datadog/Grafana/PagerDuty integration |
| **Transaction Tracing** | Visual ZK proof lifecycle: submit → prove → verify → confirm |
| **Cost Analytics** | Track tDUST/DUST spend per transaction, per contract, per user |
| **Plugin System** | Custom health check plugins for any external service |
| **Multi-Chain** | Extend beyond Midnight to other ZK chains (Aztec, Mina, Aleo) |
| **[HuddleVitals](https://github.com/bytewizard42i/huddlebridge_app_me_us/blob/main/docs/HUDDLEVITALS_DESIGN.md)** | First plugin test case for MidnightVitals. Extends the core 4 vitals with 6 HB-specific monitors: LiveKit SFU health, WebRTC quality per participant, anti-rug engine state, soulbound token minting, session memory writes, and predictive signal monitoring. Validates the plugin architecture. See `@huddlebridge/vitals` package. |

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full phased plan.

---

## 🧪 Currently Built With

- **React 18** — Hooks, Context, functional components
- **TypeScript 5** — Strict typing throughout
- **Tailwind CSS 4** — Utility-first styling, dark mode
- **Lucide React** — Clean SVG icon library
- **Vite** — Lightning-fast dev server and bundler
- **react-router-dom** — Navigation logging integration

---

## 🩺 Health Check Details

### Proof Server
```
Endpoint:   http://localhost:6300/version
Method:     GET
Healthy:    Status 200, response < 5000ms
Warning:    Status 200, response > 2000ms
Critical:   Timeout, connection refused, non-200 status
```

### Network Indexer
```
Endpoint:   {INDEXER_URL}/api/v1/status  (GraphQL)
Method:     POST (GraphQL introspection)
Healthy:    Responds with valid schema, block height advancing
Warning:    Responds but block height stale (>60s behind)
Critical:   Timeout, connection refused, invalid response
```

### Wallet
```
Method:     In-memory state check
Healthy:    Connected, keys available, balance > 0
Warning:    Connected but balance is 0
Critical:   Not connected, keys unavailable
```

### Smart Contracts
```
Method:     Indexer GraphQL query per contract address
Healthy:    All contracts found and readable
Warning:    Some contracts not responding
Critical:   No contracts reachable
```

---

## 📚 Full Documentation

| Document | Description |
|----------|------------|
| [Architecture](docs/ARCHITECTURE.md) | Deep-dive into system design, data flow, state management |
| [Roadmap](docs/ROADMAP.md) | Phased development plan from v0.1 to v2.0+ |
| [API Reference](docs/API_REFERENCE.md) | Complete API docs for every type, hook, and component |
| [Integration Guide](docs/INTEGRATION_GUIDE.md) | Step-by-step guide to add MidnightVitals to your DApp |
| [Design Specification](docs/DESIGN_SPEC.md) | UI/UX design system, color tokens, layout rules |
| [Business Plan](docs/BUSINESS_PLAN.md) | Market analysis, monetization strategy, competitive landscape |
| [Contributing](docs/CONTRIBUTING.md) | How to contribute, code standards, PR process |

---

## 🤝 Contributing

We welcome contributions! See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

```bash
git clone https://github.com/bytewizard42i/MidnightVitals.git
cd MidnightVitals
# Follow the integration guide to set up a dev environment
```

---

## 📄 License

MIT — Free to use, modify, and distribute.

---

<p align="center">
  <sub>
    Built with ❤️ by <a href="https://github.com/bytewizard42i">John (bytewizard42i)</a> & Penny 🎀
    <br/>
    Part of the <strong><a href="https://enterprisezk.com">EnterpriseZK Labs</a></strong> portfolio — Cross-cutting diagnostics for all <a href="https://github.com/bytewizard42i/didz-dapp-system">DIDz ecosystem</a> products on Midnight.
  </sub>
</p>
