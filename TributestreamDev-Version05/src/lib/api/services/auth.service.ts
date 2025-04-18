import { browser } from '$app/environment';
import { JWT_AUTH_URL } from '$lib/utils/env';
import { ApiError, AuthError } from '$lib/utils/error-handlers';
import type { JWTAuthResponse, LoginCredentials, User } from '$lib/types/auth.types';
import { BaseApiClient } from '../base-api.client';

/**
 * Authentication service for WordPress REST API
 * 
 * This service handles JWT authentication with the WordPress REST API.
 */
export class AuthService {
  private apiClient: BaseApiClient;
  private tokenKey = 'wp_jwt_token';
  private userKey = 'wp_user';
  
  /**
   * Create a new AuthService instance
   * @param baseUrl Base URL for the WordPress REST API
   */
  constructor(baseUrl: string = JWT_AUTH_URL) {
    // Use SvelteKit server endpoint as a proxy instead of direct WordPress API
    // This avoids CORS issues when making requests from the browser
    const proxyUrl = '/api/auth';
    
    // Create API client with the proxy URL
    this.apiClient = new BaseApiClient(proxyUrl, '');
    
    // Debug log
    console.log('Auth Service initialized with proxy URL:', proxyUrl);
    console.log('Original WordPress API URL:', baseUrl);
  }
  
  /**
   * Login with username and password
   * @param credentials Login credentials
   * @returns Promise resolving to the user data
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // Make the login request to the SvelteKit server endpoint
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include' // Include cookies for authentication
      });
      
      // Parse the response
      const data = await response.json();
      
      if (!response.ok) {
        throw new AuthError(
          data.message || 'Authentication failed',
          response.status,
          data
        );
      }
      
      // Extract user data from the response
      const user: User = data.user;
      
      // Store user data in localStorage for client-side access
      if (browser) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        error instanceof Error ? error.message : 'Authentication failed',
        500
      );
    }
  }
  
  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    if (browser) {
      // Clear user data from localStorage
      localStorage.removeItem(this.userKey);
      
      // Clear token cookie (handled by the server)
      await fetch('/api/auth/logout', { method: 'POST' });
    }
  }
  
  /**
   * Validate the current token
   * @returns Promise resolving to a boolean indicating if the token is valid
   */
  async validateToken(): Promise<boolean> {
    try {
      // Make the validation request to the SvelteKit server endpoint
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        credentials: 'include' // Include cookies for authentication
      });
      
      // Check if the response is successful
      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
  
  /**
   * Get the current user data
   * @returns User data or null if not logged in
   */
  getCurrentUser(): User | null {
    if (!browser) {
      return null;
    }
    
    const userData = localStorage.getItem(this.userKey);
    
    if (!userData) {
      return null;
    }
    
    try {
      return JSON.parse(userData) as User;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Check if the user is authenticated
   * @returns Boolean indicating if the user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
  
  /**
   * Register a new user
   * @param userData User registration data
   * @returns Promise resolving to the user data
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    try {
      // Make the registration request to the SvelteKit server endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include' // Include cookies for authentication
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new AuthError(
          data.message || 'Registration failed',
          response.status,
          data
        );
      }
      
      // Login with the new credentials
      return this.login({
        username: userData.username,
        password: userData.password
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        error instanceof Error ? error.message : 'Registration failed',
        500
      );
    }
  }
  
  /**
   * Request a password reset
   * @param email User email
   * @returns Promise resolving to a success message
   */
  async requestPasswordReset(email: string): Promise<string> {
    try {
      // Make the password reset request to the SvelteKit server endpoint
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }),
        credentials: 'include' // Include cookies for authentication
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new AuthError(
          data.message || 'Password reset request failed',
          response.status,
          data
        );
      }
      
      return data.message || 'Password reset email sent';
    } catch (error) {
      console.error('Password reset request error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        error instanceof Error ? error.message : 'Password reset request failed',
        500
      );
    }
  }
  
  /**
   * Reset password with reset key
   * @param key Reset key
   * @param login Username or email
   * @param password New password
   * @returns Promise resolving to a success message
   */
  async resetPassword(key: string, login: string, password: string): Promise<string> {
    try {
      // Make the password reset confirmation request to the SvelteKit server endpoint
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key,
          login,
          password
        }),
        credentials: 'include' // Include cookies for authentication
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new AuthError(
          data.message || 'Password reset failed',
          response.status,
          data
        );
      }
      
      return data.message || 'Password reset successful';
    } catch (error) {
      console.error('Password reset error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        error instanceof Error ? error.message : 'Password reset failed',
        500
      );
    }
  }
}

// Create and export a singleton instance
// Force using the updated environment variables by recreating the service
console.log('Creating new AuthService with URL:', JWT_AUTH_URL);
export const authService = new AuthService(JWT_AUTH_URL);