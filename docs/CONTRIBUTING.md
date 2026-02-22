# 🤝 MidnightVitals — Contributing Guide

**Version**: 1.0  
**Last Updated**: Feb 22, 2026

---

## Welcome!

Thank you for your interest in contributing to MidnightVitals! Whether you're fixing a bug, adding a feature, improving documentation, or just asking a question — you're helping make Midnight development better for everyone.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Architecture Overview](#architecture-overview)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/bytewizard42i/MidnightVitals.git
cd MidnightVitals
```

### 2. Read the Docs

Before writing code, familiarize yourself with:

- [README.md](../README.md) — What MidnightVitals does and how to use it
- [ARCHITECTURE.md](ARCHITECTURE.md) — How the system is designed
- [API_REFERENCE.md](API_REFERENCE.md) — Complete API documentation
- [DESIGN_SPEC.md](DESIGN_SPEC.md) — UI/UX design system and color tokens
- [ROADMAP.md](ROADMAP.md) — What's planned and what's shipped

### 3. Pick Something to Work On

- Check [open issues](https://github.com/bytewizard42i/MidnightVitals/issues) for `good first issue` or `help wanted` labels
- Review the [ROADMAP.md](ROADMAP.md) for upcoming features
- Fix a bug you've encountered
- Improve documentation

---

## Development Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Runtime |
| npm / yarn / pnpm | Latest | Package manager |
| TypeScript | 5.0+ | Type checking |
| React | 18+ | UI framework |
| Tailwind CSS | 3.0+ or 4.0+ | Styling |

### Running the Development Environment

MidnightVitals is currently embedded in the AutoDiscovery.legal frontend. To develop against it:

```bash
# Clone the host application (AutoDiscovery.legal)
cd frontend-vite-react
npm install
npm run dev
# Open http://localhost:5173
# Click the 🩺 stethoscope icon to open the vitals panel
```

### File Structure

```
src/vitals/
├── components/           # React UI components
├── context.tsx           # State management (Context + Reducer)
├── types.ts              # TypeScript interfaces
├── messages.ts           # Natural-language message templates
├── mock-vitals-provider.ts  # Simulated health checks
└── index.ts              # Barrel exports
```

---

## Code Standards

### General Rules

1. **TypeScript only** — No `.js` files. All code must be fully typed.
2. **Long, descriptive names** — `handleProofServerHealthCheckRefresh()`, not `handleRefresh()`. No cryptic abbreviations.
3. **Small, focused functions** — Each function does one thing. Use early returns. Avoid deep nesting.
4. **Extensive comments** — Explain WHAT and WHY, not just how. Every file has a header comment block.
5. **No hardcoded secrets** — Use `.env` files for configuration.
6. **Sanitize all inputs** — Validate any external data before using it.
7. **Fail loudly** — Clear error messages with next steps. Never swallow errors silently.

### File Header Convention

Every source file starts with a descriptive header:

```typescript
// =============================================================================
// MidnightVitals — [Component/Module Name]
// =============================================================================
// [1-3 line description of what this file does]
// =============================================================================
```

### Component Convention

```tsx
// Props interface defined above the component
interface MyComponentProps {
  label: string;                      // Inline comment explaining the prop
  onAction: () => void;               // What this callback does
}

// Component with destructured props
export function MyComponent({
  label,
  onAction,
}: MyComponentProps) {
  // Hook calls at the top
  const { state, dispatch } = useVitals();
  
  // Derived state
  const isActive = state.isOpen && label !== '';
  
  // Event handlers
  const handleClick = () => {
    onAction();
  };
  
  // Render
  return (
    <div className="...">
      {/* Descriptive JSX comment */}
      <span>{label}</span>
    </div>
  );
}
```

### Styling Convention

- **Tailwind CSS only** — No inline styles except for dynamic values (e.g., `style={{ height: px }}`)
- **Dark mode** — All components are dark-mode only (zinc-950 backgrounds)
- **Consistent sizes** — Use the text sizes defined in [DESIGN_SPEC.md](DESIGN_SPEC.md)
- **Status colors** — Use the color tokens from `STATUS_COLORS` in `VitalsTimeWheel.tsx`

### Import Convention

```typescript
// React imports first
import { useState, useEffect, useCallback } from 'react';

// External library imports second
import { Activity, Stethoscope } from 'lucide-react';

// Internal imports third (relative paths)
import { useVitals } from '../context';
import type { VitalStatus, LogLevel } from '../types';
```

---

## Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/my-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` — New functionality
- `fix/` — Bug fixes
- `docs/` — Documentation changes
- `refactor/` — Code restructuring (no behavior change)
- `vitals/` — Layout or design experiments (may be preserved as alternatives)

### 2. Make Your Changes

- Keep commits focused and atomic
- Write clear commit messages:
  ```
  feat: add transaction tracing timeline component
  
  - New VitalsTransactionTrace component
  - Visual ZK proof lifecycle: submit → prove → verify → confirm
  - Integrates with VitalsConsole for log entries
  - Tested with mock provider data
  ```

### 3. Test Your Changes

- Verify TypeScript compiles: `npx tsc --noEmit`
- Verify the dev server runs: `npm run dev`
- Manually test all three card layouts (top/left/right)
- Check for console errors in the browser
- Test with the panel at minimum and maximum heights

### 4. Submit PR

- Open a pull request against `main`
- Fill in the PR template (description, screenshots, testing done)
- Link any related issues
- Request review from maintainers

### 5. Review Cycle

- Address review feedback promptly
- Force-push is fine on feature branches
- Squash-merge is preferred for clean history

---

## Issue Guidelines

### Bug Reports

Include:
1. **Steps to reproduce** — Exact clicks/actions to trigger the bug
2. **Expected behavior** — What should happen
3. **Actual behavior** — What actually happens
4. **Screenshots** — If it's a visual issue
5. **Environment** — Browser, OS, React version, Tailwind version

### Feature Requests

Include:
1. **Use case** — Why you need this feature
2. **Proposed solution** — How you'd like it to work
3. **Alternatives considered** — Other approaches you thought about
4. **Mockup** — ASCII art or screenshot of desired UI (if applicable)

### Labels

| Label | Meaning |
|-------|---------|
| `good first issue` | Great for newcomers |
| `help wanted` | We'd love a contribution here |
| `bug` | Something is broken |
| `feature` | New functionality |
| `docs` | Documentation improvement |
| `roadmap` | Related to planned roadmap items |
| `design` | UI/UX design change |
| `performance` | Performance optimization |

---

## Architecture Overview

Before contributing, understand these key concepts:

### Provider Pattern

MidnightVitals uses a **provider pattern** to separate data fetching from UI rendering. The `VitalsProviderInterface` defines what health checks look like, and implementations (Mock, Live) provide the actual data.

**Rule**: UI components never call HTTP endpoints directly. They only read from `VitalsState` via `useVitals()`.

### State Flow

```
User Action → useVitalsLogger() → dispatch(ADD_LOG_ENTRY) → VitalsConsole renders
Timer Tick → Provider.check*() → dispatch(UPDATE_MONITOR) → VitalsTimeWheel renders
User Setting → dispatch(SET_CARD_POSITION) → localStorage + VitalsPanel re-layouts
```

### Adding a New Vital Monitor

1. Add the new `VitalId` to `types.ts`
2. Add a default monitor to `DEFAULT_MONITORS` in `context.tsx`
3. Add a check method to `VitalsProviderInterface`
4. Implement it in `MockVitalsProvider`
5. Add natural-language messages to `messages.ts`
6. The UI auto-renders it — no component changes needed

### Adding a New Log Level

1. Add the level to `LogLevel` type in `types.ts`
2. Add styling to `LEVEL_STYLES` in `VitalsConsole.tsx`
3. Add a convenience method to `useVitalsLogger()` in `context.tsx`
4. Add a filter button in the console toolbar

---

## Testing

### Current Testing (Manual)

While we don't yet have automated tests, please manually verify:

- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] Panel opens/closes via toggle button
- [ ] All 4 time wheels update on their intervals
- [ ] Manual refresh works on each vital
- [ ] Console log shows entries from user actions
- [ ] Log filtering works (all levels)
- [ ] Copy and clear buttons work
- [ ] Card layout switching works (all 3 positions)
- [ ] Panel resize works (drag handle)
- [ ] Settings dropdown opens/closes, outside-click dismisses
- [ ] Navigation logger captures route changes

