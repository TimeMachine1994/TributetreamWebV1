# Tribute API Implementation

This document outlines the implementation of SvelteKit endpoints and utility files for CRUD operations on the WordPress plugin's tributes tables.

## Overview

The implementation provides a complete solution for interacting with the WordPress plugin's tributes API from a SvelteKit application. It includes:

1. TypeScript interfaces for data structures
2. API utilities for WordPress interactions
3. SvelteKit server endpoints that proxy requests to the WordPress API
4. Svelte store for state management using Svelte 5 runes
5. UI components for listing, viewing, editing, and creating tributes

## File Structure

```
src/
├── lib/
│   ├── api/
│   │   └── services/
│   │       └── tribute-api.service.ts  # Client-side API service
│   ├── stores/
│   │   └── tribute.store.ts            # Svelte 5 runes store
│   ├── types/
│   │   └── tribute.types.ts            # TypeScript interfaces
│   └── utils/
│       └── wp-api.ts                   # WordPress API utilities
└── routes/
    ├── api/
    │   └── wp/
    │       ├── tribute/
    │       │   └── [slug]/
    │       │       └── +server.ts      # Get tribute by slug
    │       ├── tribute-data/
    │       │   └── [tribute_id]/
    │       │       └── +server.ts      # Extended tribute data operations
    │       └── tributes/
    │           ├── +server.ts          # List and create tributes
    │           ├── [id]/
    │           │   └── +server.ts      # Single tribute operations
    │           └── by-user/
    │               └── [user_id]/
    │                   └── +server.ts  # Get tributes by user
    └── tributes/
        ├── +page.svelte                # Tributes list page
        ├── [id]/
        │   └── +page.svelte            # Tribute detail page
        └── new/
            └── +page.svelte            # Create tribute page
```

## TypeScript Interfaces

The `tribute.types.ts` file defines interfaces for:

- `Tribute`: The main tribute entity
- `TributeCreateInput`: Input for creating a tribute
- `TributeUpdateInput`: Input for updating a tribute
- `TributeExtendedData`: Extended tribute data
- `TributePaginatedResponse`: Paginated response for tributes
- `SuccessResponse`: Success response for operations

## API Utilities

The `wp-api.ts` file provides utility functions for:

- Creating headers for WordPress API requests
- Handling WordPress API responses
- Formatting error responses

## API Service

The `tribute-api.service.ts` file provides methods for:

- Getting tributes with pagination
- Getting a single tribute by ID or slug
- Getting tributes by user
- Creating, updating, and deleting tributes
- Managing extended tribute data

## SvelteKit Server Endpoints

The server endpoints proxy requests to the WordPress API:

- `/api/wp/tributes`: GET (list) and POST (create) operations
- `/api/wp/tributes/[id]`: GET, PUT, DELETE operations on a single tribute
- `/api/wp/tributes/by-user/[user_id]`: Get tributes by user
- `/api/wp/tribute/[slug]`: Get a tribute by slug
- `/api/wp/tribute-data/[tribute_id]`: Extended tribute data operations

## Svelte Store

The `tribute.store.ts` file uses Svelte 5 runes for state management:

- State for tributes, current tribute, loading, errors, etc.
- Methods for loading, creating, updating, and deleting tributes
- Methods for managing extended tribute data

## UI Components

The UI components provide a user interface for:

- Listing tributes with pagination and search
- Viewing and editing a single tribute
- Creating a new tribute

## Usage

### Listing Tributes

```typescript
import { tributeStore } from '$lib/stores/tribute.store';

// Load tributes
await tributeStore.loadTributes(page, perPage, searchTerm);

// Access tributes
const tributes = tributeStore.tributes;
```

### Getting a Single Tribute

```typescript
import { tributeStore } from '$lib/stores/tribute.store';

// Load tribute by ID
await tributeStore.loadTributeById(id);

// Load tribute by slug
await tributeStore.loadTributeBySlug(slug);

// Access current tribute
const tribute = tributeStore.currentTribute;
```

### Creating a Tribute

```typescript
import { tributeStore } from '$lib/stores/tribute.store';

// Create tribute
const newTribute = {
  user_id: 1,
  loved_one_name: 'John Doe',
  phone_number: '123-456-7890'
};

await tributeStore.createTribute(newTribute);
```

### Updating a Tribute

```typescript
import { tributeStore } from '$lib/stores/tribute.store';

// Update tribute
const updates = {
  loved_one_name: 'Updated Name',
  custom_html: '<p>Custom HTML content</p>'
};

await tributeStore.updateTribute(id, updates);
```

### Deleting a Tribute

```typescript
import { tributeStore } from '$lib/stores/tribute.store';

// Delete tribute
await tributeStore.deleteTribute(id);
```

### Managing Extended Data

```typescript
import { tributeStore } from '$lib/stores/tribute.store';

// Load extended data
await tributeStore.loadTributeData(tributeId);

// Create or replace extended data
await tributeStore.createOrReplaceTributeData(tributeId, {
  notes: 'Some notes',
  preferences: { theme: 'dark' }
});

// Update extended data
await tributeStore.updateTributeData(tributeId, {
  notes: 'Updated notes'
});
```

## WordPress Plugin Integration

This implementation integrates with the WordPress plugin's API endpoints:

- `tributestream/v1/tributes`: List and create tributes
- `tributestream/v1/tributes/{id}`: Single tribute operations
- `tributestream/v1/tributes/by-user/{user_id}`: Get tributes by user
- `tributestream/v1/tribute/{slug}`: Get a tribute by slug
- `tributestream/v1/tribute-data/{tribute_id}`: Extended tribute data operations

The SvelteKit server endpoints proxy requests to these WordPress API endpoints, handling authentication, error handling, and response formatting.