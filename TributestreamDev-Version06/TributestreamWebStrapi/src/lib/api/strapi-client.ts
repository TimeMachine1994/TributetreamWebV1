import type { AuthResponse, LoginCredentials, RegistrationData, StrapiResponse, User } from '../types/strapi.types';

/**
 * Base API client for Strapi
 */
class StrapiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    // Default to using the local Strapi instance
    this.baseUrl = import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337/api';
  }

  /**
   * Set the authentication token
   */
  setToken(token: string | null): void {
    this.token = token;
  }

  /**
   * Get the authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Get the authentication headers
   */
  getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Login a user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/local`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Authentication failed');
    }

    const data = await response.json();
    this.setToken(data.jwt);
    return data;
  }

  /**
   * Register a new user
   */
  async register(userData: RegistrationData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/local/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Registration failed');
    }

    const data = await response.json();
    this.setToken(data.jwt);
    return data;
  }

  /**
   * Get the current user
   */
  async getMe(): Promise<StrapiResponse<User>> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.baseUrl}/users/me`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get user data');
    }

    return await response.json();
  }

  /**
   * Generic GET request
   */
  async get<T>(path: string, params: Record<string, string> = {}): Promise<StrapiResponse<T>> {
    // Build query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });

    const query = queryParams.toString();
    const url = `${this.baseUrl}/${path}${query ? `?${query}` : ''}`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Failed to fetch ${path}`);
    }

    return await response.json();
  }

  /**
   * Generic POST request
   */
  async post<T>(path: string, data: any): Promise<StrapiResponse<T>> {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Failed to create ${path}`);
    }

    return await response.json();
  }

  /**
   * Generic PUT request
   */
  async put<T>(path: string, data: any): Promise<StrapiResponse<T>> {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Failed to update ${path}`);
    }

    return await response.json();
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(path: string): Promise<StrapiResponse<T>> {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Failed to delete ${path}`);
    }

    return await response.json();
  }
}

// Create a singleton instance
const strapiClient = new StrapiClient();

export default strapiClient;