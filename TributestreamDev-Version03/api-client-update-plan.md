# API Client Update Plan

## Overview

This document outlines the plan for updating the frontend TypeScript API client modules to work with the newly implemented API endpoints. The goal is to ensure that the frontend components can seamlessly interact with the WordPress backend through our new proxy layer.

## Current Status

### ✅ Completed Tasks

1. **Server-Side API Implementation**
   - All API endpoints have been implemented in SvelteKit to proxy requests to the WordPress backend
   - Endpoints follow the WordPress plugin's structure exactly
   - Proper error handling and response formatting is in place
   - Documentation has been updated to reflect the new endpoints

### 🔄 Current State Analysis

The current API client structure consists of:

1. **Base API Client** (`tribute-api-client.ts`):
   - Handles authentication, request formatting, and error handling
   - Contains core CRUD operations for tributes
   - Uses direct WordPress API URLs (`https://wp.tributestream.com/wp-json/tributestream/v1`)

2. **Extended API Client** (`tribute-api-client-extended.ts`):
   - Extends the base client with additional methods
   - Includes methods for events, locations, and user roles

3. **Events API Client** (`events-api.ts`):
   - Specialized client for event-related operations
   - Uses the base client's request method

4. **New API Proxy Endpoints** (`src/routes/api/`):
   - Implemented to match the WordPress plugin's endpoint structure
   - Use `forwardApiRequest` to proxy requests to WordPress
   - Follow a consistent pattern for error handling and response formatting

## ⏭️ Next Steps: Client-Side Updates

### Key Changes Required

1. **Update API Base URL**:
   - Change from direct WordPress URLs to local SvelteKit API routes
   - Replace `https://wp.tributestream.com/wp-json/tributestream/v1` with `/api`

2. **Update Method Signatures**:
   - Align parameter types with the new API endpoint requirements
   - Update return types to match the new API response formats

3. **Update Path Structures**:
   - Change from `/tributes` to `/tribute-pages`
   - Update other path differences between old and new APIs

4. **Add New Methods**:
   - Implement methods for new endpoints (funeral homes, schedules)
   - Ensure complete coverage of all API functionality

5. **Error Handling**:
   - Ensure consistent error handling across all client methods
   - Handle the standardized error response format from the new API

## Implementation Plan

### 1. Create API Constants Module

Create a new file `src/lib/api/api-constants.ts` to centralize API paths:

```typescript
/**
 * API Constants
 * 
 * Centralized constants for API paths and endpoints.
 */

// Base API URL for frontend requests
export const API_BASE_URL = '/api';

// Entity-specific paths for frontend requests
export const TRIBUTE_PAGES_PATH = `${API_BASE_URL}/tribute-pages`;
export const LOCATIONS_PATH = `${API_BASE_URL}/locations`;
export const EVENTS_PATH = `${API_BASE_URL}/events`;
export const USERS_PATH = `${API_BASE_URL}/users`;
export const FUNERAL_HOMES_PATH = `${API_BASE_URL}/funeral-homes`;
export const SCHEDULES_PATH = `${API_BASE_URL}/schedules`;

// Authentication paths
export const AUTH_PATH = `${API_BASE_URL}/auth`;
export const AUTH_TOKEN_PATH = `${AUTH_PATH}/token`;
export const AUTH_VALIDATE_PATH = `${AUTH_PATH}/validate`;
export const AUTH_REGISTER_PATH = `${AUTH_PATH}/register`;

// WordPress API paths (for server-side requests)
export const WP_API_BASE_URL = 'funeral/v2';
export const WP_TRIBUTE_PAGES_PATH = `${WP_API_BASE_URL}/tribute-pages`;
export const WP_LOCATIONS_PATH = `${WP_API_BASE_URL}/locations`;
export const WP_EVENTS_PATH = `${WP_API_BASE_URL}/events`;
export const WP_USERS_PATH = `${WP_API_BASE_URL}/users`;
export const WP_FUNERAL_HOMES_PATH = `${WP_API_BASE_URL}/funeral-homes`;
export const WP_SCHEDULES_PATH = `${WP_API_BASE_URL}/schedules`;

// Legacy paths (for backward compatibility during transition)
export const LEGACY_API_BASE_URL = 'https://wp.tributestream.com/wp-json/tributestream/v1';
```

### 2. Update Base API Client

Update `tribute-api-client.ts` to use the new API paths and response formats:

```typescript
import { API_BASE_URL, TRIBUTE_PAGES_PATH } from './api-constants';
import type { 
  ApiResponse, 
  TributePage, 
  CreateTributePageParams,
  UpdateTributePageParams,
  PaginatedTributePagesResponse
} from '$lib/server/types';

// Update class implementation to use new paths and types
```

