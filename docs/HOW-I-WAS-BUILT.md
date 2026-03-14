# How I Was Built

An ELI5 walkthrough of how this Code App was built, including the prompts, decisions, and gotchas.

## Session 1 — Research

**Goal:** Understand what Code Apps are before writing any code.

### Prompts & Outcomes

1. "What are Power Platform Code Apps?" — Learned they're real SPAs in an iframe, Entra auth is free, need Premium license.

2. "How does Dataverse connectivity work?" — Critical discovery: must use **database references** (`pac code add-data-source -a dataverse -t account`), NOT connector references. Using `shared_commondataserviceforapps` compiles but silently fails at runtime.

3. "What does the scaffolding look like from scratch?" — Mapped out the full stack: Vite + React + TS + Tailwind + shadcn/ui + TanStack Query + React Router + Zustand.

4. "What gotchas should I know about?" — Documented six: `$select` with computed fields, iframe routing basename, generated TS dot-notation params, lookup `@odata.bind` syntax, no agentic plugin, CLI confusion.

**Decision:** Don't implement anything yet — just learn and document.

## Session 2 — Build Strategy + First Cut

### Build Strategy Decision

**Prompt:** "Does it make sense to build this app in steps or to get a working first cut out and go from there?"

**Answer:** First cut, then iterate. Three reasons:
1. Too many unknowns — Code Apps are new, gotchas need to be discovered empirically
2. Demo context — need end-to-end proof before polishing
3. The gotchas ARE the content for a tech series

### The Build

**Prompt:** "Build a first cut of a code app using my active pac auth profile. Name it 'Account Management Code App'. Full CRUD. Use the npm CLI, not pac code for as much as we can."

**What happened:**

1. **`npx power-apps` doesn't exist** — the npm CLI referenced in some docs isn't real. Used `pac code` for everything.

2. **Scaffolded Vite + React + TS** — created config files manually (no `npm create vite` since dir wasn't empty).

3. **Tailwind v4 surprise** — npm installed Tailwind v4 (not v3). Had to switch from JS config + PostCSS to `@tailwindcss/vite` plugin + CSS-based config. Vite 8 was also too new — `@tailwindcss/vite` only supports Vite 5-7, and `@vitejs/plugin-react@6` requires Vite 8. Fixed by downgrading to Vite 7 + plugin-react@5.

4. **`pac code init`** — created `power.config.json` pointing at og-dv environment. Required `--displayName` flag.

5. **`pac code add-data-source -a dataverse -t account`** — generated `AccountsService.ts` and `AccountsModel.ts` in `src/generated/`. The model has ~350 lines of types including the `@odata.bind` syntax for lookups (e.g., `"ParentAccountId@odata.bind"?: string`).

6. **shadcn/ui gotcha** — `npx shadcn@latest add` created a literal `@/` directory instead of resolving the path alias to `src/`. Had to move files manually.

7. **Type safety** — `AccountsBase` has required fields (`ownerid`, `owneridtype`, `statecode`) that the platform sets automatically. Had to use `as unknown as` cast for the create mutation.

8. **Build + deploy** — `npx vite build` succeeded (392 KB JS + 25 KB CSS), `pac code push` deployed on first try.

### Result

Full CRUD app deployed to Power Platform in one session:
- List with search, detail view, create/edit dialogs, delete confirmation
- TanStack Query for data fetching with caching and invalidation
- Sonner toasts for user feedback

## Session 3 — Fixing the Deployed Blank Screen

**Problem:** After `pac code push`, the app showed a blank white screen in Power Platform. The local version (`npm run dev` + `pac code run`) worked perfectly — full CRUD, accounts loading, everything.

**Diagnosis:** Browser console showed the JS and CSS assets failing to load. The built `dist/index.html` had absolute paths:

```html
<script src="/assets/index-DYzpMpBK.js"></script>
```

Power Platform serves Code Apps from a nested path (not the domain root), so `/assets/...` pointed to nothing.

**Fix:** Added `base: "./"` to `vite.config.ts`:

```typescript
export default defineConfig({
  base: "./",
  // ...
});
```

This makes built output use relative paths (`./assets/...`), which resolve correctly regardless of hosting path.

**Why local dev wasn't affected:** `pac code run` proxies to `http://localhost:3000/` where Vite serves from the root — absolute and relative paths resolve identically.

**Lesson:** Any SPA deployed to a non-root hosting path needs a relative or explicit base. For Power Platform Code Apps, always set `base: "./"`.

### Also This Session

- Reorganized `docs/tracked/` — moved first-cut docs into `docs/tracked/first-steps/`
- Updated `/track` skill to stop prepending `tracked-` to named doc filenames
