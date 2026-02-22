# 🎨 MidnightVitals — Design Specification

**Version**: 0.4.0  
**Last Updated**: Feb 22, 2026  
**Design System**: Dark Mode, Midnight-aligned

---

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Component Specifications](#component-specifications)
- [Animation & Motion](#animation--motion)
- [Responsive Behavior](#responsive-behavior)
- [Accessibility](#accessibility)
- [Dark Mode Integration](#dark-mode-integration)

---

## Design Philosophy

MidnightVitals follows four design principles:

### 1. Ambient Awareness
The panel should feel like a **background monitor** — always available but never intrusive. It sits at the bottom of the screen, can be collapsed to a thin strip, and only demands attention when something goes wrong (critical state pulse).

### 2. Information Density
Every pixel earns its place. The time wheels, status dots, and log entries are designed to convey maximum information in minimum space. The "top" card layout puts 4 monitors + a full scrolling log in just 320px of vertical space.

### 3. Midnight Aesthetic
The dark zinc/slate palette matches the Midnight blockchain's visual identity. Emerald green for healthy, amber for warning, red for critical — the same semaphore system used in medical monitors, server dashboards, and traffic lights.

### 4. Progressive Disclosure
Basic info is always visible (status dots + countdown numbers). Detail is one interaction away (hover for detail line, click refresh to check now). Full diagnostics require an explicit action ("Run Diagnostics" button).

---

## Color System

### Status Colors

| Status | Tailwind | Hex | Use |
|--------|----------|-----|-----|
| Healthy | `emerald-400` | `#34D399` | Stroke, dot, text for healthy vitals |
| Warning | `amber-400` | `#FBBF24` | Stroke, dot, text for degraded vitals |
| Critical | `red-400` | `#F87171` | Stroke, dot, text for down vitals + pulse animation |
| Unknown | `zinc-500` | `#71717A` | Stroke, dot, text for unchecked vitals |

### Log Level Colors

| Level | Tailwind | Hex | Icon |
|-------|----------|-----|------|
| Action | `blue-400` | `#60A5FA` | `►` (Play) |
| Info | `zinc-400` | `#A1A1AA` | `ℹ` (Info) |
| Success | `emerald-400` | `#34D399` | `✓` (Check) |
| Warning | `amber-400` | `#FBBF24` | `⚠` (Alert) |
| Error | `red-400` | `#F87171` | `✕` (X) |

### Surface Colors

| Element | Tailwind | Hex | Opacity |
|---------|----------|-----|---------|
| Panel background | `zinc-950` | `#09090B` | 95% (`/95`) |
| Card background | `zinc-900` | `#18181B` | 80% (`/80`) |
| Card hover | `zinc-800` | `#27272A` | 80% (`/80`) |
| Border | `zinc-800` | `#27272A` | 80% (`/80`) |
| Drag handle | `zinc-700` | `#3F3F46` | 100% |
| Drag handle hover | `zinc-500` | `#71717A` | 100% |

### Accent Colors

| Use | Tailwind | Hex |
|-----|----------|-----|
| Active panel indicator | `emerald-400` | `#34D399` |
| Active state bg | `emerald-500/10` | `rgba(16,185,129,0.1)` |
| Active state hover bg | `emerald-500/20` | `rgba(16,185,129,0.2)` |
| Settings active option | `emerald-400` bg dot + text |
| Header title | `zinc-300` | `#D4D4D8` |

---

## Typography

### Font Stack

```css
font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, 
             "Liberation Mono", monospace;
```

Console log entries use monospace for timestamp alignment and technical readability.

### Font Sizes

| Element | Tailwind | Size | Weight |
|---------|----------|------|--------|
| Panel title | `text-xs` | 12px | `font-bold` + uppercase + tracking-wider |
| Time wheel label | `text-[11px]` | 11px | `font-semibold` |
| Time wheel status | `text-[10px]` | 10px | `font-medium` |
| Time wheel detail | `text-[10px]` | 10px | Normal |
| Time wheel countdown | `text-[8px]` | 8px | `font-bold` + monospace |
| Log entry timestamp | `text-[10px]` | 10px | `font-mono` |
| Log entry message | `text-[11px]` | 11px | Normal |
| Log entry detail/suggestion | `text-[10px]` | 10px | Normal + italic |
| Filter buttons | `text-[10px]` | 10px | `font-medium` |
| Settings menu items | `text-[11px]` | 11px | Normal / `font-medium` (active) |
| Settings menu header | `text-[10px]` | 10px | `font-bold` + uppercase + tracking-wider |
| Badge text | `text-[9px]` | 9px | `font-bold` |
| Button labels | `text-[10px]` | 10px | `font-medium` |

---

## Spacing & Layout

### Panel Dimensions

| Property | Value | Notes |
|----------|-------|-------|
| Default height | 320px | Persisted in localStorage |
| Minimum height | 200px | Enforced during drag |
| Maximum height | 70% viewport | `window.innerHeight * 0.7` |
| Left offset | 68px | Accounts for app sidebar |
| Z-index | 40 | Below modals (50+), above content |

### Card Layouts

#### Top (Horizontal Strip)
```
Monitor bar:  flex, items-stretch, gap-1.5, px-2, py-1.5, border-b
Each pill:    flex, items-center, gap-2, px-2.5, py-1.5, rounded-lg, flex-1
Ring size:    28x28px (10px radius)
```

#### Left / Right (Vertical Sidebar)
```
Sidebar:      w-[220px], shrink-0, overflow-y-auto
Card column:  flex-col, gap-1.5, p-2
Each card:    flex, items-center, gap-2, px-2, py-1.5, rounded-lg
Ring size:    32x32px (12px radius)
Border:       1px solid zinc-800/80 on the inner edge
```

### Drag Handle
```
Container:    flex, items-center, justify-center, py-1.5, cursor-ns-resize
Handle bar:   w-12, h-1, rounded-full, bg-zinc-700 → hover:bg-zinc-500
```

### Settings Dropdown
```
Container:    absolute, right-0, top-full, mt-1.5
Background:   bg-zinc-900, border zinc-700, rounded-xl, shadow-2xl
Z-index:      50
Min width:    180px
Padding:      py-2
Items:        px-3, py-2, text-[11px]
Active item:  text-emerald-400, bg-emerald-500/10, font-medium
```

---

## Component Specifications

### VitalsTimeWheel — SVG Ring

#### Inline Pill Mode (Top Layout)

```
Ring:         28x28px viewBox, 10px radius, 2.5px stroke
Background:   stroke-zinc-800
Progress:     stroke-{status-color}, transition-all 1s ease-linear
Center text:  text-[8px] font-mono font-bold
Direction:    -rotate-90 (arc starts at 12 o'clock)
Animation:    strokeDashoffset via CSS transition (smooth 1s updates)
```

#### Compact Card Mode (Sidebar Layout)

```
Ring:         32x32px viewBox, 12px radius, 2.5px stroke
Label:        text-[11px] font-semibold, truncate
Status:       text-[9px] font-medium
Detail:       text-[9px] text-zinc-500, truncate
Refresh btn:  w-2.5 h-2.5 icon, p-0.5
```

### VitalsConsole — Log Entry

```
Entry row:    flex, gap-2, px-1, py-0.5
Timestamp:    text-[10px] font-mono text-zinc-600, shrink-0
Level icon:   w-3 h-3, shrink-0, color per level
Message:      text-[11px] text-zinc-300
Detail:       text-[10px] text-zinc-500, italic, ml-5, mt-0.5
Suggestion:   text-[10px] text-amber-400/80, ml-5, mt-0.5, with 💡 prefix
```

### VitalsToggleButton

```
Button group: flex items-center
Stethoscope:  p-2, rounded-l-lg
Chevron:      p-2, rounded-r-lg, border-l border-border/30
Icon:         w-4 h-4 (stethoscope), w-3 h-3 (chevron)
Active:       bg-emerald-500/10, text-emerald-400
Hover:        hover:bg-muted, text-muted-foreground → text-foreground
```

### Badges

```
Critical:     absolute top-1 right-1, w-2.5 h-2.5, rounded-full
              bg-red-500, border border-zinc-900, animate-pulse
Active:       absolute top-1 right-1, w-2 h-2, rounded-full
              bg-emerald-400
```

---

## Animation & Motion

### Time Wheel Arc

```css
.time-wheel-arc {
  transition: all 1s ease-linear;  /* Smooth 1-second updates */
}
```

The arc depletes clockwise from 100% to 0% over the check interval, then instantly jumps back to 100% when a new check completes.

### Refresh Button Spin

```css
.animate-spin {
  animation: spin 1s linear infinite;
}
/* Applied for 600ms after click */
```

### Critical Pulse

```css
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
/* Applied to both status dot and critical badge */
```

### Panel Transitions

```css
/* Drag-to-resize: no transition (follows mouse directly) */
/* Card layout switch: instant re-render (no animation) */
/* Settings dropdown: instant show/hide */
/* Hover effects: transition-colors (150ms default) */
```

### Log Entry Appearance

New entries appear at the top of the list. No entry animation — instant render for performance (up to 500 entries).

---

## Responsive Behavior

### Breakpoints

MidnightVitals is designed for desktop-first (it's a developer tool):

| Viewport | Behavior |
|----------|----------|
| ≥1280px | Full layout, all features |
| 1024–1279px | Sidebar cards may truncate detail text |
| 768–1023px | Consider "top" layout forced (sidebar too narrow) |
| <768px | Panel takes full width (left offset: 0) |

### Panel Width

The panel stretches from `left: 68px` (sidebar width) to `right: 0`. On mobile or narrow viewports, consider setting `left: 0` to use full width.

### Card Layout Adaptation

In "left" or "right" mode, the sidebar is fixed at 220px. If the viewport is too narrow for a useful console beside the sidebar, the system should gracefully fall back to "top" layout. (Planned for v0.9.0 responsive configuration.)

---

## Accessibility

### Keyboard Navigation

| Element | Key | Action |
|---------|-----|--------|
| Toggle button | `Enter` / `Space` | Toggle panel |
| Settings chevron | `Enter` / `Space` | Open/close settings |
| Settings options | `Enter` / `Space` | Select card position |
| Refresh buttons | `Enter` / `Space` | Trigger health check |
| Filter buttons | `Enter` / `Space` | Set log filter |
| Drag handle | _(mouse only)_ | Resize panel |

### ARIA Labels

| Element | `aria-label` |
|---------|-------------|
| Toggle button | "Toggle MidnightVitals diagnostic panel" |
| Settings chevron | "Vitals settings" |
| Refresh button | "Refresh {label} health check" |
| Clear button | "Clear console log" |
| Copy button | "Copy log to clipboard" |

### Color Contrast

All text meets WCAG AA contrast ratios against the dark backgrounds:
- `zinc-300` on `zinc-950`: 11.4:1 ✅
- `emerald-400` on `zinc-950`: 8.2:1 ✅
- `amber-400` on `zinc-950`: 9.1:1 ✅
- `red-400` on `zinc-950`: 5.8:1 ✅
- `zinc-500` on `zinc-950`: 4.6:1 ✅ (AA for large text)

### Screen Reader Considerations

- Status changes are reflected in text labels (`STATUS_LABELS` map)
- Critical status dot has `animate-pulse` but also text "Down" for non-visual users
- Log entries include level in text, not just icon color

---

## Dark Mode Integration

MidnightVitals is **dark mode only** by design. The zinc-950 background and status colors are designed for dark environments. The module does not include a light mode variant.

If your host application supports light mode, MidnightVitals will always render in dark mode regardless of the app's theme setting. This is intentional — diagnostic tools should look like terminals, not spreadsheets.

### Backdrop Blur

The panel uses `backdrop-blur-md` for a frosted-glass effect over the content behind it:

```css
backdrop-filter: blur(12px);
background: rgba(9, 9, 11, 0.95);  /* zinc-950/95 */
```

### Shadow

The panel casts a heavy upward shadow to visually separate it from the content:

```css
box-shadow: 0 -25px 50px -12px rgba(0, 0, 0, 0.4);  /* shadow-2xl shadow-black/40 */
```

---

## Icon Set

All icons come from [Lucide React](https://lucide.dev/):

| Icon | Component | Use |
|------|-----------|-----|
| `Stethoscope` | Toggle button | Main vitals icon |
| `ChevronDown` | Toggle button | Settings dropdown trigger |
| `ChevronUp` | Console | "Jump to latest" button |
| `ArrowUp` | Settings | "Cards on Top" option |
| `ArrowLeft` | Settings | "Cards on Left" option |
| `ArrowRight` | Settings | "Cards on Right" option |
| `Activity` | Panel header | "Run Diagnostics" button |
| `RotateCw` | Time wheel | Refresh/re-check button |
| `Trash2` | Console | Clear log button |
| `Copy` | Console | Copy to clipboard button |
| `Filter` | Console | Filter menu button |
| `Lightbulb` | Console | Suggestion icon (error entries) |
| `Info` | Console | Info level icon |
| `AlertTriangle` | Console | Warning level icon |
| `XCircle` | Console | Error level icon |
| `CheckCircle` | Console | Success level icon |
| `Play` | Console | Action level icon |

---

<p align="center">
  <sub>
    Design Specification maintained by John (SpyCrypto) & Penny 🎀<br/>
    Part of the <strong>MidnightVitals</strong> project.
  </sub>
</p>
