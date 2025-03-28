/**
 * API Clients Index
 * 
 * This file exports all API clients from a single location for easier imports.
 */

// Export API constants
export * from './api-constants';

// Export API clients
export { tributeApi, type ApiResponse, type TributeApiClient } from './tribute-api-client';
export { tributeApiV2 } from './tribute-api-client-v2';
export { default as eventsApi } from './events-api';
export { default as funeralHomesApi } from './funeral-homes-api';
export { default as schedulesApi } from './schedules-api';
export { default as locationsApi } from './locations-api';
export { default as usersApi } from './users-api';

// Export extended API client
export { default as tributeApiExtended } from './tribute-api-client-extended';