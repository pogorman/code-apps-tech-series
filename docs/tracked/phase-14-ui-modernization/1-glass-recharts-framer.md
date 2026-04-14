# Phase 14 — UI Modernization: Glass, Recharts, Framer Motion

## What Changed

Three modernization passes to the dashboard and My Board views, all intentionally subtle so
the existing "Precision Terminal" aesthetic still reads.

## 1. Glassmorphism

- Introduced a shared `GLASS_CARD` class in `dashboard.tsx`:
  `bg-card/60 dark:bg-card/45 backdrop-blur-xl border-border/50 dark:border-border/35`
  with a soft layered shadow. Applied to all KPI cards and to `ChartCard`
- `ChartCard` picked up a soft radial accent glow behind the glass so the blur has something
  to interact with (not just translucent over white)
- Board columns (`SortableColumn` in `board-dashboard.tsx`) swapped
  `bg-muted/20 backdrop-blur-sm` for `bg-card/55 dark:bg-card/35 backdrop-blur-xl`
  plus a matching layered shadow
- Board column sticky headers upgraded from `bg-background/70 backdrop-blur-xl` to
  `bg-background/60 dark:bg-background/40 backdrop-blur-xl` to align with the new column tint
- Individual kanban cards (`ActionItemCard`, `ProjectCard`, `IdeaCard`, `ParkingLotCard`)
  swapped solid `bg-card` for `bg-card/75 dark:bg-card/55 backdrop-blur-md`
- Dashboard + board header icon badges picked up `backdrop-blur-sm` for consistency

## 2. Recharts priority bars

Replaced the custom `HBar` block in the Priority Distribution chart with a Recharts
`BarChart`:

- Horizontal layout (`layout="vertical"`) so bars extend left-to-right against category
  labels on the Y axis
- One `<Cell>` per priority with the existing `PRIORITY_COLORS` palette
- 850ms ease-out animation on mount
- Custom frosted-glass `PriorityTooltip` (matches the rest of the app's tooltip styling)
  showing the color dot, label, item count, and a "Click to drill down" hint
- Click-through is wired via `Bar.onClick` — opens the same drilldown dialog the rest of
  the chart uses via `filterByPriority`
- `PriorityDatum` type and `PriorityBarChart` helper component live inline in
  `dashboard.tsx` (single-use, not worth splitting out)
- The old `HBar` helper was removed; `priorityMax` (its sibling computation) was also
  removed as unused

## 3. Framer Motion entrance animations

Replaced the inline CSS `@keyframes dashRise` blocks in both files with
`motion.div` wrappers. Every entrance animation now runs through framer-motion so
transitions compose cleanly with existing hover states.

- Shared presets at the top of both files:
  - `riseInitial / riseAnimate` — opacity + y + scale, 500-550ms, ease `[0.16, 1, 0.3, 1]`
  - `cardInitial / cardAnimate` — opacity + y only, 350ms, used per kanban card
- Dashboard header, each KPI card, and each `ChartCard` animate in with the shared
  preset, staggered by index (~75ms between KPIs, same for chart panels)
- Board header and each `SortableColumn` use the same preset, stagger carried over
  from the previous delay values (60/135/210/285ms)
- Every `SortableCard` wraps its child content in a lightweight `motion.div` that
  only runs the entrance animation on mount. The `delay` is `min(index, 10) * 40ms` so
  the stagger caps at the first 10 cards and long columns don't feel sluggish
- `SortableCard` now requires an `index` prop from the parent `.map()` call

## Drag & Drop — why the motion wrapper goes **inside** SortableCard

`SortableCard` keeps its outer `div` with `ref={setNodeRef}` and inline
`transform: CSS.Transform.toString(transform)` from `@dnd-kit/sortable`. Wrapping *that*
with `motion.div` would conflict with dnd-kit's transform during drag. So the pattern is:

```
<div ref={setNodeRef} style={{ transform }}>  {/* dnd-kit */}
  <motion.div initial={cardInitial} animate={cardAnimate}>  {/* entrance only */}
    {children(handle)}
  </motion.div>
</div>
```

Framer-motion only animates on mount, dnd-kit owns the transform during drag, they
never fight.

## Packages

```
npm install --save-exact recharts framer-motion
```

- `recharts@3.8.1`
- `framer-motion@12.38.0`

Both are additive — nothing was removed.

## Files Changed

- `src/components/dashboard/dashboard.tsx` — glass cards, Recharts priority chart, motion
  entrances, removed `HBar` + `ANIM_CSS` + `priorityMax`
- `src/components/dashboard/board-dashboard.tsx` — glass columns + cards, motion entrances
  on columns and every card, `SortableCard` gained `index` prop, removed `BOARD_ANIM_CSS`
- `package.json` / `package-lock.json` — added `recharts`, `framer-motion`

## Verification

- `npx tsc -b` — clean
- `npm run build` — clean (same ~1.19MB bundle, gzipped ~353KB)
- Local dev server boots with zero React/runtime errors; Dataverse data shows skeletons
  without `pac code run` active, which is expected
- Deployed to **og-dv** with `pac code push`
