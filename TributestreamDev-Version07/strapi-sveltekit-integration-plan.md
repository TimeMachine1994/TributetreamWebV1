# SvelteKit 5 + Strapi Integration: Implementation Plan

This document outlines a step-by-step plan for integrating a SvelteKit 5 application with Strapi CMS, focusing on authentication with role-based access control as the MVP priority.

## Phase 1: Setup & Configuration

### Step 1: Configure Environment Variables
- Create server-side configuration to access Strapi API keys securely
- Set up client-side configuration with public URLs

```typescript
// src/lib/server/config.ts
import { STRAPI_PRIVATE_API, STRAPI_PUBLIC_API } from '$env/static/private';
import { STRAPI_URL } from '$lib/config';

export const apiConfig = {
  url: STRAPI_URL,
  publicKey: STRAPI_PUBLIC_API,
  privateKey: STRAPI_PRIVATE_API
};
```

### Step 2: Create Type Definitions
- Define user and authentication interfaces for type safety
- Create role and permission types

```typescript
// src/lib/types/auth.ts
export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  role: StrapiRole;
  created_at: string;
  updated_at: string;
}

export interface StrapiRole {
  id: number;
  name: string;
  description: string;
  type: string;
}

export interface LoginPayload {
  identifier: string; // Email or username
  password: string;
}

export interface AuthResponse {
  jwt: string;
  user: StrapiUser;
}
```

### Step 3: Set up Base API Client
- Create a reusable API client for Strapi communication
- Implement request/response handling with error management

```typescript
// src/lib/api/strapi.ts
import { STRAPI_URL } from '$lib/config';

// Runes-based cache store
export let apiCache = $state(new Map());

export async function fetchStrapi(
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> {
  const url = `${STRAPI_URL}/api/${endpoint}`;
  
  const mergedOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };
  
  // Cache key based on URL and options
  const cacheKey = url + JSON.stringify(mergedOptions);
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }
  
  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Strapi API error:', error);
    throw error;
  }
}

// Function to clear cache
export function invalidateCache() {
  apiCache.clear();
}
```

## Phase 2: Authentication Backend

### Step 1: Implement Authentication Service
- Create methods for login, logout, and user verification
- Handle JWT token management

```typescript
// src/lib/api/auth.ts
import { apiConfig } from '$lib/server/config';
import type { AuthResponse, LoginPayload, StrapiUser } from '$lib/types/auth';

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${apiConfig.url}/api/auth/local`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message || 'Authentication failed');
  }

  return response.json();
}

export async function getCurrentUser(jwt: string): Promise<StrapiUser> {
  const response = await fetch(`${apiConfig.url}/api/users/me?populate=role`, {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  return response.json();
}
```

### Step 2: Implement Server Hooks
- Create SvelteKit server hooks to process authentication on each request
- Extract and validate JWT tokens
- Set user data in event.locals

```typescript
// src/hooks.server.ts
import { getCurrentUser } from '$lib/api/auth';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // Get JWT from cookies
  const token = event.cookies.get('auth_token');
  
  if (token) {
    try {
      // Verify and get user with their role
      const user = await getCurrentUser(token);
      
      // Store in event.locals for use in load functions
      event.locals.user = user;
      event.locals.token = token;
    } catch (err) {
      // Invalid or expired token
      event.cookies.delete('auth_token', { path: '/' });
    }
  }
  
  return resolve(event);
}
```

### Step 3: Create Authentication Store
- Implement a reactive store using Svelte 5 runes
- Manage authentication state client-side
- Provide helper methods for role/permission checking

```typescript
// src/lib/stores/auth.svelte.ts
import { browser } from '$app/environment';
import type { StrapiUser } from '$lib/types/auth';

// Reactive state for authentication
export let user = $state<StrapiUser | null>(null);
export let token = $state<string | null>(null);
export let loading = $state(false);
export let error = $state<string | null>(null);

// Derived states
export let isAuthenticated = $derived(!!token && !!user);
export let isAdmin = $derived(user?.role?.type === 'admin');

// Check if user has a specific role
export function hasRole(roleName: string): boolean {
  return user?.role?.name === roleName;
}

// Check if user has a specific permission
export function hasPermission(permission: string): boolean {
  // This would need to be expanded based on how you structure permissions
  return isAdmin || (user?.role?.name === permission);
}

// Initialize from localStorage (client-side only)
export function initAuth() {
  if (browser) {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      token = savedToken;
    }
  }
}

