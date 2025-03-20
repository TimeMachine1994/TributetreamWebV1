# My Portal Implementation Plan

## Overview
The goal is to create a "My Portal" where users can reload their previously submitted `fd-form` data, make changes, and save updates to the database.

## Implementation Plan

### 1. Create a "My Portal" Page
- Add a new route: `/my-portal`
- This page will:
  - Fetch the user's previously submitted form data.
  - Prefill the `fd-form` with the retrieved data.
  - Allow users to update and resubmit the form.

### 2. Fetch Existing Form Data
- Modify `my-portal/+page.server.ts` to:
  - Retrieve the authenticated user's stored form data from WordPress.
  - Return the data to the frontend for pre-filling the form.

### 3. Prefill the Form in `my-portal/+page.svelte`
- Modify `my-portal/+page.svelte` to:
  - Accept the fetched form data as props.
  - Populate the form fields with the retrieved data.

### 4. Handle Form Updates
- Modify `fd-form/+page.server.ts` to:
  - Detect if the user is updating an existing form.
  - Update the stored metadata in WordPress instead of creating a new entry.

### 5. Ensure Authentication
- Users must be logged in to access `/my-portal`.
- If not authenticated, redirect them to the login page.

### 6. UI Enhancements
- Add a "Save Changes" button in `my-portal/+page.svelte`.
- Display success/error messages after submission.

## Data Flow Diagram
```mermaid
sequenceDiagram
    participant User
    participant MyPortalPage
    participant Server
    participant WordPressDB

    User->>MyPortalPage: Navigate to /my-portal
    MyPortalPage->>Server: Fetch stored form data
    Server->>WordPressDB: Retrieve user form data
    WordPressDB-->>Server: Return stored data
    Server-->>MyPortalPage: Send form data
    MyPortalPage-->>User: Prefill form fields

    User->>MyPortalPage: Modify form and submit
    MyPortalPage->>Server: Send updated form data
    Server->>WordPressDB: Update stored data
    WordPressDB-->>Server: Confirm update
    Server-->>MyPortalPage: Return success message
    MyPortalPage-->>User: Show confirmation