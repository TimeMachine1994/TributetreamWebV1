/**
 * Server-side configuration file
 * Contains private/sensitive configuration values only accessible from server code
 * Note: This file should only be imported in server-side code (hooks.server.ts, +page.server.ts, etc.)
 */
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

/**
 * Server-side API configuration for Strapi
 */
export const strapiConfig = {
  // Strapi API base URL
  baseUrl: env.STRAPI_URL || 'http://localhost:1337',
  
  // API token for authenticated requests from the server
  apiToken: env.STRAPI_API_TOKEN || 'development_token',
  
  // Default headers for authenticated API requests
  headers: {
    'Authorization': `Bearer ${env.STRAPI_API_TOKEN || 'development_token'}`,
    'Content-Type': 'application/json'
  },
  
  // Strapi API paths
  endpoints: {
    auth: {
      login: '/api/auth/local',
      register: '/api/auth/local/register',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
      refreshToken: '/api/auth/token-refresh',
      me: '/api/users/me'
    },
    users: '/api/users',
    roles: '/api/users-permissions/roles'
  }
};

/**
 * Authentication-related server configuration
 */
export const authServerConfig = {
  // Secret for JWT signing (must match Strapi JWT secret if using Strapi for auth)
  jwtSecret: env.JWT_SECRET || 'development_jwt_secret',
  
  // JWT token configuration
  jwt: {
    // Token expiration time
    expiresIn: '7d',
    // Cookie options
    cookieOptions: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
    }
  },
  
  // CORS settings for authentication endpoints
  cors: {
    origin: publicEnv.PUBLIC_FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  },
  
  // Rate limiting to prevent brute force attacks
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};

/**
 * Session configuration
 */
export const sessionConfig = {
  // Cookie name
  cookieName: 'auth_session',
  
  // Cookie options
  cookieOptions: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
  }
};

/**
 * Security headers configuration
 */
export const securityConfig = {
  headers: {
    'Content-Security-Policy': 
      env.NODE_ENV === 'production'
        ? "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'"
        : "", // Empty in development to avoid issues with HMR
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
};