/**
 * Type definitions for user roles
 */

/**
 * User role constants
 */
export const UserRoles = {
  ADMIN: 'admin',
  FUNERAL_DIRECTOR: 'funeral_director',
  VIEWER: 'viewer',
  PERSON_OF_CONTACT: 'person_of_contact',
  CONTRIBUTOR: 'contributor',
  VIDEOGRAPHER: 'videographer'
} as const;

/**
 * User role type
 */
export type UserRole = typeof UserRoles[keyof typeof UserRoles];