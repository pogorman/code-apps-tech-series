# FAQ

## Why can't I use `$select` in Dataverse queries?

Computed and formatted fields (like `statecodename`, `parentcustomeridname`) cause silent zero-row returns when included in `$select`. Omit `$select` entirely to get all fields.

## Why doesn't `parentcustomeridname` show the account name?

The Power Apps SDK doesn't populate `parentcustomeridname` on read for polymorphic lookups. We resolve account names by fetching all accounts via `useAccounts()` and matching by ID using `getParentAccountId()`.

## Why the double cast in `getParentAccountId()`?

TypeScript strict mode rejects a direct cast from `Contacts` to `Record<string, string>` because the types don't overlap. Casting through `unknown` first satisfies the compiler: `(contact as unknown as Record<string, string>)._parentcustomerid_value`.

## Why HashRouter instead of BrowserRouter?

Power Platform host iframes control the outer URL. HashRouter keeps routing within the fragment (`/#/accounts`) so it doesn't conflict with the host.

## Why do contact mutations invalidate the accounts query key?

The account detail dialog shows contacts linked to that account. When a contact is created, updated, or deleted, we invalidate the accounts cache so that list refreshes automatically.

## How do I add a new Dataverse table?

```bash
pac code add-data-source -a dataverse -t <logicalname>
```

Then create hooks in `src/hooks/use-<table>.ts` and components in `src/components/<table>/`.

## How is the Microsoft theme implemented?

All colors are CSS custom properties (HSL) in `src/index.css`, consumed by shadcn/ui components via Tailwind's `@theme inline` block. The title bar and nav tiles use direct Tailwind classes with hex colors for the dark gradient. No separate theme package is needed — just CSS variables.

## Why do dialogs scroll instead of growing?

`DialogContent` has `max-h-[85vh] overflow-y-auto` to prevent tall forms (like the contact form with 12 fields) from running off-screen. The entire dialog scrolls internally.

## How do action item choice fields (Priority, Status, Type) work?

Dataverse choice fields use numeric keys (e.g., `468510002` = "Top Priority"). The generated model has mangled display names that aren't user-friendly. A shared `labels.ts` file in `src/components/action-items/` maps these numeric keys to clean labels and assigns badge color variants (e.g., Top Priority = destructive red).

## How does the action item Customer lookup work?

Same polymorphic pattern as the contact → account relationship. Writes use `tdvsp_Customer@odata.bind` with OData bind syntax (`/accounts(guid)`). Reads come back as `_tdvsp_customer_value` (GUID) and `tdvsp_customername` (display name). The form populates an account dropdown; the list and detail views resolve via `tdvsp_customername` with a fallback to the accounts lookup map.

## How does the Meeting Summary Account lookup work?

Writes use `tdvsp_Account@odata.bind` with `/accounts(guid)` format. Reads return `_tdvsp_account_value` (GUID) and `tdvsp_accountname` (display name). Same OData bind pattern as the other entities.

## How does the Idea entity handle two lookups (Account + Contact)?

Ideas have both `tdvsp_Account@odata.bind` and `tdvsp_Contact@odata.bind` for writes. Reads use `_tdvsp_account_value` / `tdvsp_accountname` and `_tdvsp_contact_value` / `tdvsp_contactname`. The form shows both an account and a contact dropdown populated from `useAccounts()` and `useContacts()`.

## How do Idea category choice fields work?

Same pattern as action item Priority/Status/Type. The `tdvsp_category` field uses numeric keys (e.g., `468510000` = "Copilot Studio"). A shared `labels.ts` in `src/components/ideas/` maps these to clean labels: Copilot Studio, Canvas Apps, Model-Driven Apps, Power Automate, Power Pages, Azure, AI General, App General, Other.

## How do dashboard tooltips and drilldown cards work?

Hover any dashboard tile (KPI card or chart sub-element) to see a tooltip previewing the underlying data — item count, first 4 item names, and a "Click to view details" hint. Click to open a drilldown dialog showing a full filtered table of the action items behind that visualization. Tooltips use a pure CSS approach (Tailwind `group/tip` + `group-hover/tip`) — no tooltip library. KPI cards at the top use `position="below"` to avoid clipping off the viewport; chart sub-elements use `position="above"` (default). Reverse-lookup maps (`STATUS_KEY_BY_LABEL`, `PRIORITY_KEY_BY_LABEL`, `TYPE_KEY_BY_LABEL`) convert display labels back to Dataverse numeric choice keys for filtering.

## How does the "Extract Action Items with AI" feature work?

On the Meeting Summaries page, click the sparkle icon on any meeting summary row to open the AI extraction dialog. It sends the meeting notes to Azure OpenAI (configured via `VITE_AOAI_ENDPOINT`, `VITE_AOAI_API_KEY`, `VITE_AOAI_DEPLOYMENT` env vars). The AI returns a JSON array of action items with name, priority, due date, and notes. You can review, edit, or remove items before confirming. On confirm, each item is created in Dataverse as a `tdvsp_actionitem` with the meeting's account linked automatically. If the env vars aren't set, the button shows a toast instead.

