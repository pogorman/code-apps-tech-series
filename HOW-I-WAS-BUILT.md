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
