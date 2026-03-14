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

## What ports does local dev use?

Vite runs on port 5173 (`npm run dev`). The Power Platform proxy (`pac code run`) runs on its own port — use the URL it prints, not the Vite URL directly.