## How does the Command Palette (Ctrl+K) work?

Press Ctrl+K (or Cmd+K on Mac) to open a global search dialog. It searches across all entities (accounts, contacts, action items, meeting summaries, ideas, projects) using the TanStack Query cache — no extra Dataverse API calls. Results are grouped by entity type with matching text highlighted. Select a result to navigate to that entity's list page.

## Why did the app show a white screen after adding the Command Palette?

`CommandPalette` uses React Router's `useNavigate()` hook, which requires a `<Router>` ancestor. It was initially rendered outside `<HashRouter>` in `App.tsx`, causing an uncaught error that crashed the entire React tree. The fix was moving `<CommandPalette />` inside `<HashRouter>`.

## How does the table/card view toggle work?

Each entity list (Accounts, Contacts, Action Items, Meeting Summaries, Ideas, Projects) has a toggle in the toolbar between the search bar and the "New" button. Click the list icon for table view or the grid icon for card view. Card view shows a responsive 3-column grid of shadcn `Card` components with the same click-to-view, edit, and delete actions. Your preference is saved per entity in `localStorage` via the `useViewPreference()` hook, so it persists across sessions.

## What is the Board view?

The Board (`/#/board`) is a Kanban-style dashboard with four vertical columns pulling from multiple entities. **Parking lot** (green accent, Car icon) shows items pinned via `tdvsp_pinned` from any entity (action items, projects, ideas, meeting summaries). **Work** (blue accent, Briefcase icon) shows active action items (excludes Recognized and Complete statuses) with task type filter pills (All/Work/Personal/Learning). **Projects** (purple accent, FolderKanban icon) shows all `tdvsp_project` records. **Ideas** (amber accent, Lightbulb icon) shows all ideas. Each column has a vertical accent bar on the left side and a scrollable card list. Cards show a floating toolbar on hover with drag grip, priority color dots, edit pencil, and pin toggle.

## How do the color dots on card views work?

Hover over any card in card view to reveal a row of 5 colored dots (clear, blue, orange, red, dark-red). Click a dot to set the card's priority color. For action items and ideas, clicking a dot immediately PATCHes the `tdvsp_priority` field in Dataverse — no save button needed. Accounts don't have a priority field in Dataverse, so their color is stored in localStorage. The card background color updates to reflect the chosen priority. Color mapping is in `src/lib/tile-colors.ts`.

## How does drag-and-drop work on the Board?

The Board uses a single `@dnd-kit` `DndContext` with `useDroppable` on each column. **Within-column drag** reorders cards via `SortableContext` + `arrayMove`; order persists in localStorage per column. **Cross-column drag** pins and unpins items: dragging a card from work/projects/ideas into parking lot sets `tdvsp_pinned = true` in Dataverse; dragging a parking lot card to any other column sets `tdvsp_pinned = false`. Cross-column drag does not change status or move records between entity types.

## Why does the Projects column show `tdvsp_project` records instead of accounts?

The Board was updated to show actual project records from the `tdvsp_project` Dataverse table instead of accounts. Projects have name, description, priority, and an account lookup — they represent discrete workstreams better than raw account records for Kanban tracking.

## How does the floating card toolbar work on the Board?

Hovering over any card on the Board reveals a floating `CardToolbar` popover positioned above the card. The toolbar contains (left to right): a GripVertical drag handle, a vertical separator, 5 priority color dots, a separator, a Pencil edit button, and a Pin button. The pin button is green when the item is pinned to parking lot. Click the pencil to open the entity's edit form dialog. Click the pin to toggle the `tdvsp_pinned` field in Dataverse. The toolbar uses `opacity-0 group-hover:opacity-100` for show/hide transitions.

## How does the Work column task type filter work?

The Work column header shows filter pills: All, Work, Personal, and Learning. Click a pill to filter the work column to only show action items of that task type. "All" shows all active action items regardless of type. Each action item card also has a per-card task type selector that appears on hover, letting you change the task type directly from the board.

## What is the `tdvsp_pinned` field?

`tdvsp_pinned` is a boolean (Yes/No) field on Dataverse entities used to pin items to the parking lot column on the Board. It is not yet in the generated TypeScript types, so it is accessed via casting: `(item as Record<string, unknown>).tdvsp_pinned`. The `isItemPinned()` helper in `board-dashboard.tsx` handles both `true` and `1` values.

## Why do I only see active records?

All entity hooks filter by `statecode eq 0`, which returns only active records from Dataverse. Deactivated or deleted records are excluded from all list views, dashboards, card views, and the Board. This is intentional — the app shows your current work, not historical records.

## How does the project lookup work on Ideas and Meeting Summaries?

Ideas and meeting summaries gained a `tdvsp_Project@odata.bind` field. Writes use `/tdvsp_projects(guid)` format. Reads return the GUID as `_tdvsp_project_value`. The form shows a project dropdown populated from `useProjects()`. Same OData bind pattern as the account and contact lookups.

## What ports does local dev use?

Vite runs on port 3001 (`npm run dev`). The Power Platform proxy (`pac code run`) runs on its own port — use the URL it prints, not the Vite URL directly.
