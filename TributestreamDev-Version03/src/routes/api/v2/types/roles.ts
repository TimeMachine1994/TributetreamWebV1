/**
 * Role-specific interfaces for the API v2 endpoints
 */
import type { ApiResponse } from './index';

/**
 * Role interface representing a WordPress role
 */
export interface Role {
  name: string;
  display_name: string;
  capabilities: string[];
}

/**
 * User role information
 */
export interface UserRole {
  user_id: number;
  roles: string[];
  capabilities: Record<string, boolean>;
  user_type?: string;
}

/**
 * Request parameters for checking a user's role
 */
export interface RoleCheckRequest {
  userId: number;
  role?: string;
  capability?: string;
}

/**
 * Response for role check endpoint
 */
export interface RoleCheckResponse extends ApiResponse {
  data?: {
    hasRole?: boolean;
    hasCapability?: boolean;
    roles?: string[];
    capabilities?: string[];
  };
}

/**
 * Request for assigning a role to a user
 */
export interface RoleAssignRequest {
  userId: number;
  role: string;
  userType?: string;
}

/**
 * Response for role assignment endpoint
 */
export interface RoleAssignResponse extends ApiResponse {
  data?: {
    userId: number;
    role: string;
    message: string;
  };
}

/**
 * Available user types mapped to WordPress roles
 */
export const USER_TYPES = {
  ADMIN: 'admin',
  FUNERAL_DIRECTOR: 'funeral_director',
  FAMILY_MEMBER: 'family_member',
  GUEST: 'guest'
} as const;

/**
 * Mapping of user types to WordPress roles
 */
export const USER_TYPE_TO_ROLE_MAP: Record<string, string> = {
  [USER_TYPES.ADMIN]: 'administrator',
  [USER_TYPES.FUNERAL_DIRECTOR]: 'editor',
  [USER_TYPES.FAMILY_MEMBER]: 'author',
  [USER_TYPES.GUEST]: 'subscriber'
};

/**
 * Mapping of WordPress roles to user types
 */
export const ROLE_TO_USER_TYPE_MAP: Record<string, string> = {
  'administrator': USER_TYPES.ADMIN,
  'editor': USER_TYPES.FUNERAL_DIRECTOR,
  'author': USER_TYPES.FAMILY_MEMBER,
  'subscriber': USER_TYPES.GUEST
};