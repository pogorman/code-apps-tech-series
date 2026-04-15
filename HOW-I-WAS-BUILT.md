# How I Was Built

An ELI5-style walkthrough of how this Code App was built, documenting prompts, execution, and fixes.

## Phase 1 — Scaffolding

**Prompt:** Set up a Power Platform Code App with React, TypeScript, Tailwind, and shadcn/ui.

**What happened:** Created the project with `pac code init`, added Vite + React + TypeScript + Tailwind v4 + shadcn/ui. Set up routing with HashRouter (required by Power Platform iframe host), app layout with sidebar, and the base configuration.

**Tracked notes:** `docs/tracked/phase-1-first-steps/`

## Phase 2 — Account CRUD

**Prompt:** Add full CRUD for the Dataverse account table.

**What happened:** Ran `pac code add-data-source -a dataverse -t account` to generate the service and model. Created `use-accounts.ts` hooks wrapping TanStack Query, then built list/detail/form/delete components in `src/components/accounts/`. Deployed with `npm run build && pac code push`.

**Tracked notes:** `docs/tracked/phase-1-first-steps/`

## Phase 3 — Contact CRUD

**Prompt:** Add contact CRUD with sidebar navigation.

**What happened:** Ran `pac code add-data-source -a dataverse -t contact`. Created `use-contacts.ts` hooks and `src/components/contacts/` components mirroring the account pattern. Added sidebar nav with Accounts/Contacts links.

**Tracked notes:** `docs/tracked/phase-1-first-steps/`

## Phase 3.5 — Account-Contact Relationships

**Prompt:** Add the relationship between accounts and contacts and reflect that in the UI. Need to be able to set the account for the contact, and add contacts to an account.

**What happened:**
- Added an Account dropdown (shadcn `Select`) to the contact form, setting `parentcustomerid` + `parentcustomeridtype` on save
- Added a Contacts section to the account detail dialog querying by `_parentcustomerid_value`
- Contact mutations now invalidate both contacts and accounts query caches

**Tracked notes:** `docs/tracked/phase-3-relationships/1-first-cut-accounts-contacts-relate.md`

## Fixes — Polymorphic Lookup Fields

**Problem:** Existing contacts with accounts showed "None" in the dropdown, and the account column/detail card were empty.

**Root cause:** Dataverse OData returns polymorphic lookup GUIDs as `_parentcustomerid_value` at runtime, but the generated TypeScript type only declares `parentcustomerid`. Similarly, `parentcustomeridname` isn't populated by the Power Apps SDK.

**Fix:**
1. Created `src/lib/get-parent-account-id.ts` — shared helper using `_parentcustomerid_value` fallback
2. Resolved account names by fetching all accounts via `useAccounts()` and building a lookup map instead of relying on `parentcustomeridname`

**Tracked notes:** `docs/tracked/phase-3-relationships/2-first-cut-fixes.md`, `docs/tracked/phase-3-relationships/4-step-2-fixes.md`

## UI Polish

**Prompt:** Replace Company column with Account, drop Phone and Status from contact list, show account on detail card, remove created/modified dates.

**What happened:** Renamed headers, removed columns, updated column counts, cleaned up unused imports.

**Tracked notes:** `docs/tracked/phase-3-relationships/3-step-2-contact-ui-enhance.md`

## Account List Simplification

**Prompt:** Remove City, Phone, Industry, Status from account list. Add a Contacts column stacked vertically. Add stub columns for CSA, CSAM, AE.

**What happened:**
- Removed four columns (City, Phone, Industry, Status) from the account table
- Added a Contacts column that fetches all contacts via `useContacts()`, builds a `contactsByAccount` map using `getParentAccountId()`, and renders contact names stacked vertically
- Added three placeholder columns (CSA, CSAM, AE) with em dash placeholders for future implementation

**Tracked notes:** `docs/tracked/phase-3-relationships/5-step-3-account-ui.md`

## Phase 4 — Microsoft Fluent Design Theme

**Prompt:** The UI is kind of drab. Spruce it up with Microsoft colors and an uber awesome theme.

