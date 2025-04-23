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
  const fetchOptions = createAuthFetchOptions(jwt, options);
  return fetch(url, fetchOptions);
}

/**
 * Get the full Strapi API URL
 * @param path API endpoint path
 * @returns Full Strapi API URL
 */
export function getStrapiUrl(path: string): string {
  const baseUrl = 'http://localhost:1338'; // TODO: Move to environment variables
  return `${baseUrl}${path}`;
}