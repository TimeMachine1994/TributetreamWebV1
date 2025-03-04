# Form Actions Implementation Guide

## Overview

This document explains the implementation of SvelteKit form actions with the master store pattern. It covers:

1. How form actions are structured
2. How they interact with the master store
3. How to implement form actions on new pages

## Architecture

### Form Actions Flow

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Form Submit  │────▶│  Server-side  │────▶│  Client-side  │
│   (Browser)   │     │  Form Action  │     │   Handling    │
└───────────────┘     └───────────────┘     └───────────────┘
                              │                      │
                              ▼                      ▼
                      ┌───────────────┐     ┌───────────────┐
                      │    Validate   │     │ Update Master │
                      │     Data      │     │     Store     │
                      └───────────────┘     └───────────────┘
                              │                      │
                              ▼                      ▼
                      ┌───────────────┐     ┌───────────────┐
                      │  Return Data  │     │     Save      │
                      │   Structure   │     │ to LocalStorage│
                      └───────────────┘     └───────────────┘
```

### Key Components

1. **+page.server.ts** - Contains form actions that validate and process data
2. **Master Store** - Maintains application state
3. **Form Action Helpers** - Bridges server-side actions and client-side state

## Implementation Details

### 1. Form Action in +page.server.ts

Form actions are defined in `+page.server.ts` files:

```typescript
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { validateRequiredFields } from '$lib/utils/form-action-helpers';

export const actions: Actions = {
  saveData: async ({ request }) => {
    // Get form data
    const formData = await request.formData();
    
    // Validate (example for required fields)
    const { isValid, missingFields } = validateRequiredFields(
      formData, 
      ['fieldName1', 'fieldName2']
    );
    
    if (!isValid) {
      return fail(400, { 
        error: true, 
        message: "Required fields are missing: " + missingFields.join(', ') 
      });
    }

    // Return data structure that matches master store sections
    return {
      success: true,
      data: {
        // Include only the sections you want to update
        sectionName: {
          property1: formData.get('fieldName1'),
          property2: formData.get('fieldName2')
        }
      }
    };
  }
};
```

### 2. Form in +page.svelte

The page component uses `enhance` for progressive enhancement and sets up the form for server-side processing:

```svelte
<script lang="ts">
  import { getMasterStoreContext } from '$lib/stores/master-store.svelte';
  import { enhance } from '$app/forms';
  import { processFormActionResult } from '$lib/utils/form-action-helpers';
  
  let { form } = $props();
  const masterStore = getMasterStoreContext();
  
  // Process form action results
  $effect(() => {
    processFormActionResult(form, masterStore, '/next-page');
  });
</script>

<form method="POST" action="?/saveData" use:enhance>
  <input name="fieldName1" value={masterStore.sectionName.property1 || ''} />
  <input name="fieldName2" value={masterStore.sectionName.property2 || ''} />
  
  {#if form?.error}
    <p class="error">{form.message}</p>
  {/if}
  
  <button type="submit">Submit</button>
</form>
```

### 3. Form Action Helpers

The `form-action-helpers.ts` file provides utility functions for consistent handling:

```typescript
// Core function that processes form action results
export function processFormActionResult(
  form: FormActionResult | null | undefined,
  masterStore: MasterStore,
  nextPage?: string
): void {
  if (!form?.success || !form?.data) return;

  // Update store sections based on data returned from form action
  Object.entries(form.data).forEach(([section, data]) => {
    // Call the appropriate update method based on section
    switch (section) {
      case 'directorInfo':
        masterStore.updateDirectorInfo(data);
        break;
      case 'lovedOneInfo':
        masterStore.updateLovedOneInfo(data);
        break;
      // ... other sections
    }
  });

  // Persist changes
  masterStore.saveToLocalStorage();

  // Navigate if needed
  if (nextPage && typeof window !== 'undefined') {
    window.location.href = nextPage;
  }
}
```

## Adding Form Actions to a New Page

To add form actions to a new page:

1. **Create +page.server.ts**
   - Define form actions that process and validate form data
   - Return standardized result objects with `success`, `data`, and optional `error`/`message`

2. **Update +page.svelte**
   - Add `method="POST"` and `action="?/actionName"` to your form
   - Use `enhance` for progressive enhancement
   - Use `processFormActionResult` in an effect to update the master store

3. **Use Helper Functions**
   - Use `validateRequiredFields` for consistent validation
   - Use `processFormActionResult` for consistent store updates

## Form Action Naming Conventions

For clarity and consistency, use these action naming conventions:

- `save[Section]`: For saving a specific section (e.g., `saveLovedOne`, `saveDirectorInfo`)
- `update[Section]`: For updating an existing section
- `complete[Process]`: For completing a process (e.g., `completePayment`)
- `process[Form]`: For generic form processing

## Server-Client State Management

The implementation uses a hybrid approach:
1. Server-side validation and processing
2. Client-side state management with the master store
3. A bridge between them using standardized response structures

This approach ensures:
- Progressive enhancement for non-JS users
- Consistent state management
- Proper validation on both server and client