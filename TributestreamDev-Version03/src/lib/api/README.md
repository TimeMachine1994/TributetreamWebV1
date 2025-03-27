# TributeStream API Clients

This directory contains the API clients for interacting with the TributeStream API. These clients provide a type-safe and consistent way to interact with the API endpoints.

## API Client Structure

The API clients are organized as follows:

- `api-constants.ts` - Contains constants for API paths and endpoints
- `tribute-api-client-v2.ts` - Base API client with core functionality
- `tribute-api-client-extended-v2.ts` - Extended API client with additional methods
- Entity-specific API clients:
  - `events-api-v2.ts` - Events API client
  - `locations-api.ts` - Locations API client
  - `users-api.ts` - Users API client
  - `funeral-homes-api.ts` - Funeral homes API client
  - `schedules-api.ts` - Schedules API client
- `index.ts` - Exports all API clients for easy importing

## Usage

Import the API clients from the `$lib/api` module:

```typescript
import { 
  tributeApi, 
  eventsApi, 
  locationsApi, 
  usersApi, 
  funeralHomesApi, 
  schedulesApi 
} from '$lib/api';
```

### Example: Fetching tributes for the current user

```typescript
async function fetchUserTributes() {
  // First get the current user
  const userResponse = await usersApi.getCurrentUser();
  
  if (!userResponse.success || !userResponse.data) {
    console.error('Failed to get current user:', userResponse.error);
    return [];
  }
  
  // Then get tributes for the user
  const userId = userResponse.data.data.id;
  const tributesResponse = await usersApi.getTributesByUser(userId);
  
  if (!tributesResponse.success || !tributesResponse.data) {
    console.error('Failed to get tributes:', tributesResponse.error);
    return [];
  }
  
  return tributesResponse.data.tributes;
}
```

### Example: Using the API in a SvelteKit load function

```typescript
// In a +page.server.ts file:
import { eventsApi, locationsApi } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const tributeId = parseInt(params.id);
  
  // Get locations with events
  const locationsResponse = await locationsApi.getLocationsByTribute(tributeId);
  const locations = locationsResponse.success ? locationsResponse.data.locations : [];
  
  // Get active events
  const activeEventsResponse = await eventsApi.getActiveEvents();
  const activeEvents = activeEventsResponse.success ? activeEventsResponse.data.events : [];
  
  return {
    locations,
    activeEvents
  };
};
```

## Response Format

All API methods return responses in the following format:

```typescript
interface ApiResponse<T> {
  success: boolean;         // Whether the request was successful
  data?: T;                 // Response data (when success is true)
  error?: string;           // Error message (when success is false)
  code?: string;            // Error code (when success is false)
  status: number;           // HTTP status code
}
```

## Error Handling

Always check the `success` property of the response before accessing the `data` property:

```typescript
const response = await tributeApi.getTributeById(tributeId);

if (!response.success) {
  console.error('Failed to get tribute:', response.error);
  return;
}

// Now it's safe to access response.data
const tribute = response.data;
```

## Migration from Old API Clients

If you're migrating from the old API clients, here's a quick reference:

| Old API Client | New API Client |
|----------------|---------------|
| `tributeApi` | `tributeApi` |
| `tributeApi.extended` | `extendedTributeApi` |
| `eventsApi` | `eventsApi` |
| N/A | `locationsApi` |
| N/A | `usersApi` |
| N/A | `funeralHomesApi` |
| N/A | `schedulesApi` |

### Key Differences

1. **Response Format**: The new API clients use a consistent response format with `success`, `data`, `error`, and `status` properties.
2. **Error Handling**: The new API clients provide more detailed error information.
3. **Type Safety**: The new API clients are fully typed with TypeScript interfaces.
4. **Entity-Specific Clients**: The new API clients are organized by entity type for better code organization.
5. **Consistent Method Names**: The new API clients use consistent method names across all entities.

### Example Migration

Old code:
```typescript
const tributes = await tributeApi.getTributes();
```

New code:
```typescript
const response = await tributeApi.getTributes();
const tributes = response.success ? response.data.tributes : [];
```

## Additional Examples

See the `examples/api-usage-example.ts` file for more examples of how to use the API clients.