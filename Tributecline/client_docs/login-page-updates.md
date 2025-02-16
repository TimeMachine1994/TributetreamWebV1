# Login Page Updates Plan

## Current Issues
- Login page makes direct calls to WordPress endpoints
- Uses different cookie name than our API auth endpoint
- Role fetching needs to be updated to use our internal endpoint

## Planned Changes

### 1. Update Authentication Flow
Replace direct WordPress JWT authentication with our internal `/api/auth` endpoint:
```typescript
// Before
const authResponse = await fetch(`${PUBLIC_WORDPRESS_URL}/wp-json/jwt-auth/v1/token`...);

// After
const authResponse = await fetch('/api/auth', ...);
```

### 2. Cookie Handling
Update cookie name to match our API endpoint:
```typescript
// Before
cookies.set('jwt_token', token, ...);

// After
// Note: No need to set cookie as /api/auth handles this
```

### 3. Role Fetching
Update role fetching to use our internal `/api/getRole` endpoint:
```typescript
// Before
const roleResponse = await fetch(`${PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me`...);

// After
const roleResponse = await fetch(`/api/getRole?id=${userId}`...);
```

### 4. Response Structure
Maintain the same response structure for compatibility:
```typescript
return {
    success: true,
    username,
    user: {
        email: user_email,
        displayName: user_display_name,
        role
    }
} as ActionData;
```

## Implementation Steps
1. Update the authentication call to use `/api/auth`
2. Remove manual cookie setting since `/api/auth` handles it
3. Update role fetching to use `/api/getRole` with proper user ID
4. Ensure error handling remains consistent
5. Test the updated flow thoroughly

## Testing Considerations
- Verify successful login flow
- Test error cases (invalid credentials, network errors)
- Confirm proper role-based redirects
- Validate cookie setting and security
- Check response structure compatibility with frontend

## Security Notes
- Internal API endpoints provide better abstraction
- Cookie security maintained through API endpoint
- Role information properly scoped through internal endpoint