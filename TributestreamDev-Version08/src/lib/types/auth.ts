/**
 * Type definitions for Strapi authentication and user data
 */

/**
 * Represents a user from Strapi CMS
 */
export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  role: StrapiRole;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a role in Strapi CMS
 */
export interface StrapiRole {
  id: number;
  name: string;
  description: string;
  type: string;
}

/**
 * Payload for login requests
 */
export interface LoginPayload {
  identifier: string; // Email or username
  password: string;
}

/**
 * Response from Strapi authentication endpoints
 */
export interface AuthResponse {
  jwt: string;
  user: StrapiUser;
}