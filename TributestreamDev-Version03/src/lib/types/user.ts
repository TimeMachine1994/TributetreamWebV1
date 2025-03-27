/**
 * Type definitions for user management
 */

import type { UserRole } from './user-roles';

/**
 * Represents a user in the system
 */
export interface User {
  id: string | number;
  user_type: UserRole;
  email_address: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  funeral_home_id?: string | number;
}

/**
 * Response format for user collections
 */
export interface UserCollection {
  users: User[];
  total_pages: number;
  total_items: number;
  current_page: number;
}

/**
 * Response format when creating a new user
 */
export interface UserCreationResult {
  success: boolean;
  id: string | number;
}

/**
 * Payload for creating a new user
 */
export interface CreateUserPayload {
  email_address: string;
  password: string;
  user_type?: UserRole;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  funeral_home_id?: string | number;
}

/**
 * Payload for updating a user
 */
export interface UpdateUserPayload {
  email_address?: string;
  user_type?: UserRole;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  funeral_home_id?: string | number;
}