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
export const FORMS_PATH = `${API_BASE_URL}/forms`;

// Special endpoints for frontend requests
export const ACTIVE_EVENTS_PATH = `${EVENTS_PATH}/active`;
export const CURRENT_USER_PATH = `${USERS_PATH}/me`;
export const TRIBUTE_BY_SLUG_PATH = `${API_BASE_URL}/tribute`;

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
export const WP_ACTIVE_EVENTS_PATH = `${WP_EVENTS_PATH}/active`;

// Legacy paths (for backward compatibility during transition)
export const LEGACY_API_BASE_URL = 'https://wp.tributestream.com/wp-json/tributestream/v1';
export const LEGACY_TRIBUTES_PATH = `${LEGACY_API_BASE_URL}/tributes`;