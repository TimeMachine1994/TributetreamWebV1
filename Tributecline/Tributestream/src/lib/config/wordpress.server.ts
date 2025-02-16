import { wordpressUrl, wpApiNamespace } from '$lib/config/env.server';

/**
 * WordPress Server API Configuration
 * This module provides centralized configuration for WordPress API endpoints
 * and validation of required environment variables.
 */

// Validate URL format
function validateServerUrl() {
  try {
    new URL(wordpressUrl);
  } catch (error) {
    throw new Error('Invalid WordPress API URL format in server environment variables');
  }
}

// Run validation immediately
validateServerUrl();

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
    USER_META: `/${wpApiNamespace}/user-meta`,
  },
} as const;

/**
 * Get the full URL for a WordPress API endpoint
 * Uses the private API URL for server-side requests
 * @param endpoint - The API endpoint path
 * @returns The complete API URL
 */
export function getServerApiUrl(endpoint: string): string {
  return new URL(endpoint, wordpressUrl).toString();
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
 * Custom error class for WordPress API errors
 */
export class WordPressApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 500
  ) {
    super(message);
    this.name = 'WordPressApiError';
  }
}