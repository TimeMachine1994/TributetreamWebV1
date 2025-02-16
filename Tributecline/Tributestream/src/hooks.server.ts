import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/api/auth',
  '/api/register',
  '/api/validate-token'
];

// Helper to check if a path is public
const isPublicPath = (path: string): boolean => {
  return PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath));
};

// Authentication handler
const auth: Handle = async ({ event, resolve }) => {
  // Initialize auth in locals
  event.locals.auth = {
    isAuthenticated: false,
    token: null,
    userId: null,
    role: null,
    calculatorStatus: null
  };

  const path = event.url.pathname;
  
  // Allow public paths without authentication
  if (isPublicPath(path)) {
    return await resolve(event);
  }

  // Check for Authorization header
  const authHeader = event.request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Instead of throwing error, redirect to login for non-API routes
    if (!path.startsWith('/api')) {
      return new Response(null, {
        status: 303,
        headers: { Location: '/login' }
      });
    }
    throw error(401, 'Unauthorized');
  }

  try {
    // Set auth information in locals
    const token = authHeader.split(' ')[1];
    event.locals.auth = {
      isAuthenticated: true,
      token,
      userId: null, // This could be set after token validation if needed
      role: null,   // This could be set after token validation if needed
      calculatorStatus: null
    };
    
    return await resolve(event);
  } catch (err) {
    console.error('Auth error:', err);
    throw error(401, 'Invalid token');
  }
};

// Combine middleware functions
export const handle = sequence(auth);
