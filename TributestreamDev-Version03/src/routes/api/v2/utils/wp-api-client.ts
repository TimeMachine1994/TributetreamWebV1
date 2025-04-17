/**
 * WordPress API client for the API v2 endpoints
 */
import { env } from '$env/dynamic/private';
import { ApiErrors } from './error-handler';

/**
 * Base URL for the WordPress REST API
 */
const WP_API_BASE_URL = env.WP_API_URL || 'http://localhost/wp-json';

/**
 * WordPress API client for making requests to the WordPress REST API
 */
export class WordPressApiClient {
  private baseUrl: string;
  private token: string | null;
  
  /**
   * Create a new WordPress API client
   * @param token JWT token for authenticated requests
   * @param baseUrl Base URL for the WordPress REST API
   */
  constructor(token: string | null = null, baseUrl: string = WP_API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = token;
  }
  
  /**
   * Set the JWT token for authenticated requests
   * @param token JWT token
   */
  setToken(token: string): void {
    this.token = token;
  }
  
  /**
   * Get the headers for a request
   * @param includeToken Whether to include the JWT token in the headers
   * @returns Headers for the request
   */
  private getHeaders(includeToken: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (includeToken && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }
  
  /**
   * Make a request to the WordPress REST API
   * @param endpoint API endpoint (relative to the base URL)
   * @param method HTTP method
   * @param data Request data
   * @param includeToken Whether to include the JWT token in the headers
   * @returns Response data
   * @throws ApiException if the request fails
   */
  private async request<T = any>(
    endpoint: string,
    method: string = 'GET',
    data: any = null,
    includeToken: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: this.getHeaders(includeToken)
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw ApiErrors.serviceUnavailable('WordPress API returned a non-JSON response');
        }
        return {} as T;
      }
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Handle WordPress API errors
        if (responseData.code && responseData.message) {
          throw ApiErrors.serviceUnavailable(
            `WordPress API error: ${responseData.message}`,
            { code: responseData.code, data: responseData.data }
          );
        }
        
        throw ApiErrors.serviceUnavailable('WordPress API request failed');
      }
      
      return responseData as T;
    } catch (error) {
      if (error instanceof Error) {
        console.error('WordPress API request failed:', error.message);
        
        // Re-throw ApiException errors
        if (error.name === 'ApiException') {
          throw error;
        }
        
        throw ApiErrors.serviceUnavailable(`WordPress API request failed: ${error.message}`);
      }
      
      throw ApiErrors.serviceUnavailable('WordPress API request failed');
    }
  }
  
  /**
   * Make a GET request to the WordPress REST API
   * @param endpoint API endpoint (relative to the base URL)
   * @param includeToken Whether to include the JWT token in the headers
   * @returns Response data
   */
  async get<T = any>(endpoint: string, includeToken: boolean = true): Promise<T> {
    return this.request<T>(endpoint, 'GET', null, includeToken);
  }
  
  /**
   * Make a POST request to the WordPress REST API
   * @param endpoint API endpoint (relative to the base URL)
   * @param data Request data
   * @param includeToken Whether to include the JWT token in the headers
   * @returns Response data
   */
  async post<T = any>(endpoint: string, data: any, includeToken: boolean = true): Promise<T> {
    return this.request<T>(endpoint, 'POST', data, includeToken);
  }
  
  /**
   * Make a PUT request to the WordPress REST API
   * @param endpoint API endpoint (relative to the base URL)
   * @param data Request data
   * @param includeToken Whether to include the JWT token in the headers
   * @returns Response data
   */
  async put<T = any>(endpoint: string, data: any, includeToken: boolean = true): Promise<T> {
    return this.request<T>(endpoint, 'PUT', data, includeToken);
  }
  
  /**
   * Make a PATCH request to the WordPress REST API
   * @param endpoint API endpoint (relative to the base URL)
   * @param data Request data
   * @param includeToken Whether to include the JWT token in the headers
   * @returns Response data
   */
  async patch<T = any>(endpoint: string, data: any, includeToken: boolean = true): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', data, includeToken);
  }
  
  /**
   * Make a DELETE request to the WordPress REST API
   * @param endpoint API endpoint (relative to the base URL)
   * @param includeToken Whether to include the JWT token in the headers
   * @returns Response data
   */
  async delete<T = any>(endpoint: string, includeToken: boolean = true): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', null, includeToken);
  }
}

/**
 * Create a new WordPress API client with a token
 * @param token JWT token for authenticated requests
 * @returns WordPress API client
 */
export function createWpApiClient(token: string | null = null): WordPressApiClient {
  return new WordPressApiClient(token);
}