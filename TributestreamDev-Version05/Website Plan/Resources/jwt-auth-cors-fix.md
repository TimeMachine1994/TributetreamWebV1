# JWT Authentication CORS Fix

## Overview

This document explains the changes made to fix CORS issues when authenticating with the WordPress JWT Authentication plugin.

## Problem

When making direct API calls from the frontend to the WordPress JWT authentication endpoint, browsers enforce the Same-Origin Policy, which prevents cross-origin requests unless the server explicitly allows them through CORS headers. The WordPress site may not have proper CORS headers configured, leading to authentication failures in the browser.

## Solution

We've implemented a proxy approach using SvelteKit server endpoints to handle all authentication requests. Instead of the frontend making direct calls to the WordPress API, it now communicates with SvelteKit server endpoints, which then forward the requests to the WordPress API. Since server-to-server requests are not subject to CORS restrictions, this approach effectively bypasses the CORS issue.

## Implementation Details

### Server Endpoints

We've created the following SvelteKit server endpoints to handle authentication requests:

1. **Login**: `/api/auth`
   - Handles user login requests
   - Sets the JWT token as an HttpOnly cookie
   - Returns user data

2. **Token Validation**: `/api/auth/validate`
   - Validates the JWT token
   - Returns success/failure status

3. **Logout**: `/api/auth/logout`
   - Clears the JWT token cookie

4. **Registration**: `/api/auth/register`
   - Handles user registration requests
   - Forwards to WordPress API

5. **Password Reset Request**: `/api/auth/password-reset`
   - Handles password reset requests
   - Forwards to WordPress API

6. **Password Reset Confirmation**: `/api/auth/password-reset/confirm`
   - Handles password reset confirmations
   - Forwards to WordPress API

### Client-Side Changes

The `AuthService` class has been updated to use these server endpoints instead of making direct calls to the WordPress API:

```typescript
// Before
const response = await this.apiClient.post<JWTAuthResponse>('token', credentials);

// After
const response = await fetch('/api/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(credentials),
  credentials: 'include' // Include cookies for authentication
});
```

### Security Considerations

1. **HttpOnly Cookies**: The JWT token is now stored in an HttpOnly cookie, which cannot be accessed by JavaScript, providing better protection against XSS attacks.

2. **SameSite Policy**: The cookie is set with `SameSite: 'strict'` to prevent CSRF attacks.

3. **Secure Flag**: In production, the cookie is set with the `Secure` flag, ensuring it's only sent over HTTPS.

## Usage

No changes are required in how you use the `AuthService` class. All the changes are internal to the implementation, so existing code that uses the service should continue to work without modification.

## Future Improvements

1. **Refresh Tokens**: Implement token refresh functionality to extend sessions without requiring users to log in again.

2. **Role-Based Access Control**: Enhance the authentication system to support role-based access control based on WordPress user roles.

3. **Two-Factor Authentication**: Add support for two-factor authentication if needed.