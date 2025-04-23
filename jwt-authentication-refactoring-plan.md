# JWT Authentication Refactoring Plan

This document outlines a comprehensive plan for refactoring the authentication flow to properly handle JWT tokens in our SvelteKit application that communicates with a Strapi CMS backend.

## 1. Create Centralized Authentication Utilities

**Goal**: Create a utility module to centralize all authentication-related functions.

### Tasks:

- [ ] **1.1** Create folder structure: `src/lib/auth/`
- [ ] **1.2** Create `src/lib/auth/types.ts` with the following interfaces:
  ```typescript
  // Define types for JWT payload and user data
  export interface JwtPayload {
    id: number;
    email: string;
    name?: string;
    iat: number;
    exp: number;
  }

  export interface UserData {
    id: number;
    email: string;
    name?: string;
    authenticated: boolean;
  }
  ```
- [ ] **1.3** Create `src/lib/auth/utils.ts` with core authentication utilities:
  ```typescript
  import type { Cookies } from '@sveltejs/kit';
  import { JwtPayload, UserData } from './types';

  /**
   * Extract user information from JWT token
   */
  export async function getUserFromToken(token: string | undefined): Promise<UserData | null> {
    if (!token) return null;
    
    try {
      // TODO: Use a proper JWT library for verification instead of just decoding
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(atob(base64Payload)) as JwtPayload;
      
      // Check if token is expired
      if (payload.exp * 1000 < Date.now()) {
        return null;
      }
      
      return {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        authenticated: true
      };
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  }

  /**
   * Store JWT token in cookie
   */
  export function setAuthCookie(cookies: Cookies, token: string): void {
    cookies.set('jwt', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
  }

  /**
   * Clear JWT token from cookie
   */
  export function clearAuthCookie(cookies: Cookies): void {
    cookies.set('jwt', '', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 0
    });
  }
  ```

## 2. Update Server Hooks

**Goal**: Enhance the SvelteKit hooks to properly handle JWT tokens and protect routes.

### Tasks:

- [ ] **2.1** Update `src/hooks.server.ts` to properly handle JWT tokens:
  ```typescript
  import type { Handle } from '@sveltejs/kit';
  import { getUserFromToken } from '$lib/auth/utils';

  export const handle: Handle = async ({ event, resolve }) => {
    // Get JWT token from cookie
    const jwt = event.cookies.get('jwt');
    
    // Extract user information from token
    event.locals.user = await getUserFromToken(jwt) || { authenticated: false };

    // Add JWT token to Strapi API requests
    if (event.url.pathname.startsWith('/api/')) {
      event.locals.jwt = jwt;
    }
    
    // Handle protected routes
    if (event.url.pathname.startsWith('/protected') && !event.locals.user.authenticated) {
      return new Response('Redirect', {
        status: 303,
        headers: { Location: '/login' }
      });
    }

    // Resolve the request and return the response
    const response = await resolve(event);
    return response;
  };
  ```

- [ ] **2.2** Update `src/app.d.ts` to include type definitions for locals:
  ```typescript
  import type { UserData } from '$lib/auth/types';

  // See https://kit.svelte.dev/docs/types#app
  declare global {
    namespace App {
      interface Locals {
        user: UserData;
        jwt?: string;
      }
      // interface PageData {}
      // interface Error {}
      // interface Platform {}
    }
  }

  export {};
  ```

## 3. Create API Request Utilities

**Goal**: Create utilities for making authenticated requests to Strapi.

### Tasks:

