// - /src/lib/server/api/apiHandler.ts

  //**************************************************************************************************** */
  // The point of this file is to allow for us to have a central point to make API requests,
  // securely, on the server, so we don't expose API endpoints to the client. This file will serve
  // as the base handler to integrate  with both our development environment (using MSW mocks)
  // and production WordPress backend. It will manage authentication, standardize our request/response
  // patterns, and provide consistent error handling across all API calls.
  //**************************************************************************************************** */
  import { dev } from '$app/environment';

// Define the shape of all API responses for consistent typing
interface ApiResponse<T> {
    data?: T;                // The response data of type T
    error?: string;          // Error message if something goes wrong
    status: number;          // HTTP status code
}

export class ApiHandler {
    private baseUrl: string;     // Base URL for all API requests
    private token: string | null; // JWT token for authenticated requests

    constructor() {
        // Set base URL based on environment
        // Uses localhost for development (works with MSW)
        // Uses production URL for live environment
        this.baseUrl = dev ? 'http://localhost' : 'https://tributestream.com';
        this.token = null;
    }

    // Generic request method that handles all API calls
    // T is the expected return type of the API call
    async request<T>(
        endpoint: string,            // API endpoint (e.g., '/wp-json/wp/v2/search')
        options: RequestInit = {}    // Fetch API options (method, body, etc.)
    ): Promise<ApiResponse<T>> {
        // Construct headers with content type and auth token if present
        const headers = {
            'Content-Type': 'application/json',
            // Add JWT token to Authorization header if it exists
            ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
            // Merge any additional headers passed in options
            ...options.headers
        };

        try {
            // Make the API request
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers
            });

            // Parse JSON response
            const data = await response.json();

            // Return successful response
            return {
                data,
                status: response.status
            };
        } catch (error) {
            // Handle any errors that occur during the request
            return {
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                status: 500
            };
        }
    }

    // Method to set JWT token for authenticated requests
    setToken(token: string) {
        this.token = token;
    }
}

// Export a singleton instance for use throughout the application
export const api = new ApiHandler();
