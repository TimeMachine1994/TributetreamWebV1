/**
 * API Constants
 *
 * Centralized constants for API paths and endpoints.
 */

import { env } from '$env/dynamic/private';

// WordPress API base URL
export const WORDPRESS_API_BASE_URL = env.WORDPRESS_API_URL || 'https://wp.tributestream.com/wp-json';

// Base API URL for frontend
export const API_BASE_URL = '/api';

// WordPress API paths (backend)
export const FUNERAL_API_PATH = '/funeral/v2';
export const WP_TRIBUTE_PAGES_PATH = `${FUNERAL_API_PATH}/tribute-pages`;
export const WP_LOCATIONS_PATH = `${FUNERAL_API_PATH}/locations`;
export const WP_EVENTS_PATH = `${FUNERAL_API_PATH}/events`;
export const WP_ACTIVE_EVENTS_PATH = `${FUNERAL_API_PATH}/events/active`;
export const WP_USERS_PATH = `${FUNERAL_API_PATH}/users`;
export const WP_FUNERAL_HOMES_PATH = `${FUNERAL_API_PATH}/funeral-homes`;
export const WP_SCHEDULES_PATH = `${FUNERAL_API_PATH}/schedules`;

// Frontend API paths
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

// Special paths
export const TRIBUTE_BY_SLUG_PATH = `${API_BASE_URL}/tribute`;
export const ACTIVE_EVENTS_PATH = `${EVENTS_PATH}/active`;

// Legacy paths (for backward compatibility during transition)
export const LEGACY_API_BASE_URL = 'https://wp.tributestream.com/wp-json/tributestream/v1';
export const LEGACY_TRIBUTES_PATH = `${LEGACY_API_BASE_URL}/tributes`;
export const LEGACY_EVENTS_PATH = `${LEGACY_API_BASE_URL}/events`;
export const LEGACY_LOCATIONS_PATH = `${LEGACY_API_BASE_URL}/locations`;
export const LEGACY_USERS_PATH = `${LEGACY_API_BASE_URL}/users`;