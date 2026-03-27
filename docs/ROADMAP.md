# 🗺️ MidnightVitals — Development Roadmap

**Version**: 2.0  
**Last Updated**: Feb 22, 2026  
**Status**: Phase 1 Complete, Phase 2 In Progress

---

## Table of Contents

- [Vision](#vision)
- [Phase 1: Mock Mode Foundation](#phase-1-mock-mode-foundation-demoland) ✅
- [Phase 2: Live Mode & npm Package](#phase-2-live-mode--npm-package)
- [Phase 3: Pro Dashboard](#phase-3-pro-dashboard)
- [Phase 4: Enterprise & Multi-Chain](#phase-4-enterprise--multi-chain)
- [Long-Term Vision](#long-term-vision)
- [Version History](#version-history)

---

## Vision

MidnightVitals evolves through four phases:

```
Phase 1          Phase 2           Phase 3            Phase 4
MOCK MODE   →   LIVE MODE    →   PRO DASHBOARD  →   ENTERPRISE
(demoLand)      (npm package)     (SaaS)             (multi-chain)
                                                      
UI/UX ✅        Real checks       Analytics          Datadog/Grafana
Console ✅      npm publish       Alerting           Plugin system
Monitors ✅     Docker checks     Uptime history     Custom chains
Settings ✅     Env validation    Team features      White-label
```

---

## Phase 1: Mock Mode Foundation (DemoLand) ✅

> **Goal**: Nail the UI/UX with simulated data before touching real infrastructure.  
> **Status**: Complete  
> **Timeline**: Feb 2026

### v0.1.0 — Core Panel ✅

- [x] Stethoscope toggle button (🩺) in app header
- [x] Slide-up panel anchored to bottom of viewport
- [x] Drag-to-resize handle (200px–70% of viewport)
- [x] Panel open/closed state in React context
- [x] Panel height persists in localStorage
- [x] Clean dark theme matching Midnight aesthetic

### v0.2.0 — Monitor Bar ✅

- [x] Proof Server vital with animated SVG time wheel
- [x] Network Indexer vital with animated SVG time wheel
- [x] Wallet Connection vital with animated SVG time wheel
- [x] Smart Contracts vital with animated SVG time wheel
- [x] Circular arc depletes clockwise over check interval
- [x] Manual refresh button per vital (with spin animation)
- [x] Color-coded status: green (healthy), amber (warning), red (critical), gray (unknown)
- [x] Critical status triggers pulse animation
- [x] Mock provider returns realistic simulated states

### v0.3.0 — Console Log ✅

- [x] Scrollable log area with newest entries on top
- [x] Timestamped entries with natural-language messages
- [x] Five log levels: action (blue), info (gray), success (green), warning (amber), error (red)
- [x] Error entries include "What this means" detail paragraph
- [x] Error entries include "What to do" suggestion with lightbulb icon
- [x] `useVitalsLogger()` hook for any component to push entries
- [x] Filter toolbar: All / Action / Info / Success / Warning / Error
- [x] Copy all logs to clipboard button
- [x] Clear log button
- [x] Auto-scroll to top when new entries arrive
- [x] "Jump to latest" button when user scrolls away
- [x] Log cap at 500 entries (FIFO pruning)

### v0.3.1 — Granular UI Logging ✅

- [x] `VitalsNavigationLogger` component auto-logs every route change
- [x] Case-view tab switch logging
- [x] Sidebar navigation click logging
- [x] Notification click logging
- [x] Jurisdiction toggle logging
- [x] Dashboard case row click logging
- [x] Search page: query, filters, results, clicks
- [x] Compliance page: data loading, attestation counts
- [x] Settings page: theme changes, notification toggles
- [x] Case-contacts page: contact loading, star rating changes

### v0.3.5 — Card Layout Settings ✅

- [x] Settings dropdown on stethoscope button (chevron menu)
- [x] Three card position options: Top, Left, Right
- [x] **Top**: Slim horizontal pill strip above CLI (default, most compact)
- [x] **Left**: 220px vertical sidebar on the left, CLI fills right
- [x] **Right**: 220px vertical sidebar on the right, CLI fills left
- [x] Cards adapt rendering: inline pills (top) vs compact stacked cards (sidebar)
- [x] Position preference persists in localStorage
- [x] Outside-click closes settings menu
- [x] Active option highlighted with emerald indicator

### v0.3.7 — Interaction Tracking ✅

- [x] `useVitalsInteraction()` hook for hover and click logging
- [x] Debounced hover events (3s cooldown per element label)
- [x] Immediate click event logging
- [x] Three API styles: `track(label)` spread, `track.hover(label)`, `track.click(label)`
- [x] Wired into all DemoLand pages: layout, dashboard, login, search, compliance, settings, case-contacts

### v0.3.8 — Floating Panel Mode ✅

- [x] Two panel modes: **Docked** (bottom-fixed, classic) and **Floating** (free-positioned window)
- [x] Drag-to-move via title bar grip in floating mode
- [x] Resize from bottom-right corner in floating mode (width + height)
- [x] Float/Dock toggle button in panel header with icon labels
- [x] Panel mode selectable from stethoscope settings dropdown (Panel Mode section)
- [x] Position, size, and mode preference all persist in localStorage across sessions
- [x] Clamped to viewport edges — panel can't be dragged off-screen
- [x] Floating panel uses rounded border, elevated shadow, and semi-transparent backdrop
- [x] New state: `panelMode`, `panelPosition`, `panelWidth` in `VitalsState`
- [x] New actions: `SET_PANEL_MODE`, `SET_PANEL_POSITION`, `SET_PANEL_WIDTH`
- [x] `PanelMode` type exported from barrel file

---

## Phase 2: Live Mode & npm Package

> **Goal**: Connect to real Midnight infrastructure and publish as a standalone package.  
> **Status**: In Progress  
> **Timeline**: Q2 2026

### v0.4.0 — Self-Diagnostic Report

- [ ] "Run Diagnostics" triggers sequential check of all vitals
- [ ] Full health report with pass/fail per component
- [ ] Natural-language summary: "10 out of 12 vitals are healthy."
- [ ] Dependency checks: Docker version, Node.js version, Compact compiler version
- [ ] Environment checks: `.env` variables present, contract addresses set
- [ ] Report exportable as JSON or Markdown
- [ ] Progress indicator during diagnostic scan

### v0.5.0 — Live Proof Server Integration

- [ ] `LiveVitalsProvider` implementing `VitalsProviderInterface`
- [ ] Real HTTP GET to `http://localhost:6300/version`
- [ ] Latency measurement and threshold classification
- [ ] Connection timeout handling (5 second default)
- [ ] CORS-safe error handling
- [ ] Graceful degradation when proof server is unreachable
- [ ] Docker container status check (if accessible)

### v0.6.0 — Live Network & Wallet Integration

- [ ] GraphQL introspection query to indexer endpoint
- [ ] Block height monitoring (detect stale indexer)
- [ ] Wallet connection state from `WalletProvider` context
- [ ] Balance display in tDUST (testnet) / DUST (mainnet)
- [ ] Key availability check
- [ ] Contract read-call health per deployed contract address

### v0.7.0 — Dependency Verification

- [ ] Docker version check (shell exec or HTTP)
- [ ] Node.js version check with semver validation
- [ ] Compact compiler version check (`compact --version`)
- [ ] npm package version audit (outdated dependencies)
- [ ] Environment variable validator (required `.env` keys)
- [ ] System requirements summary card

### v0.8.0 — npm Package Extraction

- [ ] Extract `src/vitals/` to standalone package structure
- [ ] Package name: `@midnight-vitals/core`
- [ ] Peer dependencies: react, react-dom, tailwindcss, lucide-react
- [ ] Optional peer: react-router-dom (for navigation logger)
- [ ] Tree-shakeable ESM + CJS builds
- [ ] TypeScript declarations included
- [ ] Comprehensive JSDoc on all exports
- [ ] Unit tests for reducer, providers, hooks
- [ ] Integration tests for component rendering
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] npm publish automation

### v0.9.0 — Configuration API

- [ ] `VitalsConfig` object for customizing behavior
- [ ] Custom check intervals per vital
- [ ] Custom endpoint URLs for proof server, indexer
- [ ] Custom contract list
- [ ] Theme overrides (colors, fonts, sizes)
- [ ] Disable specific features (monitors, console, settings)
- [ ] `onLogEntry` callback for external integrations
- [ ] `onStatusChange` callback for alerting

### v1.0.0 — Stable Public Release

- [ ] Complete API documentation
- [ ] Migration guide from embedded module to npm package
- [ ] Example integrations with Midnight's official examples (counter, bboard)
- [ ] Comprehensive test suite (>90% coverage)
- [ ] Performance benchmarks documented
- [ ] Security audit of live provider (no secrets in logs)
- [ ] Blog post / announcement for Midnight community
- [ ] Listed in Midnight ecosystem tools directory

---

## Phase 3: Pro Dashboard

> **Goal**: SaaS monitoring dashboard for teams building production Midnight DApps.  
> **Status**: Planned  
> **Timeline**: Q4 2026 — Q1 2027

### v1.5.0 — Historical Data & Analytics

- [ ] Persistent storage of health check history (IndexedDB or cloud)
- [ ] Uptime percentage per vital (24h, 7d, 30d)
- [ ] Response time charts (sparklines)
- [ ] Transaction cost tracking (tDUST/DUST spend per action)
- [ ] ZK proof generation time benchmarks (average, p50, p95, p99)
- [ ] Dashboard view with at-a-glance health overview

### v1.6.0 — Alerting System

- [ ] Configurable alert rules (e.g., "proof server down for > 60s")
- [ ] Alert channels: browser notification, email, Slack webhook
- [ ] Alert severity levels: info, warning, critical
- [ ] Alert cooldown to prevent spam
- [ ] Alert history and acknowledgment

### v1.7.0 — Transaction Tracing

- [ ] Visual ZK proof lifecycle: submit → queued → proving → verified → confirmed
- [ ] Proof generation progress bar with estimated time
- [ ] Transaction timeline view (Gantt-style)
- [ ] Failed transaction debugging: which step failed and why
- [ ] Gas/fee estimation before submission

### v1.8.0 — Team Features

- [ ] Shared diagnostic sessions (URL-shareable snapshots)
- [ ] Team activity feed (who did what)
- [ ] Annotated log entries (add comments to specific events)
- [ ] Export diagnostic reports (PDF, JSON)
- [ ] Role-based access (admin, developer, viewer)

### v2.0.0 — Pro Dashboard Launch

- [ ] Hosted SaaS platform
- [ ] User authentication and team management
- [ ] Project-based organization (one dashboard per DApp)
- [ ] Free tier: 1 project, 24h history, browser alerts only
- [ ] Pro tier: unlimited projects, 30d history, all alert channels
- [ ] Billing integration (Stripe)
- [ ] Public status pages (uptime.yourdapp.com)

---

## Phase 4: Enterprise & Multi-Chain

> **Goal**: Production-grade monitoring for enterprise Midnight deployments and expansion beyond Midnight.  
> **Status**: Vision  
> **Timeline**: 2027+

### v2.5.0 — Enterprise Monitoring

- [ ] 24/7 monitoring with SLA guarantees
- [ ] Integration with Datadog, Grafana, PagerDuty, New Relic
- [ ] Custom alerting rules with escalation policies
- [ ] Compliance reporting (audit trail of all health checks)
- [ ] White-label option (brand as your own)
- [ ] Dedicated support channel
- [ ] On-premise deployment option

### v3.0.0 — Plugin System

- [ ] Plugin API for custom health checks
- [ ] Plugin registry (community-contributed)
- [ ] Built-in plugins: Redis, PostgreSQL, S3, IPFS
- [ ] Plugin marketplace (free and paid)
- [ ] Plugin SDK with TypeScript templates

### v3.5.0 — Multi-Chain Support

- [ ] Abstract chain interface (not just Midnight)
- [ ] Aztec Network integration
- [ ] Mina Protocol integration
- [ ] Aleo integration
- [ ] Generic EVM chain support
- [ ] Cross-chain health dashboard
- [ ] Chain comparison analytics

---

## Long-Term Vision

```
2026                    2027                     2028+
├── Mock Mode ✅        ├── Pro Dashboard        ├── Enterprise
├── Live Mode           ├── Alerting             ├── Multi-Chain
├── npm Package         ├── Tx Tracing           ├── Plugin Marketplace
├── v1.0 Release        ├── Team Features        ├── AI Diagnostics
└── Community Adoption  └── v2.0 SaaS Launch     └── Industry Standard
```

### AI-Powered Diagnostics (Research)

- Natural-language error diagnosis powered by LLM
- "Ask MidnightVitals" — conversational debugging
- Automated fix suggestions based on error patterns
- Predictive health alerts (detect degradation before failure)
- Smart log summarization ("Here's what happened in the last hour")

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| v0.1.0 | Feb 22, 2026 | Core panel, toggle button, drag-to-resize |
| v0.2.0 | Feb 22, 2026 | 4 vital monitors with animated SVG time wheels |
| v0.3.0 | Feb 22, 2026 | Console log with filtering, newest-on-top |
| v0.3.1 | Feb 22, 2026 | Granular UI logging across all pages |
| v0.3.5 | Feb 22, 2026 | Card layout settings (top/left/right) |

---

## Contributing to the Roadmap

Have ideas? Open an issue on [GitHub](https://github.com/bytewizard42i/MidnightVitals/issues) with the `roadmap` label, or join the discussion in the Midnight developer community.

---

<p align="center">
  <sub>
    Roadmap maintained by John (bytewizard42i) & Penny 🎀<br/>
    Part of the <strong>MidnightVitals</strong> project — diagnostics for the Midnight blockchain ecosystem.
  </sub>
</p>
