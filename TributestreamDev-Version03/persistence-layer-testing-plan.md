# Persistence Layer Testing and Integration Plan

This document outlines the recommended steps for testing and integrating the recently updated persistence layers in the Tributestream application.

## 1. Testing Framework Setup

Currently, the project doesn't have a dedicated testing framework. We recommend adding Vitest, which integrates well with SvelteKit and Vite:

```bash
npm install -D vitest @testing-library/svelte jsdom
```

Update `package.json` to include test scripts:

```json
"scripts": {
  "dev": "vite dev",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  // ... other existing scripts
}
```

Create a `vitest.config.ts` file in the project root:

```typescript
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
```

## 2. Unit Testing the Persistence Layers

### 2.1 Create Mock API Clients

Create mock versions of the API clients to use in tests:

```typescript
// src/lib/api/__mocks__/tribute-api-client-v2.ts
export const tributeApiV2 = {
  setToken: vi.fn(),
  request: vi.fn(),
  getTributeById: vi.fn(),
  getTributesByUser: vi.fn(),
  createTribute: vi.fn(),
  updateTribute: vi.fn(),
  deleteTribute: vi.fn()
};

// src/lib/api/__mocks__/events-api.ts
export const eventsApi = {
  getEvents: vi.fn(),
  getEventById: vi.fn(),
  getEventsByLocation: vi.fn(),
  getEventsByTribute: vi.fn(),
  getActiveEvents: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn()
};

// Similar mocks for funeral-homes-api.ts and schedules-api.ts
```

### 2.2 Create Unit Tests for Persistence Layers

Create test files for each persistence layer:

```typescript
// src/lib/persistence/events-persistence.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { eventsPersistence } from './events-persistence';
import { eventsApi } from '$lib/api/events-api';

// Mock the API client
vi.mock('$lib/api/events-api');

describe('Events Persistence Layer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Clear caches
    eventsPersistence.clearCaches();
  });

  it('should get active events', async () => {
    // Setup mock response
    const mockEvents = [
      { event_id: 1, location_id: 1, start_time: '2025-04-01T10:00:00', end_time: '2025-04-01T12:00:00' }
    ];
    
    eventsApi.getActiveEvents.mockResolvedValue({
      success: true,
      data: mockEvents,
      status: 200
    });

    // Call the method
    const result = await eventsPersistence.getActiveEvents();

    // Verify results
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockEvents);
    expect(eventsApi.getActiveEvents).toHaveBeenCalledTimes(1);

    // Test caching - second call should not hit the API
    const cachedResult = await eventsPersistence.getActiveEvents();
    expect(cachedResult.success).toBe(true);
    expect(cachedResult.data).toEqual(mockEvents);
    expect(eventsApi.getActiveEvents).toHaveBeenCalledTimes(1); // Still 1, not 2
  });

  // Add more tests for other methods...
});
```

Create similar test files for the other persistence layers:
- `src/lib/persistence/funeral-homes-persistence.test.ts`
- `src/lib/persistence/schedules-persistence.test.ts`
- `src/lib/persistence/tribute-persistence.test.ts`

## 3. Integration Testing

### 3.1 API Client Integration Tests

Create tests that verify the API clients correctly interact with the API endpoints:

```typescript
// src/lib/api/events-api.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { eventsApi } from './events-api';
import { tributeApi } from './tribute-api-client';

// Mock the base API client
vi.mock('./tribute-api-client', () => ({
  tributeApi: {
    request: vi.fn()
  }
}));

describe('Events API Client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should get active events', async () => {
    // Setup mock response
    const mockResponse = {
      success: true,
      data: [
        { event_id: 1, location_id: 1, start_time: '2025-04-01T10:00:00', end_time: '2025-04-01T12:00:00' }
      ],
      status: 200
    };
    
    tributeApi.request.mockResolvedValue(mockResponse);

    // Call the method
    const result = await eventsApi.getActiveEvents();

    // Verify results
    expect(result).toEqual(mockResponse);
    expect(tributeApi.request).toHaveBeenCalledWith('/events/active');
  });

  // Add more tests for other methods...
});
```

Create similar test files for the other API clients.

### 3.2 Component Integration Tests

Create tests for components that use the persistence layers:

```typescript
// src/lib/components/dashboard/EnhancedUserDataWidget.test.ts
import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import EnhancedUserDataWidget from './EnhancedUserDataWidget.svelte';
import { tributePersistence } from '$lib/persistence/tribute-persistence';
import { eventsPersistence } from '$lib/persistence/events-persistence';

// Mock the persistence layers
vi.mock('$lib/persistence/tribute-persistence');
vi.mock('$lib/persistence/events-persistence');

describe('EnhancedUserDataWidget', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup mock stores
    tributePersistence.getFormDataStore.mockReturnValue(writable({
      'deceased-first-name': 'John',
      'deceased-last-name': 'Doe'
    }));
    
    tributePersistence.getUserTributesStore.mockReturnValue(writable([
      { id: 1, loved_one_name: 'John Doe', slug: 'john-doe' }
    ]));
    
    eventsPersistence.getActiveEventsStore.mockReturnValue(writable([
      { 
        event_id: 1, 
        location_name: 'Memorial Chapel', 
        start_time: '2025-04-01T10:00:00', 
        end_time: '2025-04-01T12:00:00' 
      }
    ]));
  });

  it('should render memorial information', async () => {
    render(EnhancedUserDataWidget, { userId: 123 });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Memorial Chapel')).toBeInTheDocument();
    });
    
    expect(tributePersistence.getFormDataStore).toHaveBeenCalledWith(123);
    expect(tributePersistence.getUserTributesStore).toHaveBeenCalledWith(123);
    expect(eventsPersistence.getActiveEventsStore).toHaveBeenCalled();
  });

  // Add more tests...
});
```

## 4. Manual Testing Steps

### 4.1 Dashboard Testing

1. **Login and Authentication**
   - Log in with a valid user account
   - Verify the JWT token is correctly set in the API clients

2. **Dashboard Loading**
   - Verify the dashboard loads without errors
   - Check that the EnhancedUserDataWidget displays correctly
   - Verify that tribute data is displayed
   - Verify that event data is displayed

3. **Data Refresh**
   - Click the refresh button on the EnhancedUserDataWidget
   - Verify that data is refreshed from the server
   - Check that the loading indicator works correctly

### 4.2 Tribute Page Testing

1. **Tribute Page Loading**
   - Navigate to a tribute page using the link from the dashboard
   - Verify the tribute data loads correctly
   - Check that events associated with the tribute are displayed

2. **Event Creation and Management**
   - Create a new event for a tribute
   - Verify the event appears in the active events list
   - Update the event details
   - Verify the changes are reflected in the UI
   - Delete the event
   - Verify the event is removed from the list

### 4.3 Funeral Home Testing

1. **Funeral Home Management**
   - Create a new funeral home
   - Verify it appears in the funeral homes list
   - Update the funeral home details
   - Verify the changes are reflected in the UI
   - Delete the funeral home
   - Verify it is removed from the list

### 4.4 Schedule Testing

1. **Schedule Management**
   - Create a new schedule
   - Verify it appears in the schedules list
   - Update the schedule details
   - Verify the changes are reflected in the UI
   - Delete the schedule
   - Verify it is removed from the list

## 5. Performance Testing

### 5.1 Caching Effectiveness

1. **Monitor Network Requests**
   - Use browser developer tools to monitor network requests
   - Verify that repeated requests for the same data do not trigger API calls
   - Check that cache invalidation works correctly when data is updated

2. **Response Time Measurement**
   - Measure the response time for initial data loading
   - Measure the response time for cached data loading
   - Verify that cached data loading is significantly faster

### 5.2 Memory Usage

1. **Memory Profiling**
   - Use browser developer tools to profile memory usage
   - Check for memory leaks during extended usage
   - Verify that caches are properly cleared when components are unmounted

## 6. Deployment and Monitoring

### 6.1 Staged Deployment

1. **Development Environment**
   - Deploy the changes to the development environment
   - Run the full test suite
   - Fix any issues that arise

2. **Staging Environment**
   - Deploy to staging after successful development testing
   - Perform manual testing in the staging environment
   - Verify integration with the WordPress backend

3. **Production Deployment**
   - Deploy to production after successful staging testing
   - Monitor for any issues during and after deployment

### 6.2 Monitoring

1. **Error Tracking**
   - Set up error tracking (e.g., Sentry)
   - Monitor for API errors
   - Monitor for client-side errors

2. **Performance Monitoring**
   - Set up performance monitoring
   - Track API response times
   - Track client-side rendering performance

## 7. Documentation Updates

1. **API Documentation**
   - Update API documentation to reflect the new endpoints
   - Document the expected request and response formats

2. **Component Documentation**
   - Update component documentation to reflect the new persistence layers
   - Document how to use the reactive stores

3. **Developer Guide**
   - Create a developer guide for working with the persistence layers
   - Include examples of common operations

## 8. Future Improvements

1. **Real-time Updates**
   - Implement WebSocket or Server-Sent Events for real-time updates
   - Update the persistence layers to handle real-time data

2. **Offline Support**
   - Implement offline support using service workers
   - Update the persistence layers to handle offline data

3. **Advanced Caching**
   - Implement more sophisticated caching strategies
   - Consider using IndexedDB for larger datasets

## Conclusion

This testing and integration plan provides a comprehensive approach to ensuring the reliability and performance of the updated persistence layers. By following these steps, we can confidently deploy the changes to production and provide a better user experience for Tributestream users.