**What happened:**
- Replaced the default shadcn/slate color palette with Microsoft Fluent Design colors — Microsoft Blue (#0078D4) as primary, light blue-gray background, blue accents and focus rings
- Redesigned the sidebar: dark navy gradient (#0C2340 → #1B3A5C), branded icon badge, blue left-border active indicator, translucent white text
- Added a gradient accent bar at the top of the page (#0078D4 → #50E6FF → #00BCF2)
- Styled table headers with Microsoft Blue background and white uppercase text
- Added page headers with icon badges and subtitles to Accounts and Contacts pages
- Wrapped data tables in card-elevated containers with shadows and clipped corners

**Tracked notes:** `docs/tracked/phase-4-ui-enhance/1-ui-overhaul.md`

## Fix — Contact Form Overflow

**Prompt:** The new and edit forms for contact are too tall and run off the screen.

**What happened:**
- Added `max-h-[85vh] overflow-y-auto` to `DialogContent` so all dialogs scroll internally instead of clipping
- Compacted the contact form by combining Account + Job Title and Mobile + Street into side-by-side rows

**Tracked notes:** `docs/tracked/phase-4-ui-enhance/2-adjust-contact-form-height.md`

## Phase 5 — Action Items CRUD

**Prompt:** contacts and accounts are good for now, let's implement the tdvsp_actionitem table w full crud

**What happened:**
1. Ran `pac code add-data-source -a dataverse -t tdvsp_actionitem` to generate model + service
2. Created `src/hooks/use-action-items.ts` — TanStack Query hooks for CRUD with cache invalidation
3. Created `src/components/action-items/labels.ts` — human-readable labels for Priority, Status, Type choice fields + badge variant helpers (the generated enum names are mangled and not display-friendly)
4. Created `src/components/action-items/` — list, form dialog, detail dialog, delete dialog following the exact same pattern as accounts/contacts
5. Customer lookup uses OData bind syntax (`tdvsp_Customer@odata.bind` → `/accounts(guid)`) for writes, `_tdvsp_customer_value` for reads — same polymorphic pattern as contacts
6. Wired up `/action-items` route in `App.tsx` and "Action Items" nav item with ClipboardList icon in the sidebar

**Tracked notes:** `docs/tracked/phase-5-action-items/1-first-cut-action-items.md`

## Phase 6 — Navigation Rework (Sidebar → Top Tiles)

**Prompt:** i need more horizontal space, rework the navigation to be evenly spaced tiles across the top under the main title bar no more than maybe 125px tall.

**What happened:**
1. Removed the 256px-wide dark sidebar entirely
2. Split layout into: gradient accent bar → title bar (48px, logo + "Account Management") → nav tile row → full-width content
3. Nav tiles are left-aligned 50px squares with icon + label, active tile highlighted in Microsoft Blue
4. Tiles use `min-w-[50px]` with padding so longer labels like "Action Items" stretch gracefully
5. Full viewport width is now available for content

**Follow-up fixes:**
- Halved tile height and made them square, left-aligned with `flex` instead of `grid`
- Added `min-w` + `px-3` + `whitespace-nowrap` to fix centering on longer labels

**Tracked notes:** `docs/tracked/phase-6-ui-enhance/1-ui-enhance-navigation.md`

## Phase 6b — View Polish

**Prompts:** Rename header title, uniform tile sizing, icon action buttons, column width tuning.

**What happened:**
1. Renamed header from "CRM Demo" to "Account Management"
2. Set all nav tiles to fixed `w-[100px]` so Accounts, Contacts, and Action Items are the same width
3. Equalized nav tile vertical spacing (`py-2` instead of `pb-3 pt-1`)
4. Added `whitespace-nowrap` to Priority column header and cells so "Top Priority" doesn't wrap
5. Replaced text "Edit"/"Delete" buttons with Pencil and Trash2 Lucide icons across all three list views (accounts, contacts, action items) — black for edit, red for delete
6. Set Account Name column to `w-[39%]` for more room

**Tracked notes:** `docs/tracked/phase-6-ui-enhance/1-ui-enhance-navigation.md`, `docs/tracked/phase-6-ui-enhance/2-ui-enhance-views.md`

## Phase 6c — Dashboard

**Prompt:** Build a dashboard view.

**What happened:** Added a Dashboard component with Chart.js (Doughnut, Bar, Pie) showing action item analytics: KPI cards (total, completion rate, in progress, urgent), status breakdown, priority distribution, work vs personal, and items by account. Wired up as the home route (`/`).

**Tracked notes:** `docs/tracked/phase-6-ui-enhance/3-ui-enhance-dashboard-first-cut.md`

## Phase 7 — HVA, Meeting Summary & Idea CRUD

**Prompt:** add full crud for tdvsp_hva, tdvsp_meetingsummary, tdvsp_idea and build the navigation

**What happened:**

1. Generated Dataverse types for all three tables via `pac code add-data-source`
2. Created TanStack Query hooks: `use-hvas.ts`, `use-meeting-summaries.ts`, `use-ideas.ts`
3. Built full CRUD component sets for each entity:
   - **HVAs** (`src/components/hvas/`) — list, form (name, customer, date, description), detail, delete; customer lookup via `tdvsp_Customer@odata.bind`
   - **Meeting Summaries** (`src/components/meeting-summaries/`) — list, form (title, account, date, summary textarea), detail, delete; account lookup via `tdvsp_Account@odata.bind`
   - **Ideas** (`src/components/ideas/`) — list, form (name, category choice, account, contact, description), detail, delete; dual lookups (`tdvsp_Account@odata.bind` + `tdvsp_Contact@odata.bind`); `labels.ts` for 9 category choices (Copilot Studio, Canvas Apps, Model-Driven Apps, Power Automate, Power Pages, Azure, AI General, App General, Other)
4. Updated navigation to 7 tiles: Dashboard, Accounts, Contacts, Action Items, HVAs (Zap), Meetings (FileText), Ideas (Lightbulb)
5. Added routes: `/hvas`, `/meeting-summaries`, `/ideas`

**Tracked notes:** `docs/tracked/phase-7-idea-meet-hva-crud/1-idea-meet-hva-crud.md`

> **Note:** HVAs were later removed in Phase 9.

## Phase 8 — Dashboard CSS Rewrite (Drop Chart.js)

**Prompt:** Drop Chart.js entirely and rebuild the dashboard using pure CSS/SVG, based on the example in `examples/crm_dashboard_v2.html`.

**What happened:**
1. Rewrote `src/components/dashboard/dashboard.tsx` from scratch — no chart library dependencies
2. SVG donut replaces Chart.js Doughnut (uses `stroke-dasharray` arcs)
3. CSS horizontal bars replace Chart.js Bar charts (priority distribution, items by account)
4. CSS progress bars replace Chart.js Pie (work vs personal)
5. KPI cards now have colored accent stripes matching the example design
6. Removed `chart.js` and `react-chartjs-2` from package.json (3 packages dropped)

**Tracked notes:** `docs/tracked/phase-8-ui-enhance/1-new-dash-all-css.md`

## Phase 9 — Left Sidebar, Quick Create Bar & Drop HVAs

**Prompt:** Move navigation to a vertical left sidebar and add a quick create bar across the top, mimicking a reference screenshot. Then drop HVAs entirely.

**What happened:**

1. Rewrote `app-layout.tsx` — replaced horizontal nav tiles with a left vertical sidebar (208px, white background, grouped nav sections: core, activity, capture) and a top quick create bar (colored pill buttons)
2. Created `src/stores/quick-create-store.ts` — Zustand store that signals which entity's create dialog to open. Layout sets the target + navigates; list component picks it up via `useEffect` and auto-opens the form
3. Updated all list components to subscribe to the quick create store
4. Removed HVAs: deleted `src/components/hvas/` and `src/hooks/use-hvas.ts`, removed route, nav item, and quick create button. Generated code left untouched (read-only)

**Tracked notes:** `docs/tracked/2-quick-create-bar-drop-hvas.md`

## Phase 10 — Multiple Minor UI Tweaks

**Prompts:**
1. "rearrange the quick create to match the left nav"
2. "change acct mgmt to Cx Mgt and use an icon that looks more like cxmgr-logo in your screenshots folder"
3. "change cx mgt to My Work and come up with a better icon"

**What happened:**

1. Reordered `QUICK_CREATE_BUTTONS` to match the left sidebar nav order: account → contact → task → summary → idea (was task → idea → account → contact → summary)
2. Replaced the `LayoutGrid` brand icon with `UserCog` (person + gear, matching the cxmgr-logo.jpg style) and renamed "Acct Mgmt" to "Cx Mgt"
3. Settled on `Briefcase` icon + "My Work" as the final brand — cleaner, universally recognized

All changes in `src/components/layout/app-layout.tsx`.

**Tracked notes:** `docs/tracked/phase-8-ui-enhance/3-multiple-minor-ui-tweaks.md`

## Phase 11 — Dashboard Tooltips & Drilldown Cards

**Prompt:** "all of the tiles on the dashboard should allow me to hover over them and see some data that makes up the visualization, but then click on them and have a card open that shows the data that makes up those vis's"

**What happened:**

1. Created `src/components/dashboard/drilldown-dialog.tsx` — reusable Radix Dialog showing a filtered table of action items (Name, Customer, Priority badge, Status badge, Date). Sticky header, scrollable body (`max-h-[60vh]`), wide layout (`max-w-3xl`)
2. Added a `Tip` component to `dashboard.tsx` — generic CSS tooltip wrapper using Tailwind `group/tip` + `group-hover/tip` (no tooltip library). Shows item count, first 4 names, "+N more", "Click to view details". Supports `position` prop (`"above"` | `"below"`)
3. Made all 4 KPI cards clickable with hover tooltips (`position="below"` to avoid viewport clipping)
4. Made all chart sub-elements (`StatusRow`, `HBar`, `AccountRow`, type rows) independently clickable with hover tooltips
5. Created reverse-lookup maps (`STATUS_KEY_BY_LABEL`, `PRIORITY_KEY_BY_LABEL`, `TYPE_KEY_BY_LABEL`) to convert display labels back to Dataverse numeric choice keys for filtering
6. Added hover styling: `cursor-pointer hover:bg-muted/60` on sub-elements, `hover:shadow-md` on KPI cards

**Fix:** KPI tooltips positioned above (`bottom-full`) clipped off-screen. Added `position` prop — KPI cards use `"below"` (renders with `top-full mt-2`), chart sub-elements use default `"above"`.

**Tracked notes:** `docs/tracked/phase-8-ui-enhance/4-tool-tips-and-blowouts-for-dash.md`

## Phase 12 — AI Action Item Extraction & Command Palette

**Prompt:** Add AI-powered action item extraction from meeting notes and a Ctrl+K command palette for global search.

**What happened:**

1. Created `src/lib/azure-openai.ts` — Azure OpenAI integration that sends meeting notes to a chat completion endpoint and parses the response into structured action items (name, priority, due date, notes). Maps AI priority strings ("High", "Medium", "Low") to Dataverse numeric choice keys. Gracefully checks for env var configuration
2. Created `src/components/meeting-summaries/extract-action-items-dialog.tsx` — dialog triggered by a sparkle icon on each meeting summary row. Shows extracted items in a reviewable list; user can edit or remove before confirming. On confirm, bulk-creates action items in Dataverse with the meeting's account linked
3. Created `src/components/command-palette.tsx` — global Ctrl+K search using cmdk + shadcn Dialog. Searches TanStack Query cache client-side (no extra API calls). Results grouped by entity with highlighted matches. Select to navigate
4. Added `.env.example` documenting the three Azure OpenAI env vars
5. Added Ctrl+K hint to sidebar footer

**Tracked notes:** `docs/tracked/phase-9-ai-command-palette/`

## Fix — CommandPalette Outside HashRouter (White Screen)

**Problem:** After deploying the command palette, the app showed a blank white screen in Power Platform.

**Root cause:** `CommandPalette` uses `useNavigate()` from react-router-dom, which requires a `<Router>` ancestor. It was rendered outside `<HashRouter>` in `App.tsx`, causing an uncaught error that crashed the entire React tree.

**Fix:** Moved `<CommandPalette />` inside `<HashRouter>` in `App.tsx`. Redeployed via `npm run build && pac code push`.

**Lesson:** Any component using React Router hooks (`useNavigate`, `useLocation`, `useParams`, etc.) must be rendered inside the Router provider. In a Power Platform Code App, there's no browser DevTools fallback — you just get a white screen.

## Phase 13 — Table/Card View Toggle

**Prompt:** "i want my table views to have a selector for list/grid view and card view"

**What happened:**

1. Created `src/hooks/use-view-preference.ts` — localStorage-backed hook that persists the selected view mode (`"table"` | `"card"`) per entity across sessions
2. Created `src/components/ui/view-toggle.tsx` — toggle button group with List and LayoutGrid Lucide icons, using shadcn Button with secondary/ghost variants
3. Updated all 5 entity list components (`account-list.tsx`, `contact-list.tsx`, `action-item-list.tsx`, `idea-list.tsx`, `meeting-summary-list.tsx`):
   - Added ViewToggle in toolbar between search bar and "New" button
   - Added card view: responsive 3-column grid (`sm:grid-cols-2 lg:grid-cols-3`) of shadcn Card components
   - Cards show entity-specific fields (badges for priority/status/category, account names, dates, contacts)
   - Edit/delete buttons on each card header
   - Cards are clickable to open detail dialog (same as table rows)
   - Loading skeleton and empty states handled for both views

## Phase 14 — Board (Kanban Dashboard)

**Prompt:** "I want the dashboard to look like that [screenshot]. Parking lot, work, projects, and ideas in vertical columns."

**What happened:**

1. Created `src/components/dashboard/board-dashboard.tsx` — a Kanban-style board with 4 vertical columns pulling from 4 data sources (action items, projects, ideas, meeting summaries)
2. **Parking lot** column (green accent, Car icon): Items pinned via `tdvsp_pinned` from any entity. Shows name + entity type badge. Minimal toolbar (grip + X to unpin)
3. **Work** column (blue accent, Briefcase icon): All non-complete action items (excludes Complete only). Shows name, date, customer, status/priority badges. Task type filter pills in header (All/Work/Personal/Learning). Per-card task type selector on hover
4. **Projects** column (purple accent, FolderKanban icon): All `tdvsp_project` records. Shows project name and priority badge
5. **Ideas** column (amber accent, Lightbulb icon): All ideas. Shows idea name and category badge
6. Column accent bars run vertically on the left side (not bottom). Each column is a scrollable container with header (icon + title + count)
7. Single `DndContext` wraps all columns with `useDroppable` per column. Within-column reorder via `SortableContext` + `arrayMove`. Cross-column: drag to parking lot pins, drag from parking lot unpins
8. Floating `CardToolbar` on hover: GripVertical (drag), priority color dots, Pencil (edit), Pin toggle. Edit pencil works for all entity types (action items, projects, ideas, meeting summaries)
9. `tdvsp_pinned` is a boolean field not yet in generated types — accessed via casting to `Record<string, unknown>`
10. Added `/board` route in `App.tsx` and "Board" nav item with `Columns3` icon in sidebar alongside Dashboard
11. Kept the existing analytics dashboard intact at `/` — no changes to that view

## Phase 15 — Projects CRUD

**Prompt:** Add full CRUD for the `tdvsp_project` table with list view, form dialog, detail dialog, and delete dialog.

**What happened:**

1. Ran `pac code add-data-source -a dataverse -t tdvsp_project` to generate model + service
2. Created `src/hooks/use-projects.ts` — TanStack Query hooks for CRUD with cache invalidation
3. Created `src/components/projects/labels.ts` — priority labels + badge variant helpers (same numeric keys as action items)
4. Created `src/components/projects/` — list (table/card toggle), form dialog (name, account, priority, description), detail dialog, delete dialog, barrel export. FolderKanban icon
5. Account lookup via `tdvsp_Account@odata.bind` → `/accounts(guid)` for writes, `_tdvsp_account_value` for reads
6. Added `/projects` route in `App.tsx`, "Projects" nav item in sidebar (capture section), and violet quick create pill in the top bar
7. Updated Board to show `tdvsp_project` records in the Projects column instead of accounts

## Phase 16 — Board Visual Polish, Dynamic Work Column, Quick Create Presets & Nav Reorg

**Prompt:** Polish the board cards, make the work column dynamic, add task-type presets to quick create, and reorganize the left nav.

**What happened:**

1. **Board card visual polish** (`board-dashboard.tsx`, `tile-colors.ts`):
   - Cards have hover lift (`-translate-y-0.5`), graduated shadows (sm to md to xl for drag)
   - Drag state: `scale-[1.03]`, `rotate-[1.5deg]`, `ring-2 ring-primary/40`
   - Entity-type icons (h-3 w-3) inline with card titles: Briefcase (action items), FolderKanban (projects), Lightbulb (ideas), FileText (meeting summaries)
   - 1-line description snippets below titles when available
   - Subtle priority-tinted gradient backgrounds via `tileGradient()` in `tile-colors.ts`
   - Glass-morphism sticky column headers (`backdrop-blur-md`, `bg-background/60`) with overlapping accent-colored count badges
   - Improved empty state with large faded icon
   - Card titles use `text-xs` for compact display

2. **Outline-style priority/status pills** (`action-items/labels.ts`, `ideas/labels.ts`):
   - New `priorityPillClass()` and `statusPillClass()` in action-items labels
   - New `categoryPillClass()` in ideas labels
   - Pills are absolute positioned: priority bottom-left, status bottom-right
   - `rounded-sm border` style with semantic colors (red, blue, amber, etc.)
   - Removed Badge component from board (raw spans now)

3. **Dynamic work column** (`board-dashboard.tsx`):
   - Column accent color, icon, and title change based on active filter via `workFilterConfig()` helper
   - All: gray/LayoutGrid/"all", Work: red/Briefcase/"work", Personal: blue/House/"personal", Learning: magenta/BookOpen/"learning"
   - Filter pills are tiny h-5 w-5 circles with single letters (A/W/P/L) pushed to the right
   - Removed per-card hover task-type selector icons

4. **Quick create reorder + task-type presets** (`quick-create-store.ts`, `app-layout.tsx`, `action-item-form-dialog.tsx`, `action-item-list.tsx`):
   - Quick create store gained `payload` field (`QuickCreatePayload` type)
   - `ActionItemFormDialog` gained `defaultTaskType` prop
   - Quick create order: work, personal, learning, idea, meeting, project, account, contact
   - Work/personal/learning each pre-set the task type on the action item form
   - "summary" renamed to "meeting"
   - Added project quick create (violet, FolderKanban)

5. **Left nav reorganization** (`app-layout.tsx`):
   - Section order: insights (Dashboard, My Board), activity, capture, core
   - "Board" renamed to "My Board" everywhere
   - Capture order: Ideas, Meetings, Projects
   - Nav icons colored to match quick creates (red, emerald, pink, violet, teal, sky)
   - `NavItem` interface gained optional `color` field

6. **Parking lot cards** (`board-dashboard.tsx`):
   - Removed type label badge and divider
   - Entity icon identifies the type instead

**Files changed:** `board-dashboard.tsx` (major), `tile-colors.ts`, `action-items/labels.ts`, `ideas/labels.ts`, `action-item-form-dialog.tsx`, `action-item-list.tsx`, `app-layout.tsx`, `quick-create-store.ts`

## Phase 17 — Dark Mode, Monospace Font, Board Improvements & Action Item Filters

**Prompt:** Add dark mode support, switch to monospace font, improve board UX (wider work column, clickable cards, Car icon for parking, custom collision detection, drop target glow, toolbar repositioning), add task-type filter pills on the action items list, rename "Eh" to "Med", tighten table density, and fix Tailwind v4 dark mode.

**What happened:**

1. **Dark mode with ThemeProvider** (`src/components/theme-provider.tsx`, `src/App.tsx`):
   - Created `ThemeProvider` context with `useTheme()` hook
   - Stores preference in `localStorage`, falls back to OS `prefers-color-scheme`
   - Toggles `.dark` class on `<html>` to activate dark CSS variables
   - Dark mode color palette defined in `src/index.css` under `.dark` — inverted backgrounds, adjusted accent colors, bright blue/cyan sidebar gradient
   - Moon/Sun toggle button added to sidebar footer in `app-layout.tsx`

2. **Tailwind v4 dark mode fix** (`src/index.css`):
   - Tailwind v4 removed `darkMode: "class"` from config
   - Added `@custom-variant dark (&:where(.dark, .dark *));` at the top of `index.css` to tell Tailwind that `dark:` utilities activate on `.dark` class ancestors
   - Without this line, all `dark:` classes were silently ignored

3. **Monospace font** (`src/index.css`):
   - Set body font to `"JetBrains Mono", "Fira Code", "Cascadia Code", "Consolas", ui-monospace, monospace`
   - Gives the app a developer-tool aesthetic fitting a Code Apps demo

4. **Board improvements** (`board-dashboard.tsx`):
   - **Wider work column:** Grid changed to `grid-cols-[1fr_2fr_1fr_1fr]` — work column gets 2x width
   - **Clickable cards:** All card types have `cursor-pointer` and clicking the card body opens the entity's edit form dialog via `setEditTarget()`
   - **Car icon replaces Pin:** The `CardToolbar` pin toggle now uses a Car icon (`lucide-react/Car`) instead of a generic pin. Green when parked
   - **Toolbar repositioned:** Moved from floating above (`-top-8`) to top-right corner of card (`-top-2.5 -right-2.5`) for better visibility
   - **Custom collision detection:** Hybrid strategy using `closestCenter` for within-column card reorder + `pointerWithin` for cross-column drops. `getColumnForId()` helper determines whether active and over items are in the same column
   - **Drop target glow:** `isDropTarget` prop on `SortableColumn` — when a card is dragged over a column, the column gets `border-2 ring-2 ring-offset-1 scale-[1.01] shadow-lg` with accent-colored `boxShadow` glow. Tracked via `overColumn` state set in `handleBoardDragOver`
   - **`onDragCancel` handler:** Clears `overColumn` state when drag is cancelled

5. **Action item type filters** (`action-item-list.tsx`):
   - Added `typeFilter` state (numeric Dataverse key or `null` for All)
   - Four filter pills below search bar: All (dark inverted), Work (red + Briefcase), Personal (blue + House), Learning (magenta + BookOpen)
   - Active pill: solid fill with white text. Inactive: outline style with entity-specific colors
   - `TASK_TYPE_ICON` map associates each numeric key with an icon + color
   - Each table row and card shows a colored task-type icon inline with the name
   - Dark mode variants on pill styles (`dark:bg-*-950/60 dark:border-*-800`)

6. **"Eh" renamed to "Med"** (`action-items/labels.ts`):
   - `PRIORITY_LABELS[468510001]` changed from `"Eh"` to `"Med"` for clarity

7. **Customer column removed** (`action-item-list.tsx`):
   - Removed the Customer column from the action items table view to free horizontal space
   - Customer is still visible in detail dialog, form, and card view

8. **Tighter table density** (action-item-list.tsx and other list components):
   - Reduced vertical padding on table cells for a more compact list appearance

**Files changed:** `theme-provider.tsx` (new), `index.css`, `App.tsx`, `app-layout.tsx`, `board-dashboard.tsx`, `action-item-list.tsx`, `action-items/labels.ts`

## Phase 18 — Copilot Studio Agent Integration

**Prompt:** Add a Copilot Studio agent to the Code App, reusing the same agent from the `dv-front-end` repo.

**What happened:**

1. Investigated the `dv-front-end` repo's approach: `botframework-webchat` + Direct Line + MSAL SSO token exchange. That pattern requires MSAL for Bearer tokens, which the Code App doesn't have — its `@microsoft/power-apps` SDK uses custom `paauth`/`dynamicauth` tokens with no public API to extract a standard OAuth token
2. Pivoted to the **iframe embed** approach: Copilot Studio provides a hosted webchat URL that handles SSO natively within the Power Platform context. Since both the Code App and the agent are in the same environment (`0582014c-9a6d-e35b-8705-5168c385f413`), the authenticated session flows through
3. Created `src/components/copilot-chat.tsx` — floating blue gradient button (bottom-right, `MessageCircle` icon) that opens a 400x600 chat panel with the Copilot Studio iframe. Header has refresh (remount iframe) and close buttons. Dark mode aware via `useTheme()`
4. Added `<CopilotChat />` to `App.tsx` alongside `<CommandPalette />` (outside `AppLayout`, inside `HashRouter`)
5. No new dependencies — zero packages added

**Key decision:** Iframe over Direct Line because the Power Platform host's custom auth tokens aren't compatible with Direct Line's SSO token exchange. The iframe embed was simpler, dependency-free, and handled auth natively.

**Tracked notes:** `docs/tracked/phase-12-adding-agent/1-adding-my-copilot-studio-agent.md`

## Phase 18b — Copilot Chat Simplified to Popup Window

**Prompt:** Simplify the Copilot chat — the iframe approach still had friction. Just open it in a popup window.

**What happened:**

1. Rewrote `src/components/copilot-chat.tsx` from a full iframe-based chat panel (400x600, header with refresh/close, dark mode support, `iframeKey` remounting) to a minimal floating button that calls `window.open()` with the Copilot Studio webchat URL
2. Removed `@azure/msal-browser` and `botframework-webchat` from `package.json` — these were dead dependencies left over from the Direct Line experiment that never worked in the Code App context
3. Removed `VITE_COPILOT_DIRECT_LINE_SECRET` from `.env.example`
4. The popup window approach lets Copilot Studio handle its own auth in its own browsing context — no iframe CSP issues, no token exchange, no dependencies

**Key decision:** The evolution was Direct Line + MSAL (failed due to `paauth`/`dynamicauth` tokens) -> iframe embed (worked but had friction) -> popup window (simplest, zero dependencies). The popup window is the right answer for Code Apps where the host SDK's auth is incompatible with standard OAuth flows.

## Phase 19 — "Under the Hood" Presentation Deck (Agentic Generation)

**Prompt:** Analyze the deployed Code App's runtime using a browser DevTools HTML export, then generate a companion slide deck and talk track for the tech series.

**What happened:**

1. **Runtime analysis** — The `inbox/08587a10-83ed-43d0-8be4-8b145f5a7ee3.devtools` file (a full HTML export from browser DevTools of the deployed app) was analyzed by Claude Code to extract runtime facts: 77 scripts loaded, 230KB of localization data, ClassicCanvasApp iframe classification, 55 feature gates, server-side auth via `paauth`/`dynamicauth`, Copilot sidecar injection, sovereign cloud readiness, and accessibility annotations
2. **Slide content authoring** — Claude Code drafted 6 slides of content: runtime internals, two gotcha stories (Dataverse polymorphic lookups where writes worked but reads silently failed; Copilot Studio Direct Line + MSAL working locally but failing deployed due to custom auth — pivoted to iframe), the 18-phase agentic build story, reusable patterns (TanStack Query cache powering Ctrl+K, 27-line Zustand quick-create store, dnd-kit + Dataverse mutations, Tailwind v4 class-based dark mode), and a 7-beat live demo transition
3. **Programmatic generation** — Created `demo-materials/generate-deck.py` using `python-pptx` (for the `.pptx` deck) and `fpdf2` (for the speaker notes PDF). The script is the single source of truth — edit content there, run `python generate-deck.py` to regenerate both outputs
4. **Output** — `demo-materials/code-apps-under-the-hood.pptx` (6 slides) and `demo-materials/code-apps-under-the-hood-talk-track.pdf` (full talk track)

**Key detail:** No manual PowerPoint editing. The entire deck — including layout, fonts, colors, and content — is generated programmatically from the Python script, keeping it version-controllable and reproducible.

## Phase 20 — UI Facelift: Dashboard, Board & Collapsible Sidebar

**Prompt:** "build a more enhanced dashboard with better looking tiles", "let's give the my board a face lift too", "make the left nav bar collapsible and reduce padding"

**What happened:**

1. **Dashboard redesign** (`dashboard.tsx`) — "Precision Terminal" aesthetic. KPI cards got left accent borders, radial accent glows, icons in tinted badges, hover lift + shadow expansion. New `ChartCard` wrapper with top gradient accent line and vertical bar section indicator. SVG donut enlarged (144px, 18px stroke) with background track ring. Bars became pill-shaped with gradient fills. Task Types section gained a segmented overview bar and per-type icons (Briefcase/House/BookOpen). Tooltips upgraded to frosted glass (`backdrop-blur-xl`). All elements stagger in with `dashRise` animation. Fixed stale `Eh` → `Med` in `PRIORITY_COLORS`. Added `TYPE_COLORS` and `TYPE_ICONS` maps
2. **Board redesign** (`board-dashboard.tsx`) — Matching visual style. Columns stagger in with `dashRise` animation (60/135/210/285ms delays). Column headers gained vertical accent bar indicator, upgraded to `backdrop-blur-xl`, uppercase tracking titles. Drop target glow doubled (`24px + 48px`). CardToolbar upgraded to `backdrop-blur-xl` with better shadow. Drag state softened (1deg rotation, 1.02 scale). Empty states enlarged with accent-tinted icons
3. **Collapsible sidebar** (`app-layout.tsx`) — Floating chevron toggle button on sidebar edge. Collapses from 208px to 56px with 300ms transition. Collapsed: icon-only with hover tooltips, section dividers, footer icons only. State persists in `localStorage` (`sidebar-collapsed`)
4. **Padding reduction** — Main content `p-8` → `p-4`, quick create bar `px-6 py-2` → `px-4 py-1.5`. Reclaims ~32px per side

**Tracked notes:** `docs/tracked/phase-13-ui-facelift/1-dashboard-board-layout-facelift.md`

## Phase 21 — Board Work Column Status Filter Fix

**Fix:** The work column was filtering out action items with status "Recognized" (Dataverse choice key `468510000`). Since Recognized is the default status when a new action item is created, this meant freshly created items were invisible on the board until their status was manually changed. The filter now excludes only "Complete" — all other statuses (Recognized, In Progress, Pending Comms, On Hold, Wrapping Up) are shown.

**What happened:**

1. Removed the `RECOGNIZED` status exclusion from the work column filter in `src/components/dashboard/board-dashboard.tsx`
2. Work column now shows all active action items except Complete

**Files changed:** `board-dashboard.tsx`

## Phase 22 — Second Copilot Studio Agent via Connector (In-App Chat Panel)

**Prompt:** "i want to add a second agent to the code app. keep the existing one exactly as it is, but use Microsoft authentication per the instructions in `inbox/copilot-studio-integration.txt`. A little button right next to the existing one."

**What happened:**

1. **Read the integration notes** — The inbox file described the native Code Apps pattern: add `shared_microsoftcopilotstudio` as a Power Platform connector data source via `pac code add-data-source`, which generates `MicrosoftCopilotStudioService.ts`. Call `ExecuteCopilotAsyncV2` directly from React. Auth inherits from the Power Apps host's Entra ID session — zero token handling. Completely different from the popup approach in Phase 18b
2. **Confirmed approach with the user** — Proposed building a real in-app chat panel rather than a second popup, since that's the whole point of the connector pattern. Asked for the agent schema name (from Copilot Studio → Settings → Advanced → Metadata) and the connection ID
3. **User provided:** Schema name `cr6bd_agentDVkdZi`, connection ID `efff43666f44484dbadb0972da65d5cb`
4. **Added the connector** — Switched `pac auth` to profile [2] (`og-dv`), then ran `pac code add-data-source -a "shared_microsoftcopilotstudio" -c efff43666f44484dbadb0972da65d5cb`. This generated `src/generated/services/MicrosoftCopilotStudioService.ts`, `src/generated/models/MicrosoftCopilotStudioModel.ts`, and `.power/schemas/microsoftcopilotstudio/microsoftcopilotstudio.Schema.json`
5. **Cross-referenced the schema JSON** — The inbox note suggested a named-object call style (`{ message, notificationUrl, agentName, conversationId }`), but the actual generated service signature is positional: `ExecuteCopilotAsyncV2(Copilot, body, x_ms_conversation_id?, environmentId?)`. The connector schema's `x-ms-notification-content` block confirmed the request body is `{ notificationUrl, message }` (not `text`) and the response is `{ lastResponse, responses[], conversationId }`
6. **Built `src/components/copilot-chat-panel.tsx`** — A new floating button + chat panel component:
   - Purple/pink gradient `Sparkles` button at `fixed bottom-6 right-[5.5rem]` — immediately to the left of the existing `copilot-chat.tsx` button at `right-6`
   - Click toggles a 384×560 glass-morphism panel anchored `bottom-24 right-6`
   - Chat bubble UI: user messages right-aligned on a gradient background, agent messages left-aligned on `bg-muted`
   - `Loader2` spinner while awaiting response, auto-scrolls to latest message
   - Multi-turn via a `conversationIdRef` that persists the returned `conversationId` across calls
   - Reset button clears messages and the stored conversation ID
   - Enter-to-send, disabled send button when empty or loading
   - Typed response is cast via a loose `CopilotResponseBody` interface: prefers `lastResponse`, falls back to joined `responses[]`, then `message`
7. **Wired into `App.tsx`** — `<CopilotChatPanel />` renders alongside the existing `<CopilotChat />` inside `<HashRouter>`
8. **Agent schema name hardcoded** as `AGENT_SCHEMA_NAME = "cr6bd_agentDVkdZi"` at the top of the component (publisher-prefixed, case-sensitive)

**Verification:** `npm run build` completed cleanly with no TypeScript errors.

**Key decision:** Connector over popup. The Copilot Studio connector pattern was invisible during Phase 18 because the research back then focused on Direct Line and iframe approaches. Once the inbox file surfaced the native Code Apps integration path, it became the obvious choice for any agent requiring Microsoft authentication and an in-app UX. The popup agent (#1) is intentionally preserved — the demo shows both patterns side by side so customers can see the trade-off.

**Prerequisite the demo assumes:** The target agent must be configured in Copilot Studio → Settings → Security with **Microsoft (Entra ID)** authentication, not "No authentication." The connector expects the `authenticated` endpoint path, and unauthenticated agents will fail.

## Phase 23 — UI Modernization: Glass, Recharts, Framer Motion

**Prompt:** "Modernize the dashboard and my board UI's with these three improvements: 1. Apply glassmorphism styling where it makes sense 2. Replace the priority distribution bars with animated Recharts bars with tooltips 3. Add Framer Motion entrance animations to the dashboard cards and kanban cards. Install any required packages. Keep animations subtle."

**What happened:**

1. **Installed** `recharts@3.8.1` and `framer-motion@12.38.0` with `--save-exact`. Both additive — nothing was removed.
2. **Glassmorphism** — Introduced a shared `GLASS_CARD` class at the top of `dashboard.tsx` (`bg-card/60 dark:bg-card/45 backdrop-blur-xl border-border/50` + layered shadow) and applied it to every KPI card and `ChartCard`. Added a soft radial accent glow behind each chart card's glass so the blur has something to interact with. On the board, columns swapped `bg-muted/20 backdrop-blur-sm` for `bg-card/55 dark:bg-card/35 backdrop-blur-xl`; kanban cards swapped solid `bg-card` for `bg-card/75 backdrop-blur-md`. Sticky column headers stayed `backdrop-blur-xl` but retuned to `bg-background/60` for consistency
3. **Recharts priority bars** — Replaced the hand-rolled `HBar` block in the Priority Distribution card with a Recharts `<BarChart layout="vertical">` using one `<Cell>` per priority color, 850ms ease-out animation, and a custom frosted-glass `PriorityTooltip` component matching the rest of the app's tooltip styling. Bars are click-through: `onClick` calls `openDrilldown(...)` with the filtered items, wiring back into the existing drilldown dialog. Removed the now-unused `HBar` helper and the `priorityMax` computation
4. **Framer Motion entrances** — Removed the inline `<style>{ANIM_CSS}</style>` / `{BOARD_ANIM_CSS}` blocks from both files and introduced shared motion presets (`riseInitial → riseAnimate` for headers, KPIs, chart cards, columns; `cardInitial → cardAnimate` for individual kanban cards). Dashboard header, KPI cards, and chart cards all animate in via `motion.div` wrappers staggered per index. Board header and every `SortableColumn` use the same presets. Every `SortableCard` wraps its child content in a lightweight `motion.div` that runs only the entrance animation — the outer dnd-kit node keeps its transform untouched, so entrance and drag never fight
5. **`SortableCard` API change** — Added a required `index` prop so each card can stagger its entrance (`delay = min(index, 10) * 40ms`, capped to stop long columns from feeling sluggish). Updated all four call sites to pass `idx` from the parent `.map()`

**Key decision — motion wrapper goes inside `SortableCard`, not outside:**

```tsx
<div ref={setNodeRef} style={{ transform }}>   {/* dnd-kit owns this transform */}
  <motion.div initial={cardInitial} animate={cardAnimate}>   {/* entrance only */}
    {children(handle)}
  </motion.div>
</div>
```

If framer wrapped the outer node, its transform would fight dnd-kit's. Keeping motion inside means entrance runs once on mount and dnd-kit has full control of the transform during drag.

**Key decision — Recharts only for the Priority Distribution chart:**

The rest of the dashboard (donut, task-type bars, account rows) stays hand-rolled. Recharts was added for the one chart where interactive tooltips and animated mount genuinely improve the UX. This keeps the bundle lean — Recharts only imports into the dashboard file where it's used.

**Verification:**

- `npx tsc -b` — clean
- `npm run build` — clean (same ~1.19MB bundle, gzipped ~353KB)
- Local dev boot: zero React errors; skeletons show because `pac code run` isn't active (expected)
- Deployed to **og-dv** with `pac code push`

**Files changed:**

- `src/components/dashboard/dashboard.tsx`
- `src/components/dashboard/board-dashboard.tsx`
- `package.json` / `package-lock.json`

**Tracked notes:** `docs/tracked/phase-14-ui-modernization/1-glass-recharts-framer.md`

## Presentation Materials — Slide Outline & Live Demo Script

**Prompt:** Create a slide outline and live demo script for the Code Apps tech series presentation targeting SLED customers.

**What happened:**

1. Created `docs/slide-outline.md` — 14-slide outline covering: app spectrum comparison (Canvas vs Model-Driven vs Code Apps), what/why/when for SLED, the stack, environment setup, AI-assisted development, deploy & govern, live demo transition, recap, resources
2. Created `docs/live-demo-script.md` — 8-act live demo script (~30 min) with exact click/type/narrate instructions, pre-demo checklist, and recovery plays for common issues (Dataverse latency, create failures, Canvas vs Code Apps questions, licensing)

## Phase 24 — Seed Data Parity Between Commercial and GCC

**Prompt:** "Use the same test data we used for the repo code-apps-tech-series-gcc and load that in this environment (active pac auth where this app is deployed). I want my data in commercial to match my test data in gcc. Should be in the repo."

**What happened:**

1. Copied `scripts/seed-data.ps1` from the sibling `code-apps-tech-series-gcc` repo into this repo's `scripts/` folder
2. Swapped the `$env_url` from `https://og-code.crm9.dynamics.com` to `https://og-dv.crm.dynamics.com` and updated the header comment + `az login` hint accordingly. Everything else — the 8 accounts, 20 contacts, 6 projects, 30 action items, 10 meeting summaries, 12 ideas, all OData bind syntax, all numeric choice keys — stayed identical so the two environments are byte-for-byte the same demo
3. Ran `powershell -ExecutionPolicy Bypass -File scripts/seed-data.ps1` against the active az CLI session (already logged into the M365x06150305 tenant). Created 86 records on the first pass with no errors

**Key decision — same Web API + az token pattern as gcc:**

The gcc script uses `az account get-access-token` to grab a bearer for the Dataverse Web API and posts JSON via `Invoke-RestMethod`. I considered the Dataverse MCP / Python SDK route but kept the powershell pattern unchanged so the two repos stay symmetric — anyone who knows the gcc script knows this one.

**Gotcha — re-run safety:**

Only `accounts` has an "exists" check (filter by `name`). Contacts, projects, action items, meetings, and ideas will duplicate on a second run. Documented this in the README under the **Seed Data** section so the next person doesn't accidentally double-load.

**Verification:** Script output shows all 86 records created with GUIDs returned. Records visible in the deployed app at og-dv.

**Files added:** `scripts/seed-data.ps1`
