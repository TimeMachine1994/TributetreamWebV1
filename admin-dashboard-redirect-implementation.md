# Administrator Dashboard Redirect Implementation

## Overview

This document outlines the changes needed to redirect administrators to the `/my-portal/dashboard` page after successful login, while keeping regular users on the `/my-portal` page.

## Current Behavior

Currently, when a user logs in through the `/my-portal` page:

1. The login form submits to the `login` action in `+page.server.ts`
2. The action validates credentials and sends a request to `/api/auth`
3. If successful, it sets authentication cookies using `setAuthCookies`
4. The user stays on the `/my-portal` page with a success message
5. The page refreshes and shows the authenticated view with tributes

## Required Changes

To implement the administrator redirect, we need to modify the login action in `my-portal/+page.server.ts` to:

1. Check if the authenticated user has administrator privileges after setting cookies
2. Use SvelteKit's `redirect` function to send administrators to the dashboard
3. Keep the current behavior for regular users

## Implementation Details

### File to Modify

`TributestreamDev-Version03/src/routes/my-portal/+page.server.ts`

### Code Changes

```typescript
login: async ({ request, cookies, fetch }) => {
  // Validate the form data
  const loginForm = await superValidate(request, zod(loginSchema));
  
  // Check if form is valid
  if (!loginForm.valid) {
    return fail(400, { loginForm });
  }
  
  try {
    // Send authentication request to API
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: loginForm.data.username,
        password: loginForm.data.password
      })
    });
    
    const data = await response.json();
    
    // Handle authentication failure
    if (!response.ok) {
      return message(loginForm, data.message || 'Authentication failed', {
        status: 'error'
      });
    }
    
    // Set authentication cookies
    setAuthCookies(cookies, data);
    
    // Check if user is an administrator
    const user = getUserFromCookies(cookies);
    
    // Check for admin role or capabilities
    if (user && (
      (user.roles && user.roles.includes('administrator')) || 
      (user.capabilities && user.capabilities.manage_options)
    )) {
      // Redirect administrators to the dashboard
      throw redirect(302, '/my-portal/dashboard');
    }
    
    // Return success message for regular users
    return message(loginForm, 'Login successful', {
      status: 'success'
    });
  } catch (error) {
    if (error instanceof Response) {
      // This is a redirect response, just pass it through
      throw error;
    }
    
    console.error('Login error:', error);
    return message(loginForm, 'An unexpected error occurred', {
      status: 'error'
    });
  }
}
```

## Technical Details

### Administrator Detection

The code identifies administrators by checking:

1. If the user has an `administrator` role in their `roles` array, OR
2. If the user has the `manage_options` capability in their `capabilities` object

This approach is compatible with WordPress's role-based permission system, where `manage_options` is a common capability assigned to administrators.

### Redirect Mechanism

The implementation uses SvelteKit's `redirect` function, which throws a special Response object that SvelteKit handles to perform the redirect. The error handling has been enhanced to distinguish between intentional redirects and actual errors.

### User Experience

- **Administrators**: Will be automatically redirected to `/my-portal/dashboard` after successful login
- **Regular Users**: Will continue to see the success message and remain on the `/my-portal` page

## Dashboard Layout Considerations

The dashboard layout (`/my-portal/dashboard/+layout.svelte`) already has authentication checking logic that redirects unauthenticated users to the login page. This ensures that only authenticated users can access the dashboard.

## Testing Recommendations

After implementing these changes, test the following scenarios:

1. Login as an administrator user (should redirect to dashboard)
2. Login as a regular user (should stay on my-portal page)
3. Access dashboard directly without authentication (should redirect to login)
4. Logout from dashboard (should redirect to my-portal login page)