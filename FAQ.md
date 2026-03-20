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

## What ports does local dev use?

Vite runs on port 5173 (`npm run dev`). The Power Platform proxy (`pac code run`) runs on its own port — use the URL it prints, not the Vite URL directly.
