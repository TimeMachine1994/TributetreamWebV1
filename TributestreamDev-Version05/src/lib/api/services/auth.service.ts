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
    this.apiClient = new BaseApiClient(baseUrl, '');
  }
  
  /**
   * Login with username and password
   * @param credentials Login credentials
   * @returns Promise resolving to the user data
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // Make the login request
      const response = await this.apiClient.post<JWTAuthResponse>('token', credentials);
      
      // Extract user data from the response
      const user: User = {
        email: response.user_email,
        nicename: response.user_nicename,
        displayName: response.user_display_name
      };
      
      // Store the token and user data
      if (browser) {
        // Store token in HttpOnly cookie (handled by the server)
        // Store user data in localStorage for client-side access
        localStorage.setItem(this.userKey, JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new AuthError(error.message, error.status, error.data);
      }
      throw error;
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
      // Make the validation request
      await this.apiClient.post<any>('token/validate');
      return true;
    } catch (error) {
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
      // Make the registration request to the WordPress REST API
      const response = await this.apiClient.post<any>('/wp/v2/users/register', userData, {
        withAuth: false
      });
      
      // Login with the new credentials
      return this.login({
        username: userData.username,
        password: userData.password
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new AuthError(error.message, error.status, error.data);
      }
      throw error;
    }
  }
  
  /**
   * Request a password reset
   * @param email User email
   * @returns Promise resolving to a success message
   */
  async requestPasswordReset(email: string): Promise<string> {
    try {
      // Make the password reset request
      const response = await this.apiClient.post<any>('/wp/v2/users/lostpassword', { email }, {
        withAuth: false
      });
      
      return response.message || 'Password reset email sent';
    } catch (error) {
      if (error instanceof ApiError) {
        throw new AuthError(error.message, error.status, error.data);
      }
      throw error;
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
      // Make the password reset request
      const response = await this.apiClient.post<any>('/wp/v2/users/resetpassword', {
        key,
        login,
        password
      }, {
        withAuth: false
      });
      
      return response.message || 'Password reset successful';
    } catch (error) {
      if (error instanceof ApiError) {
        throw new AuthError(error.message, error.status, error.data);
      }
      throw error;
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();