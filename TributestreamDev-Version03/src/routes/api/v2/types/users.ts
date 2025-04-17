/**
 * User-specific interfaces for the API v2 endpoints
 */
import type { ApiResponse } from './index';

/**
 * User interface representing a WordPress user
 */
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  roles?: string[];
  capabilities?: Record<string, boolean>;
  user_type?: string;
  registered_date?: string;
}

/**
 * Request for creating a new user
 */
export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  user_type?: string;
  role?: string;
}

/**
 * Request for updating an existing user
 */
export interface UserUpdateRequest {
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  user_type?: string;
  role?: string;
}

/**
 * Response for a single user
 */
export interface UserResponse extends ApiResponse {
  data?: User;
}

/**
 * Response for a list of users
 */
export interface UsersListResponse extends ApiResponse {
  data?: User[];
}

/**
 * User login request
 */
export interface UserLoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

/**
 * User login response
 */
export interface UserLoginResponse extends ApiResponse {
  data?: {
    user: User;
    token?: string; // Only included in responses that don't set cookies
  };
}

/**
 * User registration request
 */
export interface UserRegistrationRequest extends UserCreateRequest {
  send_welcome_email?: boolean;
}

/**
 * User registration response
 */
export interface UserRegistrationResponse extends ApiResponse {
  data?: {
    user: User;
    email_sent?: boolean;
  };
}