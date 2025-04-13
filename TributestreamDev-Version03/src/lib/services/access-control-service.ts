/**
 * Access Control Service
 * 
 * This service provides role-based access control functionality for the admin interface.
 * It checks if the current user has admin privileges and controls access to protected resources.
 */

import { authStore } from './auth-service';
import { get } from 'svelte/store';
import type { User } from '$lib/utils/cookie-auth';
import { getUserFromCookies } from '$lib/utils/auth-helpers';
import type { Cookies } from '@sveltejs/kit';

export const accessControlService = {
  /**
   * Check if the current user has admin access
   * @returns boolean indicating if the user has admin access
   */
  hasAdminAccess: () => {
    const authState = get(authStore);
    const user = authState.user;
    
    if (!user) {
      return false;
    }
    
    // Check if user has administrator role
    return (user.roles || []).includes('administrator');
  },
  
  /**
   * Check if the current user has admin access using cookies (server-side)
   * @param cookies The cookies object from the request
   * @returns boolean indicating if the user has admin access
   */
  hasAdminAccessFromCookies: (cookies: Cookies): boolean => {
    const user = getUserFromCookies(cookies);
    
    if (!user) {
      return false;
    }
    
    // For now, we're assuming admin users have ID 1
    // This should be replaced with proper role checking when available
    return user.id === '1';
  },
  
  /**
   * Check if the current user can access a specific resource
   * @param resource The resource to check access for
   * @param action The action to perform on the resource (read, write, delete)
   * @returns boolean indicating if the user can access the resource
   */
  canAccess: (resource: string, action: string) => {
    // For MVP, simply check if user is an admin
    return accessControlService.hasAdminAccess();
  }
};