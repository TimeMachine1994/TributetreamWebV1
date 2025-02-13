# Environment Variables Setup Guide for Tributestream

## Overview
This guide details how to set up and use environment variables in the Tributestream SvelteKit 5 project, with specific focus on WordPress JWT authentication, API integration, and security configuration.

## Environment Files

Create the following files in your Tributestream directory:

### `.env`
```env
# WordPress API Configuration
PUBLIC_WORDPRESS_URL="https://wp.tributestream.com"
VITE_WP_API_BASE="https://wp.tributestream.com/wp-json"
VITE_WP_API_NAMESPACE="tributestream/v1"

# JWT Authentication
JWT_SECRET="your-secret-key"
PUBLIC_JWT_COOKIE_NAME="auth_token"
PUBLIC_JWT_COOKIE_MAX_AGE="604800" # 7 days in seconds
PUBLIC_JWT_VALIDATION_ENDPOINT="/wp-json/jwt-auth/v1/token/validate"
PUBLIC_JWT_TOKEN_ENDPOINT="/wp-json/jwt-auth/v1/token"

# Security Configuration
PUBLIC_COOKIE_SECURE="true"
PUBLIC_COOKIE_SAME_SITE="strict"
PUBLIC_COOKIE_HTTP_ONLY="true"
PUBLIC_COOKIE_PATH="/"

# API Configuration
VITE_API_VERSION="v1"
API_RATE_LIMIT="100"

# Database Configuration (Server-side only)
DB_HOST="your-db-host"
DB_USER="your-db-user"
DB_PASSWORD="your-db-password"
DB_NAME="your-db-name"
```

### `.env.example`
```env
# WordPress API Configuration
PUBLIC_WORDPRESS_URL="https://your-wordpress-site.com"
VITE_WP_API_BASE="https://your-wordpress-site.com/wp-json"
VITE_WP_API_NAMESPACE="tributestream/v1"

# JWT Authentication
JWT_SECRET="your-secret-key"
PUBLIC_JWT_COOKIE_NAME="auth_token"
PUBLIC_JWT_COOKIE_MAX_AGE="604800" # 7 days in seconds
PUBLIC_JWT_VALIDATION_ENDPOINT="/wp-json/jwt-auth/v1/token/validate"
PUBLIC_JWT_TOKEN_ENDPOINT="/wp-json/jwt-auth/v1/token"

# Security Configuration
PUBLIC_COOKIE_SECURE="true"
PUBLIC_COOKIE_SAME_SITE="strict"
PUBLIC_COOKIE_HTTP_ONLY="true"
PUBLIC_COOKIE_PATH="/"

# API Configuration
VITE_API_VERSION="v1"
API_RATE_LIMIT="100"

# Database Configuration (Server-side only)
DB_HOST="localhost"
DB_USER="db_user"
DB_PASSWORD="db_password"
DB_NAME="tributestream"
```

## Required Code Changes

### Update src/lib/utils/security.ts
```typescript
import { 
  PUBLIC_WORDPRESS_URL,
  PUBLIC_JWT_COOKIE_NAME,
  PUBLIC_JWT_COOKIE_MAX_AGE,
  PUBLIC_COOKIE_SECURE,
  PUBLIC_COOKIE_SAME_SITE,
  PUBLIC_COOKIE_HTTP_ONLY,
  PUBLIC_COOKIE_PATH,
  PUBLIC_JWT_VALIDATION_ENDPOINT
} from '$env/static/public';

export async function validateToken(token: string, event?: RequestEvent): Promise<boolean> {
  if (!token) return false;
  
  try {
    const fetchFn = event?.fetch || fetch;
    
    const response = await fetchFn(`${PUBLIC_WORDPRESS_URL}${PUBLIC_JWT_VALIDATION_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Token validation failed with status:', response.status);
      return false;
    }

    const data = await response.json();
    return data.code === 'jwt_auth_valid_token' && data.data.status === 200;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

export function setAuthCookie(token: string, cookies: any) {
  cookies.set(PUBLIC_JWT_COOKIE_NAME, token, {
    path: PUBLIC_COOKIE_PATH,
    httpOnly: PUBLIC_COOKIE_HTTP_ONLY === 'true',
    secure: PUBLIC_COOKIE_SECURE === 'true',
    sameSite: PUBLIC_COOKIE_SAME_SITE,
    maxAge: parseInt(PUBLIC_JWT_COOKIE_MAX_AGE)
  });
}
```

### Update src/lib/utils/api.ts
```typescript
import { PUBLIC_WORDPRESS_URL } from '$env/static/public';

export const WP_API_BASE = `${PUBLIC_WORDPRESS_URL}/wp-json`;
export const WP_API_NAMESPACE = import.meta.env.VITE_WP_API_NAMESPACE;
export const WP_API_URL = `${WP_API_BASE}/${WP_API_NAMESPACE}`;
```

## Security Best Practices

1. **Cookie Configuration**
   - Use httpOnly cookies for JWT tokens
   - Enable secure flag in production
   - Set appropriate sameSite policy
   - Use path restriction
   - Set reasonable expiration times

2. **Environment Variables**
   - Use PUBLIC_ prefix only for non-sensitive data
   - Keep JWT secrets server-side only
   - Use different values in development and production
   - Regularly rotate sensitive credentials

3. **JWT Token Handling**
   - Validate tokens on every protected request
   - Implement proper error handling
   - Use secure token storage (httpOnly cookies)
   - Set appropriate token expiration

## Type Safety

Add these types to `src/app.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WP_API_NAMESPACE: string
  readonly VITE_API_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Implementation Steps

1. Create both `.env` and `.env.example` files
2. Add `.env` to `.gitignore`
3. Update security utilities to use environment variables
4. Update API utilities to use environment variables
5. Configure cookie settings through environment variables
6. Test token validation and cookie handling
7. Verify security configurations in production environment

## Verification Steps

1. **Token Validation**
```typescript
const isValid = await validateToken(token);
console.log('Token validation result:', isValid);
```

2. **Cookie Settings**
```typescript
// Check cookie configuration
console.log('Cookie settings:', {
  name: PUBLIC_JWT_COOKIE_NAME,
  secure: PUBLIC_COOKIE_SECURE,
  sameSite: PUBLIC_COOKIE_SAME_SITE
});
```

## Troubleshooting

1. **Token Validation Issues**
   - Verify WordPress URL and endpoints
   - Check JWT plugin configuration
   - Verify token format and expiration
   - Check network requests for errors

2. **Cookie Problems**
   - Verify secure flag matches protocol
   - Check sameSite setting compatibility
   - Verify cookie name consistency
   - Check maxAge value format

3. **Environment Variable Issues**
   - Verify proper import paths
   - Check variable prefix usage
   - Restart development server
   - Verify production environment configuration

## Production Deployment

1. Set up secure environment variable management
2. Use production-grade secrets management
3. Enable all security features (secure cookies, etc.)
4. Implement proper SSL/TLS configuration
5. Set up monitoring for authentication failures
6. Configure proper CORS settings

## Next Steps

1. Update all security-related files
2. Implement consistent cookie handling
3. Test authentication flow end-to-end
4. Configure production environment
5. Document security procedures
6. Set up monitoring and logging
7. Plan credential rotation schedule