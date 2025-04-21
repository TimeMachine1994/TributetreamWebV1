import { browser } from '$app/environment';
import type { StrapiUser } from '$lib/types/auth';

// Reactive state for authentication using runes
export let user = $state<StrapiUser | null>(null);
export let token = $state<string | null>(null);
export let loading = $state(false);
export let error = $state<string | null>(null);

// Derived states using $derived rune
export let isAuthenticated = $derived(!!token && !!user);
export let isAdmin = $derived(user?.role?.type === 'admin');

// Check if user has a specific role
export function hasRole(roleName: string): boolean {
  return user?.role?.name === roleName;
}

// Check if user has a specific permission
export function hasPermission(permission: string): boolean {
  // This would need to be expanded based on how you structure permissions
  return isAdmin || (user?.role?.name === permission);
}

// Initialize from localStorage (client-side only)
export function initAuth() {
  if (browser) {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      token = savedToken;
    }
  }
}

// Handle login success
export function setAuthData(jwt: string, userData: StrapiUser) {
  token = jwt;
  user = userData;
  
  if (browser) {
    localStorage.setItem('auth_token', jwt);
  }
}

// Handle logout
export function clearAuth() {
  token = null;
  user = null;
  
  if (browser) {
    localStorage.removeItem('auth_token');
  }
}

// Create an effect to sync token changes with localStorage
$effect(() => {
  if (browser) {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
});

// Initialize on script load
initAuth();
