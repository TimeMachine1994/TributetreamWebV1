# Refactoring Plan for TributestreamWeb

## Overview
This document outlines the step-by-step plan to refactor the TributestreamWeb SvelteKit website to align with the desired user flow. The refactor will integrate `MasterStore` and `TributePageStore` for state management, enhance form actions, and improve navigation.

---

## Step 1: Implement Navigation Logic for "My Portal" Button
- Modify `Navbar.svelte` to check if the user is logged in.
- If logged in, redirect to `/family-dashboard`.
- If not logged in, redirect to `/login`.
- Use `getContext` to access authentication state from `TributePageStore`.

---

## Step 2: Refactor Home Page
- Implement a form with `bind:value` to `TributePageStore` for `lovedOnesFullName`.
- Add a "Create" button that expands a second form.
- Implement form actions in `+page.server.ts` to:
  - Register the user.
  - Log them in.
  - Add data to the tributes database.
  - Store tribute details in `TributePageStore`.
  - Redirect to the custom tribute link.

---

## Step 3: Implement Search Functionality
- Fetch all tributes from the `/api/tributes` endpoint.
- Store the results in `TributePageStore.tributeSearchResults`.
- Implement a search input that filters `tributeSearchResults` dynamically.
- Display results on the `/search` page.

---

## Step 4: Refactor Funeral Director Page
- Implement a form with `bind:value` to `MasterStore` for:
  - Funeral director details.
  - Loved one details.
  - User details.
  - Memorial event details.
- Implement form actions in `+page.server.ts` to:
  - Register the user.
  - Log them in.
  - Store tribute details in `TributePageStore`.
  - Store additional metadata in `MasterStore`.
  - Save data to the meta-data endpoint.
  - Redirect to the custom tribute link.

---

## Step 5: Refactor Calculator Page
- Fetch package options from `pages.js`.
- Populate form fields with data from `MasterStore`:
  - `liveStreamDate`, `liveStreamStartTime`, `funeralHomeName`, etc.
- Allow users to edit and overwrite data.
- Implement `$effect` to persist changes.
- Update `MemorialCalculator.svelte` to:
  - Use `$state` for `priceTotal`.
  - Dynamically adjust inputs for multiple locations.

---

## Step 6: Implement Checkout Page
- Populate summary data from `MasterStore`.
- Implement form actions to:
  - Collect billing details.
  - Process payment.
  - Update `isPaymentComplete` in `MasterStore`.

---

## Step 7: Refactor Family Dashboard
- Fetch data from `MasterStore` and `TributePageStore`.
- Display the first location of the livestream.
- Show a schedule of all memorial events.
- Implement "Edit" and "Change Schedule" buttons that redirect to the calculator.

---

## Step 8: Ensure Data Persistence
- Use `$effect` to automatically save data to `localStorage`.
- Load saved data on initialization.
- Ensure consistency between `MasterStore` and `TributePageStore`.

---

## Step 9: Optimize Form Actions
- Standardize form actions across all pages.
- Use `validateRequiredFields` for validation.
- Implement `processFormActionResult` to update stores.
- Use `enhance` for progressive enhancement.

---

## Step 10: Final Testing and Debugging
- Ensure:
  - Navigation works correctly.
  - Data persists across page refreshes.
  - Form actions update the correct stores.
  - API calls return expected results.