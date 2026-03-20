# Live Demo Script — "My Work" Code App

Estimated time: 25–30 minutes.
Pre-requisites: App running via `pac code run` in browser, a few sample accounts/contacts/action items already in Dataverse.

---

## Pre-Demo Checklist

- [ ] Two terminals running: `npm run dev` + `pac code run`
- [ ] Browser open to the `pac code run` URL (NOT localhost:5173 — needs Platform context)
- [ ] VS Code open to the project root with `src/components/` visible in the explorer
- [ ] At least 3 accounts, 5+ contacts, 8+ action items with mixed statuses/priorities in Dataverse
- [ ] At least 1 meeting summary and 1 idea linked to an account
- [ ] Browser zoom set so sidebar + content area are clearly visible on the projector

---

## Act 1 — First Impression (3 min)

### What the audience sees first

> *"This is My Work — a Code App running inside Power Platform on live Dataverse data. Everything you see here is React and TypeScript. Let me orient you."*

**CLICK:** Point to the left sidebar.

> *"Sidebar navigation — grouped into sections. Dashboard at the top, then core entities: Accounts and Contacts. Below that, Activity: Action Items. And Capture: Meeting Summaries and Ideas."*

**CLICK:** Point to the quick create bar at the top.

> *"Quick create bar — five colored pills. Each one creates a new record. One click and you're in a form. If you're on a different page, it navigates you there and opens the form. Fast data entry without hunting for buttons."*

**CLICK:** Point to the dashboard.

> *"The dashboard aggregates action items into KPIs and charts. These are pure CSS and SVG — no charting library. Four KPI cards up top: total items, completion rate, in progress, and high priority. Below that, status breakdown as a donut chart, priority distribution as horizontal bars, work versus personal split, and items by account."*

**Pause.** Let the audience absorb the visual.

> *"All of this is live. Every number comes from Dataverse via TanStack Query, which handles caching, background refetch, and loading states. Change a record and the dashboard updates."*

---

## Act 2 — Accounts & Relationships (5 min)

### Navigate to Accounts

**CLICK:** Sidebar → Accounts.

> *"Accounts list. Searchable table — I can type a name and it filters via OData."*

**TYPE:** A partial account name in the search box. Show results filtering.

> *"Each row shows the account name and a contact count — that's a cross-entity query. Click a row to see the detail."*

### Account Detail

**CLICK:** Click an account row (one with contacts).

> *"Account detail — name, status, industry. And here's the relationship: the contacts linked to this account. This is a live query — Dataverse filtered by the parent customer ID on each contact. I can click through to any contact from here."*

**CLICK:** Close the detail dialog.

### Create an Account

**CLICK:** "New Account" button (or the teal quick-create pill).

> *"Let me create one live. Name, phone, email — standard fields."*

**TYPE:** Fill in a new account: "Contoso School District", phone, email.

**CLICK:** Submit.

> *"Toast notification confirms the save. The list refetches automatically — there's our new account. That write went straight to Dataverse."*

---

## Act 3 — Contacts & Polymorphic Lookups (4 min)

### Navigate to Contacts

**CLICK:** Sidebar → Contacts.

> *"Contacts list. Name, account they belong to, email, job title. The account column is resolved from a polymorphic lookup — Dataverse returns a GUID, and we resolve the display name client-side."*

### Create a Contact

**CLICK:** "New Contact" button (or the blue quick-create pill).

> *"New contact. I'll link them to the account we just created."*

**TYPE:** First name, last name, select the new account from the dropdown, add a job title.

**CLICK:** Submit.

> *"Saved. If I go back to Accounts and open Contoso School District, we'll see this contact in the relationship list."*

**(Optional)** Navigate back and verify — powerful moment to show the relationship is real.

---

## Act 4 — Action Items & Choice Fields (5 min)

### Navigate to Action Items

**CLICK:** Sidebar → Action Items.

> *"Action Items — the workhorse entity. Name, customer, priority badge, status badge, date. The badges are color-coded: red for high priority, green for complete, blue for in progress."*

### Create an Action Item

**CLICK:** "New Action Item" button (or the red quick-create pill labeled "task").

> *"New action item. Name it, pick a customer from the dropdown — that's an OData bind write under the hood. Set a date, priority, status, type."*

**TYPE:** "Follow up on infrastructure grant" — select a customer, set priority to "Top Priority", status to "In Progress", type to "Work".

**CLICK:** Submit.

> *"Created. Notice the priority badge is red — Top Priority. The dashboard numbers just updated too."*

### Edit an Action Item

**CLICK:** Pencil icon on any existing action item.

> *"Edit is the same form, pre-populated. Let me change this one's status to Complete."*

**CLICK:** Change status dropdown to "Complete". Submit.

> *"Updated. Badge changed, and if we check the dashboard..."*

**CLICK:** Sidebar → Dashboard.

> *"Completion rate went up. The donut shifted. All reactive — TanStack Query invalidated the cache and the dashboard re-computed."*