Key changes:
- Update the API base URL
- Update method signatures to use new types
- Update path structures
- Ensure proper error handling

### 3. Update Extended API Client

Update `tribute-api-client-extended.ts` to use the new API paths and response formats:

```typescript
import { 
  TRIBUTE_PAGES_PATH, 
  EVENTS_PATH, 
  LOCATIONS_PATH, 
  USERS_PATH 
} from './api-constants';
import type {
  Event,
  Location,
  User,
  TributePage
} from '$lib/server/types';

// Update class implementation to use new paths and types
```

Key changes:
- Update method signatures to use new types
- Update path structures
- Add new methods for funeral homes and schedules

### 4. Update Events API Client

Update `events-api.ts` to use the new API paths and response formats:

```typescript
import { EVENTS_PATH, LOCATIONS_PATH, TRIBUTE_PAGES_PATH } from './api-constants';
import type { Event } from '$lib/server/types';

// Update implementation to use new paths and types
```

### 5. Create New API Clients

Create new API clients for funeral homes and schedules:

```typescript
// src/lib/api/funeral-homes-api.ts
import { FUNERAL_HOMES_PATH } from './api-constants';
import type { 
  FuneralHome, 
  CreateFuneralHomeParams,
  UpdateFuneralHomeParams,
  PaginatedFuneralHomesResponse
} from '$lib/server/types';

// Implementation

// src/lib/api/schedules-api.ts
import { SCHEDULES_PATH } from './api-constants';
import type { 
  Schedule, 
  CreateScheduleParams,
  UpdateScheduleParams,
  PaginatedSchedulesResponse
} from '$lib/server/types';

// Implementation
```

### 6. Create Integration Tests

Create tests for each API client method to ensure they work as expected:

```typescript
// src/lib/api/__tests__/tribute-api-client.test.ts
// src/lib/api/__tests__/events-api.test.ts
// etc.
```

## Detailed Implementation Steps

### 1. Base API Client Updates

1. Update the constructor to use the new API base URL
2. Update the `request` method to handle the new response format
3. Update the `getTributes` method to use the new path and response format
4. Update the `getTributeById` method to use the new path and response format
5. Update the `getTributeBySlug` method to use the new path and response format
6. Update the `createTribute` method to use the new path and response format
7. Update the `updateTribute` method to use the new path and response format
8. Update the `deleteTribute` method to use the new path and response format
9. Update the `getTributeData` method to use the new path and response format
10. Update the `createOrReplaceTributeData` method to use the new path and response format
11. Update the `updateTributeData` method to use the new path and response format

### 2. Extended API Client Updates

1. Update the `getAllTributes` method to use the new path and response format
2. Update the `getAllEvents` method to use the new path and response format
3. Update the `getActiveEvents` method to use the new path and response format
4. Update the `getEventsByLocation` method to use the new path and response format
5. Update the `getEventsByTribute` method to use the new path and response format
6. Update the `getCurrentUser` method to use the new path and response format
7. Update the `getAllLocations` method to use the new path and response format
8. Update the `getLocationsByTribute` method to use the new path and response format
9. Update the `createEvent` method to use the new path and response format
10. Update the `updateEvent` method to use the new path and response format
11. Update the `deleteEvent` method to use the new path and response format
12. Add methods for funeral homes and schedules

### 3. Events API Client Updates

1. Update the `getAllEvents` method to use the new path and response format
2. Update the `getActiveEvents` method to use the new path and response format
3. Update the `getEventsByLocation` method to use the new path and response format
4. Update the `getEventsByTribute` method to use the new path and response format
5. Update the `createEvent` method to use the new path and response format
6. Update the `updateEvent` method to use the new path and response format
7. Update the `deleteEvent` method to use the new path and response format

### 4. New API Clients Implementation

1. Create `funeral-homes-api.ts` with CRUD operations
2. Create `schedules-api.ts` with CRUD operations

## Migration Strategy

To ensure a smooth transition, we'll follow these steps:

1. **Create New Versions Alongside Existing Ones**:
   - Create new versions of the API clients with a suffix (e.g., `tribute-api-client-v2.ts`)
   - Keep the existing clients untouched during development

2. **Incremental Component Updates**:
   - Update one component at a time to use the new clients
   - Test thoroughly after each update
   - Monitor for any issues or regressions

3. **Parallel Testing**:
   - Run automated tests against both old and new clients
   - Ensure feature parity and correct behavior

