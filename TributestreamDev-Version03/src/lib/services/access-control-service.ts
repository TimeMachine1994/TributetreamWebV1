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
    
    // Check if user has administrator role or is user ID 1
    return (user.roles || []).includes('administrator') || user.id === 1 || user.id === '1';
  },
  
  /**
   * Check if the current user has admin access using cookies (server-side)
   * @param cookies The cookies object from the request
   * @returns boolean indicating if the user has admin access
   */
  hasAdminAccessFromCookies: (cookies: Cookies): boolean => {
    console.log('[access-control] Checking admin access from cookies');
    const user = getUserFromCookies(cookies);
    
    if (!user) {
      console.log('[access-control] No user found in cookies');
      return false;
    }
    
    console.log('[access-control] User from cookies:', user);
    console.log('[access-control] User ID:', user.id, 'Type:', typeof user.id);
    
    // Check if user is admin by ID or roles
    // The WordPress plugin considers user ID 1 as admin
    const isAdmin = user.id === 1 || user.id === '1' || (Array.isArray(user.roles) && user.roles.includes('administrator'));
    console.log('[access-control] Is admin check - ID:', user.id, 'Roles:', user.roles, 'Result:', isAdmin);
    return isAdmin;
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