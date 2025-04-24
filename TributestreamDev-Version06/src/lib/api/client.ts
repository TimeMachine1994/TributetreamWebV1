/**
 * API client utilities for making authenticated requests to Strapi
 */

/**
 * Create fetch options with JWT authentication
 * @param jwt JWT token
 * @param options Additional fetch options
 * @returns Fetch options with Authorization header
 */
export function createAuthFetchOptions(jwt: string | undefined, options: RequestInit = {}): RequestInit {
  if (!jwt) return options;

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${jwt}`);

  return {
    ...options,
    headers
  };
}

/**
 * Fetch wrapper with JWT authentication
 * @param url API endpoint URL
 * @param jwt JWT token
 * @param options Additional fetch options
 * @returns Fetch response
 */
export async function apiFetch(url: string, jwt: string | undefined, options: RequestInit = {}) {
  const fetchOptions = createAuthFetchOptions(jwt, {
    ...options,
    // Add keepalive and proper timeout settings
    keepalive: true,
    signal: AbortSignal.timeout(5000) // 5 second timeout
  });
  
  console.log('[API Client] Making fetch request:', {
    url,
    options: {
      ...fetchOptions,
      headers: Object.fromEntries(new Headers(fetchOptions.headers).entries())
    }
  });
  
  return fetch(url, fetchOptions);
}

/**
 * Get the full Strapi API URL
 * @param path API endpoint path
 * @returns Full Strapi API URL
 */
export function getStrapiUrl(path: string): string {
  // Use 0.0.0.0 instead of localhost for better container compatibility
  const baseUrl = 'http://localhost:1338'; // TODO: Move to environment variables
  const fullUrl = `${baseUrl}${path}`;
  console.log('[API Client] Constructing Strapi URL:', {
    baseUrl,
    path,
    fullUrl
  });
  return fullUrl;
}

/**
 * Mock registration for testing when Strapi is not available
 * This creates a simulated successful registration response
 */
export function mockRegistrationResponse(username: string, email: string): any {
  console.log('⚠️ [API Client] Using MOCK registration response');
  
  // Generate a fake JWT token for testing
  const mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  return {
    jwt: mockJwt,
    user: {
      id: Math.floor(Math.random() * 1000),
      username,
      email,
      provider: 'local',
      confirmed: true,
      blocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
}