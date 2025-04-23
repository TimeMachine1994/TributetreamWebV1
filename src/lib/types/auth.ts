/**
 * Type definitions for authentication, users, and roles
 * Used throughout the application for type safety
 */

/**
 * User role types based on Strapi's default roles
 */
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  AUTHOR = 'author',
  AUTHENTICATED = 'authenticated',
  PUBLIC = 'public'
}

/**
 * Permission types for granular access control
 */
export enum Permission {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

/**
 * Base user interface with common properties
 */
export interface BaseUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Complete user interface with all properties
 * Extends BaseUser with additional fields
 */
export interface User extends BaseUser {
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

/**
 * User preferences interface for storing user-specific settings
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  language?: string;
  [key: string]: any; // Allow for flexible extension
}

/**
 * Authentication token interface
 */
export interface AuthToken {
  token: string;
  type: 'bearer';
  expiresAt?: number; // Timestamp when token expires (optional for refresh tokens)
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  identifier: string; // Can be email or username
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration data interface
 */
export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
}

/**
 * Password reset request interface
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation interface
 */
export interface PasswordResetConfirm {
  code: string;
  password: string;
  confirmPassword: string;
}

/**
 * Authentication response from the server
 */
export interface AuthResponse {
  jwt: string;
  user: User;
}

/**
 * Auth state interface for managing authentication in the app
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * Auth error types for handling specific authentication errors
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  ACCOUNT_BLOCKED = 'account_blocked',
  UNCONFIRMED_ACCOUNT = 'unconfirmed_account',
  NETWORK_ERROR = 'network_error',
  SERVER_ERROR = 'server_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Enhanced auth error with additional details
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: any;
}

/**
 * Role with permissions for access control
 */
export interface Role {
  id: number;
  name: string;
  description: string;
  type: UserRole;
  permissions: RolePermission[];
}

/**
 * Permission settings for a role
 */
export interface RolePermission {
  action: string; // Format: "api::content-type.content-type.action"
  subject: string; // The content type this permission applies to
  properties?: {
    fields: string[];
  };
  conditions?: string[];
}