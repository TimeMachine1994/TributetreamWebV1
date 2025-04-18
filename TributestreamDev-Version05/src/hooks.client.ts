import { browser } from '$app/environment';
import type { HandleClientError, HandleFetch } from '@sveltejs/kit';

/**
 * SvelteKit client hook for handling fetch requests
 * 
 * This hook attaches the JWT token to outgoing requests to the WordPress REST API.
 */
export const handleFetch: HandleFetch = async ({ request, fetch }) => {
  // Only intercept requests to the WordPress REST API
  const url = new URL(request.url);
  
  // Check if this is a request to our WordPress API
  const isWordPressApiRequest = url.href.includes('/wp-json/') || 
                               url.href.includes('/api/auth/');
  
  if (browser && isWordPressApiRequest) {
    // Get the JWT token from the cookie
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const tokenCookie = cookies.find(cookie => cookie.startsWith('wp_jwt_token='));
    
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      
      // Clone the request and add the Authorization header
      const headers = new Headers(request.headers);
      
      // Only add the Authorization header if it's not already set
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Create a new request with the updated headers
      const newRequest = new Request(request.url, {
        method: request.method,
        headers,
        body: request.body,
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        referrer: request.referrer,
        integrity: request.integrity
      });
      
      return fetch(newRequest);
    }
  }
  
  // For all other requests, proceed normally
  return fetch(request);
};

/**
 * SvelteKit client hook for handling errors
 * 
 * This hook handles authentication errors and redirects to the login page.
 */
export const handleError: HandleClientError = ({ error, event }) => {
  // Check if this is an authentication error
  const isAuthError = error instanceof Error && 
                     (error.message.includes('Authentication failed') || 
                      error.message.includes('Invalid token') ||
                      error.message.includes('Unauthorized'));
  
  // If this is an authentication error, redirect to the login page
  if (browser && isAuthError) {
    // Clear the user data from localStorage
    localStorage.removeItem('wp_user');
    
    // Redirect to the login page
    window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
    
    return {
      message: 'Redirecting to login page...'
    };
  }
  
  // For all other errors, proceed normally
  return {
    message: error instanceof Error ? error.message : 'An unexpected error occurred'
  };
};