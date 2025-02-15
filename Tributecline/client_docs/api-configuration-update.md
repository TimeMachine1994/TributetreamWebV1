# WordPress Local Development API Configuration
Last Updated: 2/14/2025

## Overview
This document outlines the current configuration for connecting our SvelteKit application with a locally running WordPress installation. The setup has been verified and is working successfully with JWT authentication.

## Current Architecture
- Client-side configuration (`wordpress.client.ts`):
  - Uses public WordPress URL from environment variables
  - Handles JWT authentication endpoints
  - Manages API endpoint definitions
- Server-side configuration (`wordpress.server.ts`):
  - Uses private WordPress URL for server-side requests
  - Shares endpoint definitions with client
  - Includes error handling utilities

## Current Configuration

### 1. Environment Variables
Current working configuration in `.env`:
```env
# Development Environment
WORDPRESS_URL="http://localhost:80"
VITE_WORDPRESS_URL="http://localhost:80"
VITE_WP_API_NAMESPACE="tributestream/v1"

# Environment
NODE_ENV="development"
```

### 2. CORS Configuration
WordPress is configured to allow requests from SvelteKit development server:
- http://localhost:5173 (dev server)
- http://localhost:4173 (preview)

### 3. WordPress JWT Authentication
✅ JWT Authentication plugin is installed and activated
✅ JWT endpoints verified and working:
   - `/jwt-auth/v1/token` (POST)
   - `/jwt-auth/v1/token/validate` (POST)

## Development Workflow

1. **Local Environment Setup**
   - WordPress running on localhost:80
   - Required plugins active:
     - JWT Authentication for WP-REST-API
     - Custom Tributestream plugin

2. **Development Process**
   - Start WordPress locally: `localhost:80`
   - Start SvelteKit dev server: `localhost:5173`
   - API communication verified between services

## Security Implementation

1. **JWT Authentication**
   - Secure token storage in localStorage
   - Token validation on protected routes
   - Proper error handling for auth failures

2. **CORS Security**
   - Restricted origin access
   - Proper header configuration
   - Secure credential handling

3. **Environment Variables**
   - Separate development/production configs
   - Secure storage of sensitive data
   - No exposure of server-side variables to client

## API Response Format

Successful authentication response format:
```json
{
  "success": true,
  "statusCode": 200,
  "code": "jwt_auth_valid_credential",
  "message": "Credential is valid",
  "data": {
    "token": "JWT_TOKEN_HERE",
    "id": 1,
    "email": "user@example.com",
    "nicename": "username",
    "firstName": "First",
    "lastName": "Last",
    "displayName": "Display Name"
  }
}
```

## Next Steps

1. Enhance Session Management
   - Implement secure session storage
   - Add session persistence
   - Create session cleanup routines

2. Implement User Meta Handling
   - Add user meta endpoints
   - Implement meta data storage
   - Add meta validation

3. API Documentation
   - Document all available endpoints
   - Add request/response examples
   - Include error handling guidelines

## References

- [WordPress REST API Documentation](https://developer.wordpress.org/rest-api/)
- [JWT Authentication Plugin Documentation](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
- [SvelteKit Environment Variables](https://kit.svelte.dev/docs/modules#$env-static-public)