import { publicWordpressUrl, wpApiNamespace } from '$lib/config/env.client';

/**
 * WordPress Client API Configuration
 * This module provides centralized configuration for WordPress API endpoints
 * and validation of required environment variables.
 */

// Validate URL format
function validateClientUrl() {
  try {
    new URL(publicWordpressUrl);
  } catch (error) {
    throw new Error('Invalid WordPress API URL format in client environment variables');
  }
}

// Run validation immediately (only in browser)
if (typeof window !== 'undefined') {
  validateClientUrl();
}

/**
 * WordPress API endpoints configuration
 * Centralizes all endpoint paths and provides type safety
 */
export const WP_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    TOKEN: '/jwt-auth/v1/token',
    VALIDATE: '/jwt-auth/v1/token/validate',
  },
  // API endpoints
  API: {
    USERS: '/wp/v2/users',
    POSTS: '/wp/v2/posts',
    USER_META: '/wp/v2/user-meta',
  },
} as const;

/**
 * Get the full URL for a WordPress API endpoint
 * Uses the public API URL for client-side requests
 * @param endpoint - The API endpoint path
 * @returns The complete API URL
 */
export function getClientApiUrl(endpoint: string): string {
  return new URL(endpoint, publicWordpressUrl).toString();
}

/**
 * Type for WordPress API error responses
 */
export interface WPApiError {
  code: string;
  message: string;
  data?: {
    status: number;
    [key: string]: unknown;
  };
}

/**
 * Get the WordPress API namespace
 * @returns The configured API namespace
 */
export function getApiNamespace(): string {
  return wpApiNamespace;
}