### Planned Testing (v0.8.0+)

| Type | Framework | Coverage Target |
|------|-----------|----------------|
| Unit tests | Vitest | Reducer, providers, hooks |
| Component tests | Testing Library | All UI components |
| Integration tests | Playwright | Full user workflows |
| Visual regression | Chromatic / Percy | Screenshot comparison |

### Test Rules

1. **Never delete or weaken existing tests** — only add or strengthen
2. **Every new feature gets a test** — at minimum, a manual test checklist
3. **Every bug fix gets a regression test** — prevent it from coming back

---

## Documentation

### When to Update Docs

- **New feature?** → Update README.md, API_REFERENCE.md, relevant doc
- **New component?** → Add to ARCHITECTURE.md module structure
- **New type?** → Add to API_REFERENCE.md types section
- **Breaking change?** → Add migration note to ROADMAP.md
- **UI change?** → Update DESIGN_SPEC.md with new specs

### Documentation Style

- **Write for beginners** — assume the reader is new to Midnight
- **Show, don't tell** — code examples > paragraphs
- **Keep it current** — outdated docs are worse than no docs
- **Use tables** — for structured information (props, types, colors)
- **Use ASCII art** — for layout diagrams (renders in any Markdown viewer)

---

## Code of Conduct

Be kind. Be constructive. We're all building something cool together.

- Treat every contributor with respect
- Give constructive feedback, not criticism
- Assume good intent
- Celebrate contributions of all sizes

---

## Questions?

- Open a [GitHub issue](https://github.com/bytewizard42i/MidnightVitals/issues)
- Join the Midnight Discord community
- Tag `@bytewizard42i` on GitHub

---

<p align="center">
  <sub>
    Contributing Guide maintained by John (SpyCrypto) & Penny 🎀<br/>
    Part of the <strong>MidnightVitals</strong> project.
  </sub>
</p>
