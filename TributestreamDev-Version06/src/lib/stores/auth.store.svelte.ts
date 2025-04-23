import { goto } from '$app/navigation';
import type { UserData } from '$lib/auth/types';

/**
 * Authentication store for managing user authentication state
 */

// Default unauthenticated state
const DEFAULT_USER: UserData = {
  id: 0,
  email: '',
  authenticated: false
};

// Private state - not exported directly
let _user = $state<UserData>(DEFAULT_USER);

// Initialize from window if available (client-side only)
if (typeof window !== 'undefined' && (window as any).__user) {
  const windowUser = (window as any).__user;
  if (windowUser) {
    _user.id = windowUser.id || 0;
    _user.email = windowUser.email || '';
    _user.name = windowUser.name;
    _user.authenticated = windowUser.authenticated || false;
  }
}

/**
 * Get the current user
 * @returns The current user data
 */
export function getUser(): UserData {
  return {
    id: _user.id,
    email: _user.email,
    name: _user.name,
    authenticated: _user.authenticated
  };
}

/**
 * Update user data
 * @param userData User data to set
 */
export function setUser(userData: UserData): void {
  _user.id = userData.id;
  _user.email = userData.email;
  _user.name = userData.name;
  _user.authenticated = userData.authenticated;
}

/**
 * Check if user is authenticated
 * @returns True if user is authenticated
 */
export function isAuthenticated(): boolean {
  return _user.authenticated;
}

/**
 * Handle logout
 * Clears the JWT cookie and redirects to login page
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Update user properties without reassignment
    _user.id = 0;
    _user.email = '';
    _user.name = undefined;
    _user.authenticated = false;
    
    goto('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}