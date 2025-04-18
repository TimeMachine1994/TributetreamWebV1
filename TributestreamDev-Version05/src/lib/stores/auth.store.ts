import { writable, derived } from 'svelte/store';
import type { AuthState, User } from '$lib/types/auth.types';
import { authService } from '$lib/api/services/auth.service';
import { browser } from '$app/environment';

/**
 * Initial authentication state
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

/**
 * Create the authentication store
 */
function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);
  
  /**
   * Initialize the authentication store
   */
  async function init() {
    if (!browser) {
      return;
    }
    
    update(state => ({ ...state, isLoading: true }));
    
    try {
      // Get the current user from localStorage
      const user = authService.getCurrentUser();
      
      if (user) {
        // Validate the token
        const isValid = await authService.validateToken();
        
        if (isValid) {
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          // Token is invalid, logout
          await logout();
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication error'
      });
    }
  }
  
  /**
   * Login with username and password
   * @param username Username
   * @param password Password
   */
  async function login(username: string, password: string) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const user = await authService.login({ username, password });
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return user;
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      });
      
      throw error;
    }
  }
  
  /**
   * Logout the current user
   */
  async function logout() {
    update(state => ({ ...state, isLoading: true }));
    
    try {
      await authService.logout();
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      }));
      
      throw error;
    }
  }
  
  /**
   * Register a new user
   * @param userData User registration data
   */
  async function register(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const user = await authService.register(userData);
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return user;
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      });
      
      throw error;
    }
  }
  
  /**
   * Update the current user data
   * @param userData User data to update
   */
  function updateUser(userData: Partial<User>) {
    update(state => {
      if (!state.user) {
        return state;
      }
      
      const updatedUser = {
        ...state.user,
        ...userData
      };
      
      // Update user data in localStorage
      if (browser) {
        localStorage.setItem('wp_user', JSON.stringify(updatedUser));
      }
      
      return {
        ...state,
        user: updatedUser
      };
    });
  }
  
  /**
   * Request a password reset
   * @param email User email
   */
  async function requestPasswordReset(email: string) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const message = await authService.requestPasswordReset(email);
      
      update(state => ({
        ...state,
        isLoading: false
      }));
      
      return message;
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset request failed'
      }));
      
      throw error;
    }
  }
  
  /**
   * Reset password with reset key
   * @param key Reset key
   * @param login Username or email
   * @param password New password
   */
  async function resetPassword(key: string, login: string, password: string) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const message = await authService.resetPassword(key, login, password);
      
      update(state => ({
        ...state,
        isLoading: false
      }));
      
      return message;
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset failed'
      }));
      
      throw error;
    }
  }
  
  /**
   * Clear any authentication errors
   */
  function clearError() {
    update(state => ({
      ...state,
      error: null
    }));
  }
  
  // Initialize the store if in browser environment
  if (browser) {
    init();
  }
  
  return {
    subscribe,
    login,
    logout,
    register,
    updateUser,
    requestPasswordReset,
    resetPassword,
    clearError,
    init
  };
}

// Create and export the authentication store
export const authStore = createAuthStore();

// Derived stores for convenience
export const user = derived(authStore, $authStore => $authStore.user);
export const isAuthenticated = derived(authStore, $authStore => $authStore.isAuthenticated);
export const isLoading = derived(authStore, $authStore => $authStore.isLoading);
export const authError = derived(authStore, $authStore => $authStore.error);