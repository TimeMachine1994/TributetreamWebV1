# Role-Based Routing Implementation Plan
Last Updated: 2/14/2025

## Overview
We need to implement role-based routing to forward administrators to the admin dashboard after login. We'll leverage the existing getRole endpoint for this functionality.

## Implementation Steps

### 1. Update API Client (api.client.ts)
Add role-related types and functions:

```typescript
// Add to WP_ENDPOINTS
API: {
  // ... existing endpoints
  GET_ROLE: '/api/getRole'  // Our SvelteKit endpoint
}

// Add new type
export interface UserRole {
  role: string;
}

// Add new function
export async function getUserRole(userId: number): Promise<UserRole> {
  return makeRequest<UserRole>(`${WP_ENDPOINTS.API.GET_ROLE}?id=${userId}`);
}
```

### 2. Update Login Page (login/+page.svelte)
Modify the login success handler to check user role and redirect accordingly:

```typescript
async function handleLoginSuccess(response: AuthResponse) {
  // Store token
  localStorage.setItem('auth_token', response.token);
  
  try {
    // Get current user data
    const user = await getCurrentUser(response.token);
    
    // Get user role
    const roleData = await getUserRole(user.id);
    
    // Determine redirect based on role
    const returnUrl = $page.url.searchParams.get('returnUrl');
    if (roleData.role === 'administrator') {
      goto('/admin-dashboard');
    } else {
      goto(returnUrl || '/dashboard');
    }
  } catch (error) {
    console.error('Error checking user role:', error);
    // Fall back to default redirect
    goto(returnUrl || '/dashboard');
  }
}
```

## Testing Plan
1. Test login with administrator account
   - Should redirect to /admin-dashboard
2. Test login with non-administrator account
   - Should redirect to /dashboard or returnUrl if specified
3. Test error handling
   - Should fall back to default redirect if role check fails

## Success Criteria
- [x] CORS issues resolved
- [x] Authentication working
- [x] Administrators redirected to admin dashboard
- [x] Other users redirected to appropriate dashboard
- [x] Error cases handled gracefully

## Implementation Complete
The role-based routing has been implemented with the following changes:

1. Added GET_ROLE endpoint to WP_ENDPOINTS in wordpress.client.ts
2. Added UserRole interface and getUserRole function to api.client.ts
3. Updated login page (+page.svelte) to:
   - Check user role after successful login
   - Redirect administrators to /admin-dashboard
   - Redirect other users to /dashboard or returnUrl
   - Handle errors gracefully with fallback to default redirect

## Testing
To test the implementation:
1. Login with an administrator account - should redirect to /admin-dashboard
2. Login with a regular user account - should redirect to /dashboard
3. Login with either account type with a returnUrl - should respect returnUrl for non-admins
4. Test error handling by temporarily disabling the getRole endpoint

## Next Steps
1. Add end-to-end tests for the login flow
2. Consider adding role-based route protection for admin routes
3. Add loading state during role check