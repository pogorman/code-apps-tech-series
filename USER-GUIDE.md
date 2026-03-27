# User Guide

## Overview

This Code App provides a "My Work" interface for managing accounts, contacts, action items, meeting summaries, ideas, and projects stored in Dataverse. All views show active records only. The app uses a Microsoft Fluent Design-inspired theme with a left vertical sidebar for navigation and a top quick create bar for fast record creation.

**Left Sidebar** — Briefcase icon + "My Work" brand at the top. Grouped navigation sections: insights (Dashboard, My Board), activity (Action Items), capture (Ideas, Meetings, Projects), core (Accounts, Contacts). Nav icons are colored to match their quick create counterparts. Active page is highlighted with a cyan left border.

**Quick Create Bar** — Colored pill buttons across the top of the content area. Buttons (left to right): work, personal, learning (these three open the action item form with the task type pre-selected), idea, meeting, project (violet), account, contact. Click any button to navigate to that entity's list and immediately open a new record form.

## Dashboard

The Dashboard is the home view, showing action item analytics.

### KPI Cards (top row)

Four summary cards: Total Items, Completion Rate, In Progress, and High/Top Priority. Hover any card to see a tooltip with item count and first 4 item names. Click to open a drilldown table showing all matching action items.

### Charts (bottom row)

Four visualizations: Status Breakdown (donut), Priority Distribution (horizontal bars), Work vs Personal (progress bars), and Items by Account (horizontal bars). Each sub-element (individual status row, priority bar, type row, account row) is independently hoverable and clickable. Hover for a tooltip preview; click for a full drilldown table.

### Drilldown Dialog

Clicking any dashboard element opens a dialog with a filtered table of action items. Columns: Name, Customer, Priority (color-coded badge), Status (color-coded badge), and Date. The dialog scrolls internally for long lists.

## Board (Kanban View)

Click **My Board** in the sidebar to open a Kanban-style view with four columns:

- **Parking Lot** (green accent, Car icon) — Items pinned from any entity. Cards show an entity-type icon (Briefcase, FolderKanban, Lightbulb, or FileText) inline with the title instead of a text badge.
- **Work** (dynamic accent) — Active action items (excludes Recognized and Complete). Cards show name, 1-line description snippet, and outline-style priority/status pills. The column header has tiny circle filter pills (A/W/P/L). The column's accent color, icon, and title change based on the active filter: All (gray), Work (red), Personal (blue), Learning (magenta).
- **Projects** (purple accent, FolderKanban icon) — All project records. Cards show project name and priority pill.
- **Ideas** (amber accent, Lightbulb icon) — All ideas. Cards show idea name and category pill.

Columns have glass-morphism sticky headers (frosted blur effect) with an overlapping accent-colored count badge. Empty columns show a large faded icon. Cards have subtle priority-tinted gradient backgrounds, hover lift animation, and compact `text-xs` titles.

### Floating Card Toolbar

Hover over any card to reveal a floating toolbar above the card. The toolbar contains: a drag grip handle (GripVertical), priority color dots (5 colors), an edit pencil button, and a pin button. Click the pencil to open the entity's edit form. Click the pin to toggle the item in/out of parking lot. The pin button is green when pinned.

### Drag-and-Drop

**Within-column:** Grab any card and drag it up or down to reorder. The sort order is saved in localStorage and persists across sessions.

**Cross-column:** Drag a card from work, projects, or ideas into the parking lot to pin it. Drag a parking lot card to any other column to unpin it. Cross-column drag does not change record status or move items between entity types.

## View Toggle (Table / Card)

All entity lists (including Projects) include a view toggle in the toolbar (between the search bar and the "New" button). Two modes are available:

- **Table view** (list icon) — Traditional data table with column headers. Default view.
- **Card view** (grid icon) — Responsive card grid (up to 3 columns). Each card shows key fields, edit/delete buttons, and is clickable to open the detail dialog.

Your preference is saved per entity and persists across sessions.

## Priority Color-Coding (Card View)

In card view, hover over any card to reveal a row of 5 colored dots at the top:

- **Clear** — no color (default)
- **Blue** — low priority
- **Orange** — medium priority
- **Red** — high priority
- **Dark Red** — top priority

Click a dot to set the card's color. For **action items** and **ideas**, clicking a dot immediately updates the `tdvsp_priority` field in Dataverse — no save needed. For **accounts**, the color is saved in localStorage (accounts don't have a priority field in Dataverse). The card background updates to reflect the chosen priority color.

## Accounts

### Viewing Accounts

The Accounts page shows a page header with icon, a search bar, a view toggle, and a data table with Microsoft Blue column headers. Columns: Name, Contacts, CSA, CSAM, AE, and Actions. The Contacts column lists all contacts linked to the account, stacked vertically. CSA, CSAM, and AE are placeholder columns for future use. Click any row to open the account detail card. In card view, each card shows the account name and linked contacts.

### Account Detail Card

Shows account info (phone, email, website, address, description) plus a **Contacts** section listing all contacts linked to this account. Click a contact to navigate to the Contacts page.

### Creating an Account

Click **New Account** to open the form. Fill in the fields and click **Create**. Only the Name field is required.

