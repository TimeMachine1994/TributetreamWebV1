/**
 * API Client Exports
 * 
 * This file exports all API clients for easy importing.
 */

// Export API constants
export * from './api-constants';

// Export base API client
export { 
  tributeApiV2 as tributeApi,
  TributeApiClientV2 as TributeApiClient
} from './tribute-api-client-v2';

// Export extended API client
export { 
  extendedTributeApiV2 as extendedTributeApi,
  ExtendedTributeApiClientV2 as ExtendedTributeApiClient
} from './tribute-api-client-extended-v2';

// Export entity-specific API clients
export { default as eventsApi } from './events-api-v2';
export { default as locationsApi } from './locations-api';
export { default as usersApi } from './users-api';
export { default as funeralHomesApi } from './funeral-homes-api';
export { default as schedulesApi } from './schedules-api';

// Re-export types from server/types
export type { 
  ApiResponse,
  TributePage,
  Location,
  Event,
  User,
  FuneralHome,
  Schedule,
  PaginatedTributePagesResponse,
  PaginatedLocationsResponse,
  PaginatedEventsResponse,
  PaginatedUsersResponse,
  PaginatedFuneralHomesResponse,
  PaginatedSchedulesResponse
} from '$lib/server/types';