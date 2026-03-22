# User Guide

## Overview

This Code App provides a "My Work" interface for managing accounts, contacts, action items, meeting summaries, and ideas stored in Dataverse. The app uses a Microsoft Fluent Design-inspired theme with a left vertical sidebar for navigation and a top quick create bar for fast record creation.

**Left Sidebar** — Briefcase icon + "My Work" brand at the top. Grouped navigation (core: Accounts/Contacts, activity: Action Items, capture: Meetings/Ideas). Active page is highlighted with a cyan left border. Dashboard is the home view.

**Quick Create Bar** — Colored pill buttons across the top of the content area, ordered to match the sidebar nav. Click any button to navigate to that entity's list and immediately open a new record form. Buttons (left to right): account, contact, task (action item), summary (meeting), idea.

## Dashboard

The Dashboard is the home view, showing action item analytics.

### KPI Cards (top row)

Four summary cards: Total Items, Completion Rate, In Progress, and High/Top Priority. Hover any card to see a tooltip with item count and first 4 item names. Click to open a drilldown table showing all matching action items.

### Charts (bottom row)

Four visualizations: Status Breakdown (donut), Priority Distribution (horizontal bars), Work vs Personal (progress bars), and Items by Account (horizontal bars). Each sub-element (individual status row, priority bar, type row, account row) is independently hoverable and clickable. Hover for a tooltip preview; click for a full drilldown table.

### Drilldown Dialog

Clicking any dashboard element opens a dialog with a filtered table of action items. Columns: Name, Customer, Priority (color-coded badge), Status (color-coded badge), and Date. The dialog scrolls internally for long lists.

## Accounts

### Viewing Accounts

The Accounts page shows a page header with icon, a search bar, and a data table with Microsoft Blue column headers. Columns: Name, Contacts, CSA, CSAM, AE, and Actions. The Contacts column lists all contacts linked to the account, stacked vertically. CSA, CSAM, and AE are placeholder columns for future use. Click any row to open the account detail card.

### Account Detail Card

Shows account info (phone, email, website, address, description) plus a **Contacts** section listing all contacts linked to this account. Click a contact to navigate to the Contacts page.

### Creating an Account

Click **New Account** to open the form. Fill in the fields and click **Create**. Only the Name field is required.

### Editing / Deleting

Use the pencil (edit) and trash (delete) icons in the Actions column, or click **Edit** from the detail card.

## Contacts

### Viewing Contacts

The Contacts page shows a page header with icon, a search bar, and a data table with Microsoft Blue column headers. Columns: Name, Account, Email, Job Title, and Actions. Click any row to open the contact detail card.

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

The Action Items page shows a page header with icon, a search bar, and a data table. Columns: Name, Customer, Priority, Status, Date, and Actions. Priority and Status display as color-coded badges. Click any row to open the detail card.

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

The Meetings page shows a page header with a FileText icon, a search bar, and a data table. Columns: Title, Account, Date, and Actions. Click any row to open the detail card.

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

## Command Palette (Ctrl+K)

Press **Ctrl+K** (or **Cmd+K** on Mac) anywhere in the app to open a global search dialog. Type to search across all records — accounts, contacts, action items, meeting summaries, and ideas. Results are grouped by entity type with matching text highlighted in purple. Click a result to navigate to that entity's page. Press **Esc** to close. A "Ctrl+K to search" hint appears in the sidebar footer.

## Ideas

### Viewing Ideas

The Ideas page shows a page header with a Lightbulb icon, a search bar, and a data table. Columns: Name, Account, Category (as a color-coded badge), and Actions. Click any row to open the detail card.

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