### Editing / Deleting

Use the pencil (edit) and trash (delete) icons in the Actions column, or click **Edit** from the detail card.

## Contacts

### Viewing Contacts

The Contacts page shows a page header with icon, a search bar, a view toggle, and a data table with Microsoft Blue column headers. Columns: Name, Account, Email, Job Title, and Actions. Click any row to open the contact detail card. In card view, each card shows name, account, email, and job title.

### Contact Detail Card

Shows contact info (account, job title, email, phone, mobile, address, description) and the record owner.

### Creating a Contact

Click **New Contact** to open the form. Select an **Account** from the dropdown to link the contact. Last Name is required.

### Setting the Account

The Account dropdown in the contact form shows all accounts. Select one to link, or choose "None" to clear the association. Changes are saved to Dataverse on submit.

### Editing / Deleting

Use the pencil (edit) and trash (delete) icons in the Actions column, or click **Edit** from the detail card.

## Action Items

### Viewing Action Items

The Action Items page shows a page header with icon, a search bar, a view toggle, and a data table. Columns: Name, Customer, Priority, Status, Date, and Actions. Priority and Status display as color-coded badges. Click any row to open the detail card. In card view, each card shows name, customer, priority/status badges, and date.

### Action Item Detail Card

Shows action item info with badges for state, priority, status, and type. Displays customer, date, and description. Click **Edit** to modify.

### Creating an Action Item

Click **New Action Item** to open the form. Fields:
- **Name** (required) — the action item title
- **Customer** — select an account from the dropdown
- **Date** — target or due date
- **Priority** — Eh, Low, High, or Top Priority
- **Status** — Recognized, In Progress, Pending Comms, On Hold, Wrapping Up, or Complete
- **Type** — Personal or Work
- **Description** — free-text notes

### Editing / Deleting

Use the pencil (edit) and trash (delete) icons in the Actions column, or click **Edit** from the detail card.

## Meeting Summaries

### Viewing Meeting Summaries

The Meetings page shows a page header with a FileText icon, a search bar, a view toggle, and a data table. Columns: Title, Account, Date, and Actions. Click any row to open the detail card. In card view, each card shows title, account, and date.

### Meeting Summary Detail Card

Shows meeting info with active/inactive badge, account name, date, and summary text. Click **Edit** to modify.

### Creating a Meeting Summary

Click **New Summary** to open the form. Fields:
- **Title** (required) — the meeting title
- **Account** — select an account from the dropdown
- **Date** — meeting date
- **Summary** — detailed meeting notes (large text area)

### Extract Action Items with AI

On the Meetings list, click the sparkle (AI) icon on any row to extract action items from the meeting notes using Azure OpenAI. A dialog shows the extracted items with name, priority, due date, and notes. You can edit or remove items before confirming. On confirm, each item is created as an action item in Dataverse, linked to the meeting's account.

> **Note:** This feature requires Azure OpenAI to be configured. If not configured, a toast notification will appear instead.

### Editing / Deleting

Use the pencil (edit) and trash (delete) icons in the Actions column, or click **Edit** from the detail card.

## Projects

### Viewing Projects

The Projects page shows a page header with a FolderKanban icon, a search bar, a view toggle, and a data table. Columns: Name, Account, Priority (as a color-coded badge), and Actions. Click any row to open the detail card. In card view, each card shows name, account, and priority badge.

### Project Detail Card

Shows project info with account name, priority, and description. Click **Edit** to modify.

### Creating a Project

Click **New Project** to open the form. Fields:
- **Name** (required) — the project title
- **Account** — select an account from the dropdown
- **Priority** — Eh, Low, High, or Top Priority
- **Description** — free-text notes

### Editing / Deleting

Use the pencil (edit) and trash (delete) icons in the Actions column, or click **Edit** from the detail card.

## Command Palette (Ctrl+K)

Press **Ctrl+K** (or **Cmd+K** on Mac) anywhere in the app to open a global search dialog. Type to search across all records — accounts, contacts, action items, meeting summaries, ideas, and projects. Results are grouped by entity type with matching text highlighted in purple. Click a result to navigate to that entity's page. Press **Esc** to close. A "Ctrl+K to search" hint appears in the sidebar footer.

## Ideas

### Viewing Ideas

The Ideas page shows a page header with a Lightbulb icon, a search bar, a view toggle, and a data table. Columns: Name, Account, Category (as a color-coded badge), and Actions. Click any row to open the detail card. In card view, each card shows name, account, and category badge.

### Idea Detail Card

Shows idea info with active/inactive badge and category badge. Displays account, contact, and description. Click **Edit** to modify.

### Creating an Idea

Click **New Idea** to open the form. Fields:
- **Name** (required) — the idea title
- **Category** — Copilot Studio, Canvas Apps, Model-Driven Apps, Power Automate, Power Pages, Azure, AI General, App General, or Other
- **Account** — select an account from the dropdown
- **Contact** — select a contact from the dropdown
- **Description** — free-text notes

### Editing / Deleting

Use the pencil (edit) and trash (delete) icons in the Actions column, or click **Edit** from the detail card.
