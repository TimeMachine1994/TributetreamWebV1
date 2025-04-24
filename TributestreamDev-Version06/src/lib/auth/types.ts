/**
 * Type definitions for authentication
 */

/**
 * User role type
 */
export type UserRole = 'Admin' | 'Funeral Director' | 'Family Contact';

/**
 * JWT payload structure
 */
export interface JwtPayload {
  id: number;
  email: string;
  name?: string;
  role: UserRole;
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
  role: UserRole;
  authenticated: boolean;
}