---

## Act 5 — Meeting Summaries & Ideas (3 min)

### Quick Create a Meeting Summary

**CLICK:** Pink "summary" pill in the quick create bar.

> *"Quick create in action — one click took me to Meeting Summaries and opened the form."*

**TYPE:** Title: "Quarterly review — Contoso SD", select the account, add a date, type some notes.

**CLICK:** Submit.

> *"Saved. Fast capture — the point of this section is reducing friction. Same for Ideas."*

### Quick Create an Idea

**CLICK:** Emerald "idea" pill in the quick create bar.

> *"Same pattern. Name the idea, link it to an account and optionally a contact, pick a category."*

**TYPE:** "Copilot Studio for permit tracking", select account, select contact, category: "Copilot Studio".

**CLICK:** Submit.

> *"Now we have a log of ideas tied to real customer records. Searchable, filterable, all in Dataverse."*

---

## Act 6 — Under the Hood (5 min)

### Switch to VS Code

> *"Let me show you what's behind the curtain."*

### Project Structure

**SHOW:** File explorer — `src/components/`, `src/hooks/`, `src/generated/`, `src/stores/`.

> *"Standard React project structure. Components organized by entity. Hooks wrap TanStack Query for each table. The `generated` folder — that's auto-generated by `pac code add-data-source`. Service classes and TypeScript types straight from Dataverse metadata. You don't write that code."*

### A Hook File

**OPEN:** `src/hooks/use-action-items.ts`

> *"Here's the action items hook. `useActionItems` calls the generated service, passes an OData filter. TanStack Query handles caching and background refresh. `useCreateActionItem` is a mutation — on success, it invalidates the query cache so the list refetches. This is the entire data layer for action items. No boilerplate."*

### A Component

**OPEN:** `src/components/action-items/action-item-form-dialog.tsx`

> *"The form dialog. shadcn/ui components — Input, Select, Label, Dialog. Standard React state. On submit, it calls the mutation hook. The interesting line is this one..."*

**HIGHLIGHT:** The `tdvsp_Customer@odata.bind` line.

> *"This is how you write a Dataverse lookup. OData bind syntax — you pass the table path and GUID. The generated types handle the shape, but the bind syntax is something you learn once."*

### The Dashboard (No Chart Library)

**OPEN:** `src/components/dashboard/dashboard.tsx`

> *"The dashboard is pure CSS and SVG. No Chart.js, no D3. SVG circles with stroke-dasharray for the donut, flex divs with percentage widths for the bars. Lightweight, fast, zero dependencies. A great example of where a Code App gives you control that Canvas can't."*

### Quick Create State

**OPEN:** `src/stores/quick-create-store.ts`

> *"Global state is minimal — Zustand. One store, one piece of state: which quick-create target is active. The sidebar sets it, the list page reads it and opens the form. Simple."*

---

## Act 7 — Deploy (2 min)

> *"Let's talk about getting this to production."*

**SHOW:** Terminal.

> *"Two commands."*

```
npm run build
pac code push
```

> *"TypeScript compiles, Vite bundles, `pac code push` deploys to Power Platform. The app shows up in the environment alongside Canvas and Model-Driven apps. Same admin center, same DLP, same security. No Azure App Service, no storage account, no DNS. It's just there."*

---

## Act 8 — Wrap Up (2 min)

> *"So what did we see? A real app — five entities, full CRUD, relationships, a dashboard with live charts — built with React and TypeScript, running on Dataverse, deployed to Power Platform with one command."*

> *"This isn't a toy. It's the same stack your developers already use, wired into the same data and governance your admins already manage. Code Apps don't replace Canvas or Model-Driven — they give you a third option for when you need full control."*

> *"If you're a developer: this is your IDE, your framework, your Git workflow — just plugged into Power Platform. If you're not a developer: the browser experience lets you start with AI and refine from there. Either way, you own the code."*

**Transition back to slides for recap and Q&A.**

---

## Recovery Plays

**If Dataverse is slow or errors:**
> *"Dataverse is live — sometimes the first call takes a moment to warm up. That's the serverless trade-off: you don't pay for idle, but first call can be slower. TanStack Query will retry automatically."*

**If a create fails:**
> *"Let me check the toast — usually a required field. [Fix and resubmit.] The app handles errors gracefully with toast notifications."*

**If the audience asks about Canvas vs Code Apps:**
> *"Great question — slide 6 has the decision matrix. Short version: Canvas for citizen devs, Model-Driven for case management, Code Apps when you need full UI control or your Canvas app hit a wall."*

**If asked about offline / mobile:**
> *"Code Apps are web-first today. For offline or native mobile, Canvas Apps with offline profile is still the play. Code Apps are best for desktop and tablet browser scenarios."*

**If asked about licensing:**
> *"Code Apps use the same Power Apps licensing as Canvas and Model-Driven. No additional license required."*
