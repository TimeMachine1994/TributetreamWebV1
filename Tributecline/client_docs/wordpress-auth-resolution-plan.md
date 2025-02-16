# WordPress Authentication Resolution Plan
Last Updated: 2/16/2025

## Problem Statement
The login flow fails when trying to fetch the current user's data because requests are being made directly to WordPress endpoints instead of going through our SvelteKit API routes. This causes CORS and authentication issues.

## Current Flow
1. User submits login form
2. Client calls `/wp-json/jwt-auth/v1/token` to get JWT token (works)
3. Client tries to fetch user data from `/wp-json/wp/v2/users/me` (fails)
   - CORS error because direct WordPress access is blocked
   - Authentication fails because token handling is bypassing our API layer

## Solution Steps

### 1. Update WordPress Client Configuration
File: `src/lib/config/wordpress.client.ts`
Changes needed:
- Update API endpoint configuration to use our SvelteKit routes
- Add new endpoint constants for user-related operations
```typescript
export const WP_ENDPOINTS = {
  AUTH: {
    TOKEN: '/wp-json/jwt-auth/v1/token',
    VALIDATE: '/wp-json/jwt-auth/v1/token/validate',
  },
  API: {
    USERS: '/api/users',           // Changed from /wp-json/wp/v2/users
    USERS_ME: '/api/users/me',     // New endpoint for current user
    USER_META: '/api/user-meta',   // Changed from /wp-json/wp/v2/user-meta
    GET_ROLE: '/api/getRole',      // Already correct
  }
};
```

### 2. Update API Client Functions
File: `src/lib/utils/api.client.ts`
Changes needed:
- Update getCurrentUser function to use new endpoint
```typescript
export async function getCurrentUser(token: string): Promise<WordPressUser> {
  return makeRequest<WordPressUser>(WP_ENDPOINTS.API.USERS_ME, {
    token
  });
}
```

### 3. Verify Server-Side Implementation
File: `src/routes/api/users/me/+server.ts`
Current implementation is correct:
- Properly forwards Authorization header
- Handles WordPress API communication
- Manages error responses
- No changes needed

### 4. Update Login Flow Error Handling
File: `src/routes/login/+page.svelte`
Changes needed:
- Add more specific error handling for authentication failures
```typescript
catch (e) {
  if (e instanceof ApiError) {
    switch (e.code) {
      case 'jwt_auth_error':
        error = 'Invalid username or password';
        break;
      case 'cors_error':
        error = 'Unable to connect to authentication service';
        break;
      default:
        error = e.message;
    }
  } else {
    error = 'An unexpected error occurred';
  }
  console.error('Login error:', e);
}
```

## Implementation Order
1. Update wordpress.client.ts first to establish new endpoint structure
2. Modify api.client.ts to use new endpoints
3. Update error handling in login page
4. Test full authentication flow:
   - Login attempt with valid credentials
   - Verify token acquisition
   - Verify user data retrieval
   - Verify role fetching
   - Test error scenarios (invalid credentials, network issues)

## Expected Outcome
- All WordPress API interactions will go through our SvelteKit API routes
- Proper CORS handling via our server
- Consistent error handling and user feedback
- Secure authentication flow with proper token management

## Validation Steps
1. Successful login with valid credentials
2. Proper error message for invalid credentials
3. Verify token storage in localStorage
4. Confirm user data retrieval
5. Verify correct role-based routing
6. Check network tab for proper request flow through our API routes

## Rollback Plan
If issues occur:
1. Revert wordpress.client.ts changes
2. Revert api.client.ts changes
3. Restore original error handling
4. Document any new issues discovered during implementation