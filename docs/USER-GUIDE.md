# User Guide

## Opening the App

The app runs inside Power Platform. After deployment (`pac code push`), open the URL provided in the output or find it in make.powerapps.com under Apps.

## Account List

The main screen shows all Dataverse accounts in a table with columns: Name, City, Phone, Industry, Status.

- **Search** — type in the search box to filter accounts by name (server-side OData filter)
- **Click a row** — opens the detail view
- **Edit button** — opens the edit form for that account
- **Delete button** — shows a confirmation dialog before deleting

## Creating an Account

1. Click **New Account** in the top right
2. Fill in the form (only Account Name is required)
3. Click **Create**
4. A success toast appears and the list refreshes

### Available fields:
- Account Name (required)
- Account Number
- Phone
- Email
- Website
- Street, City, State, Zip
- Description

## Viewing Account Details

Click any row to open the detail dialog showing:
- Status badge and industry
- Contact info (phone, email, website)
- Address
- Description
- Owner, created/modified timestamps

Click **Edit** from the detail view to switch to the edit form.

## Editing an Account

1. Click **Edit** on a row or from the detail view
2. Modify fields
3. Click **Save Changes**
4. Only changed fields are sent to Dataverse (partial update)

## Deleting an Account

1. Click **Delete** on a row
2. Confirm in the dialog
3. The account is permanently removed from Dataverse
