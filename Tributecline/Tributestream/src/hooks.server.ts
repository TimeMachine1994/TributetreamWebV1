import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { mockValidateToken } from '$lib/stores/mockData';

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
    roles: [],
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
        headers: { Location: `/login?returnUrl=${encodeURIComponent(path)}` }
      });
    }
    throw error(401, 'Unauthorized');
  }

  try {
    // Validate token using mock validation
    const token = authHeader.split(' ')[1];
    const validationResult = mockValidateToken(token);

    if (!validationResult.success || !validationResult.user) {
      throw error(401, 'Invalid token');
    }

    // Set auth information in locals
    event.locals.auth = {
      isAuthenticated: true,
      token,
      userId: validationResult.user.id.toString(),
      role: validationResult.user.roles[0], // Primary role
      roles: validationResult.user.roles,   // All roles
      calculatorStatus: validationResult.user.meta?.calculatorStatus || null
    };
    
    return await resolve(event);
  } catch (err) {
    console.error('Auth error:', err);
    if (!path.startsWith('/api')) {
      return new Response(null, {
        status: 303,
        headers: { Location: `/login?returnUrl=${encodeURIComponent(path)}` }
      });
    }
    throw error(401, 'Invalid token');
  }
};

// Combine middleware functions
export const handle = sequence(auth);