// Handle login success
export function setAuthData(jwt: string, userData: StrapiUser) {
  token = jwt;
  user = userData;
  
  if (browser) {
    localStorage.setItem('auth_token', jwt);
  }
}

// Handle logout
export function clearAuth() {
  token = null;
  user = null;
  
  if (browser) {
    localStorage.removeItem('auth_token');
  }
}

// Initialize on script load
initAuth();
```

### Step 4: Add Protected Route Guards
- Create layout files to protect routes based on authentication status
- Implement role-based access control

```typescript
// src/routes/(protected)/+layout.server.ts
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals, url }) {
  // Check if user is authenticated
  if (!locals.user) {
    throw redirect(302, `/login?redirectTo=${url.pathname}`);
  }
  
  return {
    user: locals.user
  };
}
```

```typescript
// src/routes/(protected)/admin/+layout.server.ts
import { redirect, error } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
  // Check if user has admin role
  if (!locals.user) {
    throw redirect(302, '/login');
  }
  
  if (locals.user.role.type !== 'admin') {
    throw error(403, 'You do not have permission to access this area');
  }
  
  return {
    user: locals.user
  };
}
```

## Phase 3: Auth UI Components

### Step 1: Create Login Page
- Build login form with username/password inputs
- Implement form submission and error handling
- Add redirect logic for protected route access

```svelte
<!-- src/routes/login/+page.svelte -->
<script>
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  
  /** @type {import('./$types').PageProps} */
  let { data, form } = $props();
  
  // Local state 
  let loading = $state(false);
  
  // Get return URL from query parameter
  const returnUrl = data.redirectTo || '/';
</script>

