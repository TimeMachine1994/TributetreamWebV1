/**
 * Environment variables utility
 * 
 * This file provides type-safe access to environment variables.
 */

// WordPress API Configuration
export const WP_API_URL = import.meta.env.VITE_WP_API_URL as string;
export const WP_API_NAMESPACE = import.meta.env.VITE_WP_API_NAMESPACE as string;

// Authentication Configuration
export const JWT_AUTH_URL = import.meta.env.VITE_JWT_AUTH_URL as string;

// Debug log environment variables
console.log('Environment Variables:');
console.log('WP_API_URL:', WP_API_URL);
console.log('JWT_AUTH_URL:', JWT_AUTH_URL);
export const AUTH_TOKEN_EXPIRY = parseInt(import.meta.env.VITE_AUTH_TOKEN_EXPIRY as string, 10) || 604800; // 7 days in seconds

// CORS Configuration
export const CORS_ENABLED = (import.meta.env.VITE_CORS_ENABLED as string) === 'true';

// Application Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME as string;
export const APP_URL = import.meta.env.VITE_APP_URL as string;

/**
 * Validates that all required environment variables are set
 * @returns {boolean} True if all required environment variables are set
 */
export function validateEnv(): boolean {
  const requiredVars = [
    WP_API_URL,
    WP_API_NAMESPACE,
    JWT_AUTH_URL
  ];
  
  const missingVars = requiredVars.filter(v => !v);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    return false;
  }
  
  return true;
}