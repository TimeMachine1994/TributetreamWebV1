/**
 * Client-side configuration file
 * Contains public configuration values accessible from client code
 */

/**
 * Public API configuration for Strapi
 */
export const publicStrapiConfig = {
  // Strapi API base URL (public)
  baseUrl: typeof process !== 'undefined' && process.env.PUBLIC_STRAPI_URL 
    ? process.env.PUBLIC_STRAPI_URL 
    : 'http://localhost:1337',
  
  // Public API endpoints that can be accessed directly from client code
  endpoints: {
    auth: {
      login: '/api/auth/local',
      register: '/api/auth/local/register',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
      me: '/api/users/me'
    },
    // Content type endpoints
    content: {
      tributes: '/api/tributes',
      memorials: '/api/memorials',
      categories: '/api/categories',
      tags: '/api/tags'
    }
  }
};

/**
 * Authentication-related client configuration
 */
export const authClientConfig = {
  // Local storage keys for auth data
  storageKeys: {
    token: 'tribuestream_auth_token',
    user: 'tribuestream_user'
  },
  
  // Cookie settings (only non-sensitive info)
  cookieOptions: {
    secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
    sameSite: 'strict' as const,
    path: '/'
  }
};

/**
 * Application UI configuration
 */
export const uiConfig = {
  // Theme settings
  theme: {
    defaultTheme: 'light',
    storageKey: 'tribuestream_theme'
  },
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50]
  },
  
  // Date formatting
  dateFormats: {
    short: 'MM/dd/yyyy',
    medium: 'MMM d, yyyy',
    long: 'MMMM d, yyyy'
  }
};

/**
 * Feature flags for controlling app functionality
 */
export const featureFlags = {
  enableComments: true,
  enableSocialSharing: true,
  enableNotifications: true,
  enableMediaUpload: true
};