/**
 * Authentication utilities for the API v2 endpoints
 */
import type { Cookies } from '@sveltejs/kit';
import { ApiErrors } from './error-handler';
import type { User } from '../types/users';
import { USER_TYPE_TO_ROLE_MAP } from '../types/roles';

/**
 * Get the JWT token from cookies
 * @param cookies The cookies object from the request
 * @returns The JWT token or null if not found
 */
export function getTokenFromCookie(cookies: Cookies): string | null {
  return cookies.get('jwt_token') || null;
}

/**
 * Get the user object from cookies
 * @param cookies The cookies object from the request
 * @returns The user object or null if not found
 */
export function getUserFromCookie(cookies: Cookies): User | null {
  const userCookie = cookies.get('user');
  if (!userCookie) return null;
  
  try {
    return JSON.parse(userCookie) as User;
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
}

/**
 * Ensure that a user is authenticated
 * @param cookies The cookies object from the request
 * @returns The JWT token
 * @throws ApiException if the user is not authenticated
 */
export function ensureAuthenticated(cookies: Cookies): string {
  const token = getTokenFromCookie(cookies);
  
  if (!token) {
    throw ApiErrors.unauthorized();
  }
  
  return token;
}

/**
 * Ensure that a user is authenticated and get the user object
 * @param cookies The cookies object from the request
 * @returns The user object and JWT token
 * @throws ApiException if the user is not authenticated
 */
export function ensureAuthenticatedUser(cookies: Cookies): { user: User; token: string } {
  const token = ensureAuthenticated(cookies);
  const user = getUserFromCookie(cookies);
  
  if (!user) {
    throw ApiErrors.unauthorized('User session is invalid');
  }
  
  return { user, token };
}

/**
 * Check if a user has a specific role
 * @param user The user object
 * @param role The role to check for
 * @returns True if the user has the role, false otherwise
 */
export function hasRole(user: User, role: string): boolean {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
}

/**
 * Check if a user has a specific capability
 * @param user The user object
 * @param capability The capability to check for
 * @returns True if the user has the capability, false otherwise
 */
export function hasCapability(user: User, capability: string): boolean {
  if (!user || !user.capabilities) return false;
  return !!user.capabilities[capability];
}

/**
 * Check if a user has admin privileges
 * @param user The user object
 * @returns True if the user is an admin, false otherwise
 */
export function isAdmin(user: User): boolean {
  if (!user) return false;
  
  // Check for administrator role
  if (user.roles && user.roles.includes('administrator')) {
    return true;
  }
  
  // Check for admin capabilities
  if (user.capabilities && user.capabilities.manage_options) {
    return true;
  }
  
  // Check for admin user type
  if (user.user_type === 'admin') {
    return true;
  }
  
  return false;
}

/**
 * Ensure that a user has a specific role
 * @param user The user object
 * @param role The role to check for
 * @throws ApiException if the user does not have the role
 */
export function ensureHasRole(user: User, role: string): void {
  if (!hasRole(user, role)) {
    throw ApiErrors.forbidden(`This action requires the ${role} role`);
  }
}

/**
 * Ensure that a user has a specific capability
 * @param user The user object
 * @param capability The capability to check for
 * @throws ApiException if the user does not have the capability
 */
export function ensureHasCapability(user: User, capability: string): void {
  if (!hasCapability(user, capability)) {
    throw ApiErrors.forbidden(`This action requires the ${capability} capability`);
  }
}

/**
 * Ensure that a user is an admin
 * @param user The user object
 * @throws ApiException if the user is not an admin
 */
export function ensureIsAdmin(user: User): void {
  if (!isAdmin(user)) {
    throw ApiErrors.forbidden('This action requires administrator privileges');
  }
}

/**
 * Ensure that a user has access to a resource
 * @param user The user object
 * @param resourceUserId The user ID associated with the resource
 * @throws ApiException if the user does not have access
 */
export function ensureResourceAccess(user: User, resourceUserId: number | string): void {
  // Convert to numbers for comparison
  const userId = Number(user.id);
  const resourceId = Number(resourceUserId);
  
  // Allow access if the user is the owner of the resource
  if (userId === resourceId) {
    return;
  }
  
  // Allow access if the user is an admin
  if (isAdmin(user)) {
    return;
  }
  
  throw ApiErrors.forbidden('You do not have permission to access this resource');
}

/**
 * Get the WordPress role for a user type
 * @param userType The user type
 * @returns The corresponding WordPress role
 */
export function getRoleForUserType(userType: string): string {
  return USER_TYPE_TO_ROLE_MAP[userType] || 'subscriber';
}