<div class="login-container">
  <h1>Login</h1>
  
  {#if form?.error}
    <div class="error">
      {form.error}
    </div>
  {/if}
  
  <form method="POST" use:enhance={() => {
    loading = true;
    
    return ({ result }) => {
      loading = false;
      
      if (result.type === 'success') {
        goto(returnUrl);
      }
    };
  }}>
    <div class="form-group">
      <label for="identifier">Email or Username</label>
      <input 
        type="text" 
        id="identifier" 
        name="identifier" 
        required 
        autocomplete="username"
      />
    </div>
    
    <div class="form-group">
      <label for="password">Password</label>
      <input 
        type="password" 
        id="password" 
        name="password" 
        required
        autocomplete="current-password"
      />
    </div>
    
    <button type="submit" disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  </form>
</div>
```

### Step 2: Implement Login Action Handler
- Create server-side form action to process login attempts
- Validate credentials with Strapi
- Set authentication cookies on success

```typescript
// src/routes/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { loginUser } from '$lib/api/auth';

/** @type {import('./$types').PageServerLoad} */
export function load({ url, locals }) {
  // If already logged in, redirect
  if (locals.user) {
    throw redirect(302, '/');
  }
  
  return {
    redirectTo: url.searchParams.get('redirectTo') || '/'
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const identifier = formData.get('identifier');
    const password = formData.get('password');
    
    if (!identifier || !password) {
      return fail(400, { 
        error: 'Email/username and password are required' 
      });
    }
    
    try {
      // Attempt login with Strapi
      const { jwt, user } = await loginUser({ 
        identifier: identifier.toString(), 
        password: password.toString() 
      });
      
      // Set auth cookie
      cookies.set('auth_token', jwt, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return fail(401, { 
        error: 'Invalid credentials' 
      });
    }
  }
};
```

### Step 3: Create Logout Endpoint
- Implement logout functionality
- Clear authentication cookies
- Redirect to home page

```typescript
// src/routes/logout/+server.ts
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export function GET({ cookies }) {
  cookies.delete('auth_token', { path: '/' });
  throw redirect(302, '/');
}
```

### Step 4: Build User Profile Page
- Create a protected page to display user information
- Show role and permissions

```svelte
<!-- src/routes/(protected)/profile/+page.svelte -->
<script>
  /** @type {import('./$types').PageProps} */
  let { data } = $props();
  
  let user = $derived(data.user);
</script>

<div class="profile-container">
  <h1>User Profile</h1>
  
  <div class="user-info">
    <h2>{user.username}</h2>
    <p>Email: {user.email}</p>
    <p>Role: <strong>{user.role.name}</strong></p>
    
    <h3>Account Details</h3>
    <ul>
      <li>ID: {user.id}</li>
      <li>Created: {new Date(user.created_at).toLocaleDateString()}</li>
      <li>Last updated: {new Date(user.updated_at).toLocaleDateString()}</li>
    </ul>
    
    <div class="actions">
      <a href="/logout" class="logout-btn">Logout</a>
    </div>
  </div>
</div>
```

### Step 5: Implement Role-Based Navigation
- Create a navigation component with conditional visibility based on user roles
- Show/hide admin links based on permissions

```svelte
<!-- src/lib/components/Navigation.svelte -->
<script>
  import { page } from '$app/state';
  
  let user = $derived(page.data.user);
  let isAdmin = $derived(user?.role?.type === 'admin');
  let isAuthenticated = $derived(!!user);
  
  // Helper function to check user permissions
  function hasRole(roleName) {
    return user?.role?.name === roleName;
  }
</script>

<nav>
  <ul>
    <li><a href="/">Home</a></li>
    
    <!-- Public routes -->
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
    
    {#if isAuthenticated}
      <!-- User is logged in -->
      <li><a href="/profile">My Profile</a></li>
      
      {#if isAdmin}
        <!-- Admin-only links -->
        <li><a href="/admin/dashboard">Admin Dashboard</a></li>
        <li><a href="/admin/users">Manage Users</a></li>
        <li><a href="/admin/content">Manage Content</a></li>
      {/if}
      
      {#if hasRole('editor')}
        <!-- Editor-specific links -->
        <li><a href="/editor/content">Edit Content</a></li>
      {/if}
      
      <!-- Logout option -->
      <li><a href="/logout">Logout</a></li>
    {:else}
      <!-- Not logged in -->
      <li><a href="/login">Login</a></li>
      <li><a href="/register">Register</a></li>
    {/if}
  </ul>
</nav>
```

## Phase 4: Testing & Validation

### Step 1: Test Login Flow
- Test successful login with valid credentials
- Verify error handling with invalid credentials
- Check redirect to requested page after login

### Step 2: Test Role-Based Access
- Create test users with different roles (admin, editor, user)
- Verify that protected routes enforce correct permissions
- Ensure admin-only routes are not accessible to regular users

### Step 3: Validate Token Management
- Test token persistence across page refreshes
- Verify token expiration handling
- Check that logging out properly clears the token

## Phase 5: Content Integration (Post-MVP)

### Step 1: Content Type Setup
- Define content type interfaces based on Strapi models
- Create API methods for fetching content

### Step 2: Content Display Components
- Build reusable components for displaying Strapi content
- Implement image optimization for Strapi media

### Step 3: Content Management UI
- Create content editing forms with validation
- Implement save/publish/delete functionality

## Phase 6: Advanced Features (Future)

### Step 1: User Registration
- Build registration form with validation
- Implement email verification
- Add account activation workflow

### Step 2: Enhanced Permission System
- Implement granular permission checks
- Create UI for permission management
- Add content ownership validation

### Step 3: Media Management
- Build media library browser
- Implement file upload with progress indication
- Add image editing capabilities

## Required Dependencies

```bash
npm install qs marked
```

## Notes

- All authentication endpoints should use HTTPS in production
- Consider implementing refresh tokens for improved security
- Ensure proper CORS configuration on your Strapi instance
- Implement rate limiting for login attempts to prevent brute force attacks
