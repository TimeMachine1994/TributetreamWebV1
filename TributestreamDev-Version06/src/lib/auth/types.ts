/**
 * Type definitions for authentication
 */

/**
 * JWT payload structure
 */
export interface JwtPayload {
  id: number;
  email: string;
  name?: string;
  iat: number;
  exp: number;
}

/**
 * User data structure
 */
export interface UserData {
  id: number;
  email: string;
  name?: string;
  authenticated: boolean;
}