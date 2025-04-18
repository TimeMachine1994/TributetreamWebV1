import { browser } from '$app/environment';
import { WP_API_URL, WP_API_NAMESPACE } from '$lib/utils/env';
import { ApiError, AuthError, parseErrorResponse, handleFetchError } from '$lib/utils/error-handlers';

/**
 * Request options interface extending the standard RequestInit
 */
export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  withAuth?: boolean;
}

/**
 * Base API client for WordPress REST API
 * Handles common functionality like authentication, request/response formatting, error handling
 */
export class BaseApiClient {
  private baseUrl: string;
  private namespace: string;
  
  /**
   * Create a new BaseApiClient instance
   * @param baseUrl Base URL for the WordPress REST API
   * @param namespace API namespace
   */
  constructor(baseUrl: string = WP_API_URL, namespace: string = WP_API_NAMESPACE) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.namespace = namespace;
  }
  
  /**
   * Get the full URL for an endpoint
   * @param endpoint API endpoint
   * @param params Query parameters
   * @returns Full URL
   */
  getFullUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = this.getUrl(endpoint);
    return this.addQueryParams(url, params);
  }
  
  /**
   * Get the base URL for an endpoint
   * @param endpoint API endpoint
   * @returns Base URL without query parameters
   */
  private getUrl(endpoint: string): string {
    // If the endpoint already starts with http, assume it's a full URL
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    // If the endpoint starts with a slash, remove it
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // Construct the full URL
    return `${this.baseUrl}/${this.namespace}/${cleanEndpoint}`;
  }
  
  /**
   * Add query parameters to a URL
   * @param url Base URL
   * @param params Query parameters
   * @returns URL with query parameters
   */
  private addQueryParams(url: string, params?: Record<string, string | number | boolean | undefined>): string {
    if (!params) return url;
    
    const urlObj = new URL(url);
    
    // Add each parameter to the URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        urlObj.searchParams.append(key, String(value));
      }
    });
    
    return urlObj.toString();
  }
  
  /**
   * Make a request to the API
   * @param endpoint API endpoint
   * @param options Request options
   * @returns Promise resolving to the response data
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    try {
      const { params, withAuth = true, ...fetchOptions } = options;
      
      // Get the full URL with query parameters
      const url = this.addQueryParams(this.getUrl(endpoint), params);
      
      // Set up headers
      const headers = new Headers(fetchOptions.headers);
      
      // Set content type if not already set and not a FormData body
      if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }
      
      // Set up request options
      const requestOptions: RequestInit = {
        ...fetchOptions,
        headers,
        credentials: 'include', // Include cookies for authentication
      };
      
      // Make the request
      const response = await fetch(url, requestOptions);
      
      // Handle error responses
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          throw new AuthError('Authentication failed', response.status);
        }
        
        // Handle other errors
        throw await parseErrorResponse(response);
      }
      
      // Parse the response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json() as T;
      } else {
        // For non-JSON responses, return the text
        return await response.text() as unknown as T;
      }
    } catch (error) {
      // Handle fetch errors
      throw handleFetchError(error);
    }
  }
  
  /**
   * Make a GET request
   * @param endpoint API endpoint
   * @param params Query parameters
   * @param options Additional request options
   * @returns Promise resolving to the response data
   */
  async get<T>(
    endpoint: string, 
    params?: Record<string, string | number | boolean | undefined>, 
    options: Omit<RequestOptions, 'params'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
      params
    });
  }
  
  /**
   * Make a POST request
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Additional request options
   * @returns Promise resolving to the response data
   */
  async post<T>(
    endpoint: string, 
    data?: any, 
    options: Omit<RequestOptions, 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined
    });
  }
  
  /**
   * Make a PUT request
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Additional request options
   * @returns Promise resolving to the response data
   */
  async put<T>(
    endpoint: string, 
    data?: any, 
    options: Omit<RequestOptions, 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined
    });
  }
  
  /**
   * Make a PATCH request
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Additional request options
   * @returns Promise resolving to the response data
   */
  async patch<T>(
    endpoint: string, 
    data?: any, 
    options: Omit<RequestOptions, 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined
    });
  }
  
  /**
   * Make a DELETE request
   * @param endpoint API endpoint
   * @param options Additional request options
   * @returns Promise resolving to the response data
   */
  async delete<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE'
    });
  }
}

// Create and export a singleton instance
export const apiClient = new BaseApiClient();