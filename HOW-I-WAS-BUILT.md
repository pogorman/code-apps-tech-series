# How I Was Built

An ELI5-style walkthrough of how this Code App was built, documenting prompts, execution, and fixes.

## Phase 1 — Scaffolding

**Prompt:** Set up a Power Platform Code App with React, TypeScript, Tailwind, and shadcn/ui.

**What happened:** Created the project with `pac code init`, added Vite + React + TypeScript + Tailwind v4 + shadcn/ui. Set up routing with HashRouter (required by Power Platform iframe host), app layout with sidebar, and the base configuration.

**Tracked notes:** `docs/tracked/first-steps/`

## Phase 2 — Account CRUD

**Prompt:** Add full CRUD for the Dataverse account table.

**What happened:** Ran `pac code add-data-source -a dataverse -t account` to generate the service and model. Created `use-accounts.ts` hooks wrapping TanStack Query, then built list/detail/form/delete components in `src/components/accounts/`. Deployed with `npm run build && pac code push`.

**Tracked notes:** `docs/tracked/first-steps/`

## Phase 3 — Contact CRUD

**Prompt:** Add contact CRUD with sidebar navigation.

**What happened:** Ran `pac code add-data-source -a dataverse -t contact`. Created `use-contacts.ts` hooks and `src/components/contacts/` components mirroring the account pattern. Added sidebar nav with Accounts/Contacts links.

**Tracked notes:** `docs/tracked/first-steps/`

## Phase 3.5 — Account-Contact Relationships

**Prompt:** Add the relationship between accounts and contacts and reflect that in the UI. Need to be able to set the account for the contact, and add contacts to an account.

**What happened:**
- Added an Account dropdown (shadcn `Select`) to the contact form, setting `parentcustomerid` + `parentcustomeridtype` on save
- Added a Contacts section to the account detail dialog querying by `_parentcustomerid_value`
- Contact mutations now invalidate both contacts and accounts query caches

**Tracked notes:** `docs/tracked/phase-3-relationships/first-cut-accounts-contacts-relate.md`

## Fixes — Polymorphic Lookup Fields

**Problem:** Existing contacts with accounts showed "None" in the dropdown, and the account column/detail card were empty.

**Root cause:** Dataverse OData returns polymorphic lookup GUIDs as `_parentcustomerid_value` at runtime, but the generated TypeScript type only declares `parentcustomerid`. Similarly, `parentcustomeridname` isn't populated by the Power Apps SDK.

**Fix:**
1. Created `src/lib/get-parent-account-id.ts` — shared helper using `_parentcustomerid_value` fallback
2. Resolved account names by fetching all accounts via `useAccounts()` and building a lookup map instead of relying on `parentcustomeridname`

**Tracked notes:** `docs/tracked/phase-3-relationships/first-cut-fixes.md`, `docs/tracked/phase-3-relationships/step-2-fixes.md`

## UI Polish

**Prompt:** Replace Company column with Account, drop Phone and Status from contact list, show account on detail card, remove created/modified dates.

**What happened:** Renamed headers, removed columns, updated column counts, cleaned up unused imports.

**Tracked notes:** `docs/tracked/phase-3-relationships/step-2-contact-ui-enhance.md`

## Account List Simplification

**Prompt:** Remove City, Phone, Industry, Status from account list. Add a Contacts column stacked vertically. Add stub columns for CSA, CSAM, AE.

**What happened:**
- Removed four columns (City, Phone, Industry, Status) from the account table
- Added a Contacts column that fetches all contacts via `useContacts()`, builds a `contactsByAccount` map using `getParentAccountId()`, and renders contact names stacked vertically
- Added three placeholder columns (CSA, CSAM, AE) with em dash placeholders for future implementation

**Tracked notes:** `docs/tracked/phase-3-relationships/step-3-account-ui.md`
