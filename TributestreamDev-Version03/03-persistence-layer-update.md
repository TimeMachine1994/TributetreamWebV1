# Persistence Layer Update

This document outlines the changes made to the persistence layers in the Tributestream application to work with the new API clients.

## Overview

The persistence layers have been updated to use the new API clients directly, eliminating the need for `setApiClient` methods. This simplifies the architecture and makes it easier to maintain.

### Key Changes

1. **Direct API Client Usage**
   - Persistence layers now import and use API clients directly
   - Removed `setApiClient` methods from persistence layers
   - Updated `+page.server.ts` to use `tributeApiV2.setToken()` directly

2. **Data Structure Transformation**
   - Added transformation in `+page.server.ts` to convert between API and UI data structures
   - Ensures backward compatibility with existing components

3. **Reactive Stores**
   - Maintained reactive store pattern for UI components
   - Stores are automatically updated when data is fetched or modified

## Architecture

```
UI Components
      ↓ ↑
Persistence Layers (with caching and reactive stores)
      ↓ ↑
API Clients (specialized for each entity type)
      ↓ ↑
SvelteKit API Routes (proxy endpoints)
      ↓ ↑
WordPress REST API
```

## Persistence Layers

### TributePersistence

The `tributePersistence` layer handles tribute data, including:
- Tribute pages
- Form data
- User tributes

```typescript
// Example usage
const tributes = await tributePersistence.getTributesByUser(userId);
const tribute = await tributePersistence.getTributeById(tributeId);
const formData = await tributePersistence.getFormData(userId);
```

### EventsPersistence

The `eventsPersistence` layer handles event data, including:
- Active events
- Events by location
- Events by tribute
- All tributes (admin only)

```typescript
// Example usage
const events = await eventsPersistence.getActiveEvents();
const locationEvents = await eventsPersistence.getEventsByLocation(locationId);
const tributeEvents = await eventsPersistence.getEventsByTribute(tributeId);
const allTributes = await eventsPersistence.getAllTributes(); // Admin only
```

### FuneralHomesPersistence

The `funeralHomesPersistence` layer handles funeral home data, including:
- All funeral homes
- Funeral home by ID

```typescript
// Example usage
const homes = await funeralHomesPersistence.getFuneralHomes();
const home = await funeralHomesPersistence.getFuneralHomeById(homeId);
```

### SchedulesPersistence

The `schedulesPersistence` layer handles schedule data, including:
- All schedules
- Schedule by ID
- Schedules by tribute

```typescript
// Example usage
const schedules = await schedulesPersistence.getSchedules();
const schedule = await schedulesPersistence.getScheduleById(scheduleId);
const tributeSchedules = await schedulesPersistence.getSchedules({ tributeId });
```

## Reactive Stores

Each persistence layer provides reactive stores that can be used in UI components:

```typescript
// Example usage in a Svelte component
import { eventsPersistence } from '$lib/persistence/events-persistence';

// Get a reactive store for active events
const activeEventsStore = eventsPersistence.getActiveEventsStore();

// Use the store in the component
$: activeEvents = $activeEventsStore || [];
```

## Caching

All persistence layers implement caching to improve performance:

- Cache TTL: 5 minutes
- Force refresh option to bypass cache
- Automatic cache invalidation when data is modified

```typescript
// Example usage with force refresh
const events = await eventsPersistence.getActiveEvents({ forceRefresh: true });
```

## Error Handling

All persistence layers implement robust error handling:

- Automatic retry for network errors
- Consistent error response format
- Detailed error messages

```typescript
// Example error handling
const result = await tributePersistence.getTributeById(tributeId);
if (!result.success) {
  console.error('Error fetching tribute:', result.error);
}
```

## Dashboard Integration

The dashboard page has been updated to work with the new persistence layers:

1. **Server-Side Data Loading**
   - Uses `tributeApiV2.setToken()` to set the JWT token
   - Fetches tributes using the appropriate persistence layer based on user role
   - Transforms data to match the expected format in the UI

2. **Client-Side Component**
   - `EnhancedUserDataWidget` uses reactive stores from persistence layers
   - Automatically updates when data changes

## Testing

To test the persistence layers:

1. **Manual Testing**
   - Use the `/dev/test-persistence` page to test the persistence layers
   - Enter your JWT token and test each persistence layer
   - Check the results for any errors or unexpected behavior

2. **Unit Testing**
   - Add unit tests for each persistence layer method
   - Mock the API clients to test caching and error handling
   - Test with various scenarios (success, error, cache hit, cache miss)

## Next Steps

1. **Complete API Client Updates**
   - Update any remaining components to use the new persistence layers
   - Ensure all API clients are properly typed

2. **Add Comprehensive Testing**
   - Add unit tests for all persistence layers
   - Add integration tests for API clients and persistence layers
   - Add end-to-end tests for critical user flows

3. **Performance Optimization**
   - Optimize caching strategies
   - Implement more sophisticated error recovery
   - Add telemetry for monitoring performance