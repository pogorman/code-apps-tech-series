# User Guide

## Overview

This Code App provides a CRM-style interface for managing accounts, contacts, and action items stored in Dataverse. The app uses a Microsoft Fluent Design-inspired theme with Microsoft Blue accents and a gradient accent bar at the top of the page. Navigation is via square icon tiles under the title bar — click a tile to switch views.

## Accounts

### Viewing Accounts

The Accounts page shows a page header with icon, a search bar, and a data table with Microsoft Blue column headers. Columns: Name, Contacts, CSA, CSAM, AE, and Actions. The Contacts column lists all contacts linked to the account, stacked vertically. CSA, CSAM, and AE are placeholder columns for future use. Click any row to open the account detail card.

### Account Detail Card

Shows account info (phone, email, website, address, description) plus a **Contacts** section listing all contacts linked to this account. Click a contact to navigate to the Contacts page.

### Creating an Account

Click **New Account** to open the form. Fill in the fields and click **Create**. Only the Name field is required.

### Editing / Deleting

Use the **Edit** and **Delete** buttons in the Actions column, or click **Edit** from the detail card.

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

Use the **Edit** and **Delete** buttons in the Actions column, or click **Edit** from the detail card.

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

Use the **Edit** and **Delete** buttons in the Actions column, or click **Edit** from the detail card.
