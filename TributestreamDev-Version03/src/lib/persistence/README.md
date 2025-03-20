# Tributestream Persistence Layer

This directory contains the enhanced persistence layer for the Tributestream application, providing a robust interface for reading and writing user metadata, form data, and tribute information.

## Overview

The persistence layer sits between the UI components and the WordPress API, serving as a unified interface that adds several important capabilities:

1. **Caching**: Reduces API calls by storing recently accessed data in memory
2. **Error Handling**: Implements retry logic and graceful failure mechanisms
3. **Data Transformation**: Standardizes data formats across the application
4. **Reactive State**: Provides Svelte stores that automatically update when data changes
5. **Type Safety**: Ensures consistent data types throughout the application

## Architecture

The persistence layer follows a mediator pattern that centralizes all data access operations:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  SvelteKit    │     │  Persistence  │     │   WordPress   │
│  Components   │────▶│     Layer     │────▶│      API      │
└───────────────┘     └───────────────┘     └───────────────┘
                            │  ▲
                            │  │
                            ▼  │
                      ┌───────────────┐
                      │    Cache &    │
                      │  Svelte Store │
                      └───────────────┘
```

## Features

### Caching

The persistence layer implements a time-based caching strategy:

- Cache entries expire after 5 minutes (configurable)
- Force refresh option to bypass the cache
- Automatic cache invalidation when related data is updated

### Reactive Svelte Stores

For each data type, the persistence layer provides Svelte stores that automatically update:

```typescript
// Example usage in a component
import { tributePersistence } from '$lib/persistence/tribute-persistence';

// Get a reactive store for form data
const formDataStore = tributePersistence.getFormDataStore(userId);

// The store will be automatically populated and updated
$: formData = $formDataStore;
```

### Error Recovery

The persistence layer includes sophisticated error handling:

- Automatic retry with exponential backoff
- Detailed error information for debugging
- Fallback mechanisms for partial data availability

### Data Validation

Before saving data, the persistence layer validates it to ensure integrity:

- Required fields are present
- Data types are correct
- Formats are valid (emails, phone numbers, dates)

## Using the Persistence Layer

### Initialize with Authentication

```typescript
import { tributePersistence } from '$lib/persistence/tribute-persistence';
import { TributeApiClient } from '$lib/api/tribute-api-client';

// When user authenticates, update the API client
if (locals.authenticated && locals.token) {
  const apiClient = new TributeApiClient(locals.token);
  tributePersistence.setApiClient(apiClient);
}
```

### Get and Save Form Data

```typescript
// Get form data
const formDataResult = await tributePersistence.getFormData(userId);

if (formDataResult.success && formDataResult.data) {
  // Use the data
  const formData = formDataResult.data;
  
  // Display or process form data
}

// Save form data
const saveResult = await tributePersistence.saveFormData(userId, formData);

if (saveResult.success) {
  // Data saved successfully
} else {
  // Handle error with saveResult.error
}
```

### Working with Tributes

```typescript
// Get tributes for a user
const tributesResult = await tributePersistence.getTributesByUser(userId);

// Get a specific tribute
const tributeResult = await tributePersistence.getTributeById(tributeId);

// Create a new tribute
const createResult = await tributePersistence.createTribute({
  user_id: userId,
  loved_one_name: 'John Doe',
  phone_number: '555-123-4567'
});

// Update a tribute
const updateResult = await tributePersistence.updateTribute(tributeId, {
  loved_one_name: 'Updated Name'
});
```

## Benefits

This persistence layer offers several key benefits:

1. **Improved Performance**: Reduces API calls and load times through caching
2. **Consistent Interface**: Standardizes data access patterns throughout the application
3. **Easier Debugging**: Centralizes data access logic for simpler debugging
4. **Better UX**: Provides more responsive interfaces with reactive stores
5. **Resilience**: Handles network and server errors gracefully
6. **Maintainability**: Simplifies making future changes to data access patterns

## Integration with SvelteKit Components

The persistence layer is designed to work seamlessly with SvelteKit's server-side and client-side components:

- In `+page.server.ts` files, it provides efficient data loading for SSR
- In client components, it offers reactive stores for dynamic updates
- Form actions can leverage its validation and error handling

## Future Enhancements

Potential future improvements to the persistence layer:

1. Persistent browser storage (IndexedDB) for offline capabilities
2. Conflict resolution for concurrent edits
3. Optimistic UI updates before server confirmation
4. Advanced data synchronization between devices
5. Pagination and filtering support for larger datasets