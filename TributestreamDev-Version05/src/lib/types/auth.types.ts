/**
 * Authentication type definitions
 * 
 * This file contains TypeScript interfaces for authentication.
 */

/**
 * Login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * JWT authentication response from WordPress
 */
export interface JWTAuthResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

/**
 * JWT token validation response
 */
export interface JWTValidationResponse {
  code: string;
  data: {
    status: number;
  };
}

/**
 * User data
 */
export interface User {
  id?: number;
  email: string;
  nicename: string;
  displayName: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}