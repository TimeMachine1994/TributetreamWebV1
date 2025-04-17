// src/lib/stores/auth-store.ts
import { writable, derived, get } from 'svelte/store';
import type { User } from '$lib/utils/cookie-auth';

// Create the base store
const createAuthStore = () => {
  // Internal state
  const state = writable({
    token: null as string | null,
    user: null as User | null,
    isAuthenticated: false,
    isValidating: false,
    lastValidated: 0
  });

  // Private state
  const tokenValidationCache = new Map<string, { isValid: boolean, timestamp: number }>();
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  
  // Debug mode flag
  let debugMode = false;

  // Derived state
  const isAuthenticated = derived(state, $state => $state.isAuthenticated);
  const user = derived(state, $state => $state.user);
  
  // Store API
  return {
    subscribe: state.subscribe,
    isAuthenticated,
    user,
    
    // Validate token with caching
    validateToken: async (token: string) => {
      const startTime = performance.now();
      authStore.debug(`validateToken called for token: ${token ? token.substring(0, 10) + '...' : 'null'}`);
      
      if (!token) {
        authStore.debug('No token provided, returning false');
        state.update(s => ({ ...s, isAuthenticated: false }));
        return false;
      }
      
      // Check cache first
      const cached = tokenValidationCache.get(token);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp < CACHE_EXPIRY)) {
        authStore.debug(`Using cached validation result: ${cached.isValid}`);
        state.update(s => ({ 
          ...s, 
          isAuthenticated: cached.isValid,
          lastValidated: cached.timestamp
        }));
        return cached.isValid;
      }
      
      // Check if already validating
      const currentState = get(state);
      if (currentState.isValidating) {
        authStore.debug('Already validating, waiting for completion');
        // Wait for current validation to complete
        return new Promise(resolve => {
          const unsubscribe = state.subscribe(s => {
            if (!s.isValidating) {
              unsubscribe();
              authStore.debug(`Validation completed while waiting: ${s.isAuthenticated}`);
              resolve(s.isAuthenticated);
            }
          });
        });
      }
      
      // Mark as validating to prevent duplicate requests
      state.update(s => ({ ...s, isValidating: true }));
      authStore.debug('Starting token validation request');
      
      try {
        const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token/validate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const isValid = response.ok;
        const endTime = performance.now();
        authStore.debug(`Validation request completed in ${endTime - startTime}ms: ${isValid}`);
        
        // Cache the result
        tokenValidationCache.set(token, { isValid, timestamp: now });
        
        // Update state
        state.update(s => ({ 
          ...s, 
          isAuthenticated: isValid,
          isValidating: false,
          lastValidated: now
        }));
        
        return isValid;
      } catch (error) {
        const endTime = performance.now();
        authStore.debug(`Validation request failed in ${endTime - startTime}ms:`, error);
        
        // Cache the negative result (but for less time)
        tokenValidationCache.set(token, { isValid: false, timestamp: now });
        
        // Update state
        state.update(s => ({ 
          ...s, 
          isAuthenticated: false,
          isValidating: false,
          lastValidated: now
        }));
        
        return false;
      }
    },
    
    // Initialize from cookies
    initFromCookies: (token: string | null, userData: User | null) => {
      state.update(s => ({ ...s, token, user: userData }));
      
      // If we have a token, validate it
      if (token) {
        return authStore.validateToken(token);
      }
      
      return Promise.resolve(false);
    },
    
    // Log out
    logout: () => {
      state.update(s => ({
        ...s,
        token: null,
        user: null,
        isAuthenticated: false
      }));
      
      // You would also need to clear cookies here or call an API
    },
    
    // Enable/disable debug mode
    setDebugMode: (enabled: boolean) => {
      debugMode = enabled;
    },
    
    // Debug log helper
    debug: (message: string, ...args: any[]) => {
      if (debugMode) {
        console.log(`[AuthStore] ${message}`, ...args);
      }
    }
  };
};

// Create and export the singleton store
export const authStore = createAuthStore();

// Enable debug mode in development
if (typeof window !== 'undefined') {
  // Only run in browser context
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1';
  authStore.setDebugMode(isDev);
}