4. **Gradual Rollout**:
   - Start with non-critical components
   - Move to more critical components as confidence increases
   - Keep fallback mechanisms in place

5. **Final Switchover**:
   - Once all components are updated, rename the new clients to replace the old ones
   - Remove any legacy code and compatibility layers

## Example: Updated Base API Client Method

```typescript
/**
 * Get tributes with pagination and search
 * 
 * @param options Pagination and search options
 * @returns List of tributes
 */
async getTributes(options: { page?: number; perPage?: number; search?: string } = {}): Promise<ApiResponse<PaginatedTributePagesResponse>> {
  const { page = 1, perPage = 10, search = '' } = options;
  const queryParams = new URLSearchParams();
  
  queryParams.append('page', page.toString());
  queryParams.append('perPage', perPage.toString());
  
  if (search) {
    queryParams.append('search', search);
  }
  
  return this.request<PaginatedTributePagesResponse>(
    `${TRIBUTE_PAGES_PATH}?${queryParams.toString()}`
  );
}
```

## Example: New Funeral Homes API Client

```typescript
/**
 * Funeral Homes API Client
 * 
 * Provides methods for interacting with the funeral homes endpoints.
 */

import { tributeApi } from './tribute-api-client';
import { FUNERAL_HOMES_PATH } from './api-constants';
import type { ApiResponse } from './tribute-api-client';
import type {
  FuneralHome,
  CreateFuneralHomeParams,
  UpdateFuneralHomeParams,
  PaginatedFuneralHomesResponse
} from '$lib/server/types';

/**
 * Funeral Homes API Client
 */
export const funeralHomesApi = {
  /**
   * Get all funeral homes with pagination
   * 
   * @param options Pagination options
   * @returns List of funeral homes
   */
  async getFuneralHomes(options: { page?: number; perPage?: number } = {}): Promise<ApiResponse<PaginatedFuneralHomesResponse>> {
    const { page = 1, perPage = 10 } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('perPage', perPage.toString());
    
    return tributeApi['request']<PaginatedFuneralHomesResponse>(
      `${FUNERAL_HOMES_PATH}?${queryParams.toString()}`
    );
  },
  
  /**
   * Get a funeral home by ID
   * 
   * @param id Funeral home ID
   * @returns Funeral home data
   */
  async getFuneralHomeById(id: number): Promise<ApiResponse<{ data: FuneralHome }>> {
    return tributeApi['request']<{ data: FuneralHome }>(
      `${FUNERAL_HOMES_PATH}/${id}`
    );
  },
  
  /**
   * Create a new funeral home
   * 
   * @param data Funeral home data
   * @returns Created funeral home ID
   */
  async createFuneralHome(data: CreateFuneralHomeParams): Promise<ApiResponse<{ funeral_home_id: number }>> {
    return tributeApi['request']<{ funeral_home_id: number }>(
      `${FUNERAL_HOMES_PATH}`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },
  
  /**
   * Update an existing funeral home
   * 
   * @param id Funeral home ID
   * @param data Updated funeral home data
   * @returns Update result
   */
  async updateFuneralHome(
    id: number,
    data: UpdateFuneralHomeParams
  ): Promise<ApiResponse<{ success: boolean }>> {
    return tributeApi['request']<{ success: boolean }>(
      `${FUNERAL_HOMES_PATH}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },
  
  /**
   * Delete a funeral home
   * 
   * @param id Funeral home ID
   * @returns Delete result
   */
  async deleteFuneralHome(id: number): Promise<ApiResponse<{ deleted_id: number }>> {
    return tributeApi['request']<{ deleted_id: number }>(
      `${FUNERAL_HOMES_PATH}/${id}`,
      {
        method: 'DELETE'
      }
    );
  }
};

export default funeralHomesApi;
```

## Timeline and Priorities

1. **Week 1: Foundation**
   - Create API constants module
   - Update base API client
   - Create initial tests

2. **Week 2: Core Functionality**
   - Update extended API client
   - Update events API client
   - Test core functionality

3. **Week 3: New Functionality**
   - Create funeral homes API client
   - Create schedules API client
   - Test new functionality

4. **Week 4: Integration and Migration**
   - Update components to use new clients
   - Comprehensive testing
   - Final switchover

## Conclusion

With the server-side API implementation now complete, we can focus on updating the frontend API clients to use the new endpoints. This plan provides a comprehensive approach to updating the frontend API clients with minimal disruption to the application's functionality.

The key benefits of this approach include:
- Centralized API constants for easier maintenance
- Type-safe API clients with proper error handling
- Complete coverage of all API functionality
- Smooth migration path with minimal disruption