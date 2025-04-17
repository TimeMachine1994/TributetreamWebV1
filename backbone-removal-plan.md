# Plan for Removing Backbone.js Dependency

Based on the search results, this document outlines a comprehensive plan to remove Backbone.js as a dependency from the TributeStream SvelteKit 5 project. This plan details what files need to be modified, how to replace Backbone functionality with Svelte 5's native reactivity system, and the implementation order.

## 1. Files to Modify or Replace

### Core Backbone Implementation Files
These files need to be completely replaced or refactored:

1. `src/lib/services/wp-backbone-service.js` - Contains `initializeBackbone` and `tributeService`
2. `src/lib/backbone/model-registry.js` - Handles model registration
3. `src/lib/backbone/validation.js` - Contains validation logic
4. `src/lib/backbone/ssr-collection.js` - Contains collection pagination
5. `src/lib/models/wp-backbone.js` - Contains the TributesCollection

### Components Using Backbone
These components need to be updated to use Svelte 5's reactivity system:

1. `src/lib/components/tribute-list.svelte` - Uses `backboneInitialized` flag

### Pages/Routes Using Backbone
These pages need to be updated to use the new service:

1. `src/routes/my-portal/dashboard/+layout.svelte`
2. `src/routes/my-portal/dashboard/+page.svelte`
3. `src/routes/my-portal/dashboard/tributes/+page.svelte`
4. `src/routes/my-portal/dashboard/tributes/new/+page.svelte`
5. `src/routes/my-portal/dashboard/tributes/[id]/+page.svelte`
6. `src/routes/my-portal/dashboard/tributes/[id]/edit/+page.svelte`
7. `src/routes/my-portal/dashboard/profile/+page.svelte`

### Stores
1. `src/lib/stores/tribute-store.svelte.ts` - Uses Backbone model-registry, validation, and collections

### Dependencies
1. `package.json` - Remove "backbone": "^1.6.1"
2. `package-lock.json` - Will be updated automatically when running npm install

## 2. Replacement Strategy

### 2.1 Create Modern Replacements

1. **Replace Models with Svelte 5 Stores**
   - Create a new `src/lib/stores/tribute-store.ts` using Svelte 5's `$state` and `$derived` runes
   - Implement CRUD operations using fetch API directly

2. **Replace Collections with Array-based Stores**
   - Use `$state` with arrays for collections
   - Implement pagination logic with `$derived` for computed properties

3. **Replace Validation Logic**
   - Create a new `src/lib/utils/validation.ts` with pure functions for validation
   - Use Svelte 5's reactivity to trigger validation

4. **Create a New Service Layer**
   - Implement `src/lib/services/tribute-service.ts` to replace `wp-backbone-service.js`
   - Use fetch API for data retrieval and manipulation

## 3. Implementation Order

1. **Create Core Stores and Utilities**
   - Implement the new stores with Svelte 5's reactivity system
   - Create validation utilities

2. **Create Service Layer**
   - Implement the new service layer that uses the stores

3. **Update Components**
   - Refactor components to use the new stores and services

4. **Update Pages/Routes**
   - Update all pages to use the new services

5. **Remove Backbone Dependencies**
   - Remove Backbone from package.json
   - Remove or archive old Backbone files

6. **Test and Fix Issues**
   - Test all functionality
   - Fix any issues that arise

## 4. Detailed Implementation Examples

### 4.1 Create New Tribute Store

```typescript
// src/lib/stores/tribute-store.ts
import type { Tribute } from '$lib/types/wp-models';

// Create reactive state for tributes
let tributes = $state<Tribute[]>([]);
let isLoading = $state(false);
let error = $state<string | null>(null);

// Derived values
let tributeCount = $derived(tributes.length);

// Fetch tributes from API
async function fetchTributes() {
  isLoading = true;
  error = null;
  
  try {
    const response = await fetch('/api/tributes');
    if (!response.ok) throw new Error('Failed to fetch tributes');
    
    const data = await response.json();
    tributes = data;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
  } finally {
    isLoading = false;
  }
}

// CRUD operations
async function createTribute(tribute: Omit<Tribute, 'id'>) {
  // Implementation
}

async function updateTribute(id: string, tribute: Partial<Tribute>) {
  // Implementation
}

async function deleteTribute(id: string) {
  // Implementation
}

async function getTributeById(id: string) {
  // Implementation
}

// Export the store
export const tributeStore = {
  get tributes() { return tributes; },
  get isLoading() { return isLoading; },
  get error() { return error; },
  get tributeCount() { return tributeCount; },
  fetchTributes,
  createTribute,
  updateTribute,
  deleteTribute,
  getTributeById
};
```

### 4.2 Create Validation Utilities

```typescript
// src/lib/utils/validation.ts
import type { Tribute } from '$lib/types/wp-models';

export function validateTribute(tribute: Partial<Tribute>): { isValid: boolean, errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  // Validation logic here
  if (!tribute.name) errors.name = 'Name is required';
  // More validation rules...
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Other validation functions...
```

### 4.3 Create New Service Layer

```typescript
// src/lib/services/tribute-service.ts
import { tributeStore } from '$lib/stores/tribute-store';
import type { Tribute } from '$lib/types/wp-models';

// Service methods
async function getAllTributes() {
  await tributeStore.fetchTributes();
  return tributeStore.tributes;
}

async function getTributeById(id: string) {
  return tributeStore.getTributeById(id);
}

async function createTribute(tribute: Omit<Tribute, 'id'>) {
  return tributeStore.createTribute(tribute);
}

async function updateTribute(id: string, tribute: Partial<Tribute>) {
  return tributeStore.updateTribute(id, tribute);
}

async function deleteTribute(id: string) {
  return tributeStore.deleteTribute(id);
}

// Export the service
export const tributeService = {
  getAllTributes,
  getTributeById,
  createTribute,
  updateTribute,
  deleteTribute
};
```

### 4.4 Update Components

```svelte
<!-- src/lib/components/tribute-list.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { tributeService } from '$lib/services/tribute-service';
  import type { Tribute } from '$lib/types/wp-models';
  
  let tributes = $state<Tribute[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  
  onMount(async () => {
    try {
      tributes = await tributeService.getAllTributes();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load tributes';
    } finally {
      isLoading = false;
    }
  });
</script>

<!-- Component template -->
```

## 5. Package.json Updates

Remove Backbone and related dependencies:

```diff
// package.json
{
  "dependencies": {
-   "backbone": "^1.6.1",
    // other dependencies...
  },
  "devDependencies": {
-   "@types/backbone": "^1.4.23",
    // other dev dependencies...
  }
}
```

This plan provides a comprehensive approach to removing Backbone.js from your project while maintaining functionality using Svelte 5's modern reactivity system.