- [ ] **3.1** Create folder structure: `src/lib/api/`
- [ ] **3.2** Create `src/lib/api/client.ts` with authentication helpers:
  ```typescript
  /**
   * Create fetch options with JWT authentication
   */
  export function createAuthFetchOptions(jwt: string | undefined, options: RequestInit = {}): RequestInit {
    if (!jwt) return options;

    return {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${jwt}`
      }
    };
  }

  /**
   * Fetch wrapper with JWT authentication
   */
  export async function apiFetch(url: string, jwt: string | undefined, options: RequestInit = {}) {
    const fetchOptions = createAuthFetchOptions(jwt, options);
    return fetch(url, fetchOptions);
  }

  /**
   * Get the full Strapi API URL
   */
  export function getStrapiUrl(path: string): string {
    const baseUrl = 'http://localhost:1338'; // TODO: Move to environment variables
    return `${baseUrl}${path}`;
  }
  ```

## 4. Update API Endpoints

**Goal**: Update all API endpoints to use the JWT token from event.locals.

### Tasks:

- [ ] **4.1** Update the login API endpoint at `src/routes/api/login/+server.ts`:
  ```typescript
  import { json } from '@sveltejs/kit';
  import type { RequestHandler } from './$types';
  import { setAuthCookie } from '$lib/auth/utils';

  export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
      const { email, password } = await request.json();

      // Make request to Strapi auth endpoint
      const response = await fetch('http://localhost:1338/api/auth/local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: email,
          password: password
        })
      });

      const data = await response.json();

      // If authentication was successful
      if (response.ok && data.jwt) {
        // Store JWT token in an HTTP-only cookie
        setAuthCookie(cookies, data.jwt);

        return json({
          success: true,
          user: data.user
        });
      }

      // If authentication failed
      return new Response(
        JSON.stringify({
          success: false,
          message: data.error?.message || 'Invalid credentials'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Login error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'An error occurred during login'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  };
  ```

- [ ] **4.2** Create a template for authenticated API endpoints:
  ```typescript
  // Example for a protected API endpoint
  import { json } from '@sveltejs/kit';
  import type { RequestHandler } from './$types';
  import { apiFetch, getStrapiUrl } from '$lib/api/client';

  export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user.authenticated) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const response = await apiFetch(
        getStrapiUrl('/api/some-protected-resource'), 
        locals.jwt, 
        { method: 'GET' }
      );

      if (response.ok) {
        const data = await response.json();
        return json(data);
      } else {
        return json(
          { error: 'Failed to fetch data' }, 
          { status: response.status }
        );
      }
    } catch (error) {
      console.error('API error:', error);
      return json(
        { error: 'An unexpected error occurred' }, 
        { status: 500 }
      );
    }
  };
  ```

- [ ] **4.3** Update all existing API endpoints to use the authenticated request pattern

## 5. Implement Logout Functionality

**Goal**: Create an endpoint to handle user logout by clearing the JWT cookie.

### Tasks:

- [ ] **5.1** Create logout endpoint at `src/routes/api/logout/+server.ts`:
  ```typescript
  import { json } from '@sveltejs/kit';
  import type { RequestHandler } from './$types';
  import { clearAuthCookie } from '$lib/auth/utils';

  export const POST: RequestHandler = async ({ cookies }) => {
    clearAuthCookie(cookies);
    return json({ success: true });
  };
  ```

## 6. Create Client-Side Authentication Store

**Goal**: Create a reactive store to manage authentication state on the client.

### Tasks:

- [ ] **6.1** Create folder structure: `src/lib/stores/`
- [ ] **6.2** Create `src/lib/stores/auth.store.svelte.ts` with authentication state:
  ```typescript
  import { goto } from '$app/navigation';
  import type { UserData } from '$lib/auth/types';

  // Initialize with default unauthenticated state
  let initialUser: UserData = {
    id: 0,
    email: '',
    authenticated: false
  };

  // Try to get user data from window.__user if SSR provided it
  if (typeof window !== 'undefined' && (window as any).__user) {
    initialUser = (window as any).__user;
  }

  // Create reactive state for user
  export let user = $state<UserData>(initialUser);

  // Update user data
  export function setUser(userData: UserData): void {
    user = userData;
  }

  // Check if user is authenticated
  export function isAuthenticated(): boolean {
    return user.authenticated;
  }

  // Handle logout
  export async function logout(): Promise<void> {
    try {
      await fetch('/api/logout', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      user = { id: 0, email: '', authenticated: false };
      goto('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
  ```

## 7. Create Authentication Guards

**Goal**: Create components and utilities to protect client-side routes.

### Tasks:

- [ ] **7.1** Create `src/lib/components/AuthGuard.svelte`:
  ```svelte
  <script>
    import { isAuthenticated } from '$lib/stores/auth.store.svelte';
    import { goto } from '$app/navigation';
    
    export let redirectTo = '/login';
    
    // Redirect to login if not authenticated
    $effect(() => {
      if (!isAuthenticated()) {
        goto(redirectTo);
      }
    });
  </script>

  {#if isAuthenticated()}
    <slot />
  {/if}
  ```

- [ ] **7.2** Create a sample protected page:
  ```svelte
  <!-- src/routes/protected/profile/+page.svelte -->
  <script>
    import AuthGuard from '$lib/components/AuthGuard.svelte';
    import { user } from '$lib/stores/auth.store.svelte';
  </script>

  <AuthGuard>
    <h1>User Profile</h1>
    <p>Welcome, {user.email}!</p>
    <!-- Protected content here -->
  </AuthGuard>
  ```

## 8. Set Up User Data Hydration

**Goal**: Ensure authentication state is properly transferred from server to client.

### Tasks:

- [ ] **8.1** Update `src/app.html` to inject user data:
  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      %sveltekit.head%
    </head>
    <body data-sveltekit-preload-data="hover">
      <div>%sveltekit.body%</div>
      <script>
        // This will be populated by the server
        window.__user = %sveltekit.user%;
      </script>
    </body>
  </html>
  ```

- [ ] **8.2** Create `src/routes/+layout.server.ts` to provide user data:
  ```typescript
  import type { LayoutServerLoad } from './$types';

  export const load: LayoutServerLoad = ({ locals }) => {
    return {
      user: locals.user
    };
  };
  ```

- [ ] **8.3** Create `src/routes/+layout.svelte` to hydrate auth store:
  ```svelte
  <script>
    import { setUser } from '$lib/stores/auth.store.svelte';
    import { page } from '$app/stores';
    
    // Hydrate the auth store with user data from the server
    $effect(() => {
      if ($page.data.user) {
        setUser($page.data.user);
      }
    });
  </script>

  <slot />
  ```

## Implementation Flow

To implement this plan efficiently, follow these steps in order:

1. Start with implementing the server-side authentication (steps 1-5):
   - Create authentication utilities
   - Update server hooks
   - Create API request utilities
   - Update API endpoints
   - Implement logout functionality

2. Then move to client-side authentication (steps 6-8):
   - Create authentication store
   - Add authentication guards
   - Set up user data hydration

## Testing Checklist

After implementation, test the following scenarios:

- [ ] Login with valid credentials works correctly
- [ ] Login with invalid credentials shows appropriate error message
- [ ] Protected server routes redirect to login page when unauthenticated
- [ ] Protected client routes redirect to login page when unauthenticated
- [ ] JWT token is included in requests to Strapi API
- [ ] User information is correctly extracted from JWT token
- [ ] Logout functionality clears the JWT cookie and redirects to login page
- [ ] Authentication state persists across page reloads