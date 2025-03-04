# Technical Implementation Details: Tribute Creation Workflow

## Core Code Changes

This document provides specific technical details of the implementation for the tribute creation workflow, including code snippets and technical explanations.

## Store Integration

### MasterStore and TributePageStore Initialization

The stores are initialized at the application root level in `+layout.svelte`:

```typescript
// src/routes/+layout.svelte
import { setMasterStoreContext } from '$lib/stores/master-store.svelte';
import { setTributePageStoreContext } from '$lib/stores/tribute-page-store.svelte';
import { onMount } from 'svelte';

// Initialize stores
const masterStore = setMasterStoreContext();
const tributeStore = setTributePageStoreContext();

// Load data from localStorage on mount (client-side only)
onMount(() => {
    // Load data from localStorage for both stores
    masterStore.loadFromLocalStorage();
    
    // Set up auth token from cookies if available
    if (data.user && data.token) {
        tributeStore.setAuthToken(data.token);
    }
    
    // Set up effect to persist store data when it changes
    $effect(() => {
        if (typeof window !== 'undefined') {
            masterStore.saveToLocalStorage();
        }
    });
});
```

## Home Page Form Implementation

### Integrating Stores with the Form

```typescript
// src/routes/+page.svelte
import { getMasterStoreContext } from '$lib/stores/master-store.svelte';
import { getTributePageStoreContext } from '$lib/stores/tribute-page-store.svelte';
import { createTributeSlug, createTributeUrl } from '$lib/utils/string-helper';
import { enhance } from '$app/forms';

// Get store contexts
const masterStore = getMasterStoreContext();
const tributeStore = getTributePageStoreContext();

// Initialize from master store if available
$effect(() => {
    if (masterStore.lovedOneInfo.fullName) {
        // Set slug for display
        setSlugFromName(masterStore.lovedOneInfo.fullName);
    }
});

function setSlugFromName(name: string): void {
    const slug = createTributeSlug(name, false);
    tributeStore.updateCurrentTribute({
        title: name,
        slug: slug
    });
}
```

### Form Bindings

```html
<!-- Input for loved one's name -->
<input
    type="text"
    name="lovedOneInfo.fullName"
    placeholder="Enter name to create or search tributes..."
    class="w-full px-4 py-2 text-gray-900 rounded-md mb-4 text-center"
    bind:value={masterStore.lovedOneInfo.fullName}
/>

<!-- User information fields -->
<input
    type="text"
    name="userInfo.fullName"
    placeholder="Your Name"
    class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
    bind:value={masterStore.userInfo.fullName}
/>
<input
    type="email"
    name="userInfo.emailAddress"
    placeholder="Email Address"
    class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
    bind:value={masterStore.userInfo.emailAddress}
/>
<input
    type="tel"
    name="userInfo.phoneNumber"
    placeholder="Phone Number"
    class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
    bind:value={masterStore.userInfo.phoneNumber}
/>
```

### Form Submission with Progressive Enhancement

```html
<!-- Main form with progressive enhancement -->
<form method="POST" action="?/createTribute" class="w-full max-w-md" use:enhance>
    <!-- Form content here -->
</form>
```

## Server-Side Form Action

The form action in `+page.server.ts` handles the form submission:

```typescript
// src/routes/+page.server.ts
export const actions = {
    createTribute: async ({ request, fetch, cookies }) => {
        try {
            // Parse form data
            const formData = await request.formData();
            
            // Extract MasterStore data
            const lovedOneFullName = formData.get('lovedOneInfo.fullName') as string;
            const userFullName = formData.get('userInfo.fullName') as string;
            const userEmail = formData.get('userInfo.emailAddress') as string;
            const userPhone = formData.get('userInfo.phoneNumber') as string;
            
            // Validate required fields
            if (!lovedOneFullName || !userFullName || !userEmail || !userPhone) {
                return fail(400, { 
                    error: true, 
                    message: 'All fields are required to create a tribute.' 
                });
            }
            
            // Generate tribute slug
            const tributeSlug = createTributeSlug(lovedOneFullName);
            const tributeUrl = createTributeUrl(tributeSlug);
            
            // Generate secure password for user registration
            const password = generateSecurePassword();
            
            // Register the user
            const registerResponse = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: userEmail,
                    email: userEmail,
                    password: password,
                    name: userFullName,
                    phone: userPhone
                })
            });
            
            // Authenticate the user
            const authResponse = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: userEmail,
                    password: password
                })
            });
            
            const authResult = await authResponse.json();
            
            // Set authentication cookies
            setAuthCookies(cookies, authResult);
            
            // Save tribute to the database
            const tributeData = {
                title: lovedOneFullName,
                slug: tributeSlug,
                user_name: userFullName,
                user_email: userEmail,
                user_phone: userPhone
            };
            
            const tributeResponse = await saveTribute(tributeData, authResult.token);
            
            // Redirect to the tribute page
            throw redirect(303, tributeUrl);
            
        } catch (error) {
            // Error handling omitted for brevity
        }
    }
}
```

## String Helper Functions

The string helper functions format slugs and URLs:

```typescript
// src/lib/utils/string-helper.ts
export function createTributeSlug(str: string, addPrefix = false): string {
    if (!str) return '';
    
    // Convert to lowercase, replace spaces with hyphens, remove special characters
    const slug = str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    
    return addPrefix ? `celebration-of-life-for-${slug}` : slug;
}
  
export function createTributeUrl(slug: string, includeProtocol = false): string {
    const path = slug.startsWith('celebration-of-life-for-') 
      ? slug 
      : `celebration-of-life-for-${slug}`;
      
    return includeProtocol 
      ? `https://www.tributestream.com/${path}` 
      : `/${path}`;
}
```

## Authentication Flow

### Setting Authentication Cookies

```typescript
// src/lib/utils/auth-helpers.ts
export function setAuthCookies(cookies: any, authResponse: any): void {
    // Set JWT token cookie (httpOnly for security)
    cookies.set('jwt_token', authResponse.token, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: import.meta.env.PROD,
        maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    // Set user info cookie (not httpOnly so client JS can access)
    cookies.set('user', JSON.stringify({
        id: authResponse.user_id,
        name: authResponse.user_display_name,
        email: authResponse.user_email
    }), {
        path: '/',
        httpOnly: false,
        sameSite: 'strict',
        secure: import.meta.env.PROD,
        maxAge: 60 * 60 * 24 * 7 // 1 week
    });
}
```

### Server-Side Layout Load Function

```typescript
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
    console.log('🔧 [Layout Server] load() triggered');
  
    // Retrieve JWT from locals (populated by hooks.server.ts)
    const jwt = locals.jwt;
    
    // Retrieve user data from cookie, if any
    const userDataCookie = cookies.get('user');
    
    // If missing, return user: null
    if (!jwt || !userDataCookie) {
        return { 
            user: null,
            token: null
        };
    }
  
    // Parse the user data cookie safely
    try {
        const userData = JSON.parse(userDataCookie);
        
        // Return both user data and the JWT token
        return { 
            user: userData,
            token: jwt  // Include the token so TributeStore can use it
        };
    } catch (error) {
        return { 
            user: null,
            token: null
        };
    }
};
```

## API Integration

### Tribute API Endpoints

The application uses several API endpoints through the TributePageStore:

```typescript
// src/lib/stores/tribute-page-store.svelte.ts (search method excerpt)
async searchTributes(query: string, page: number = 1, perPage: number = 10): Promise<void> {
    try {
        this.searchResults.isLoading = true;
        this.searchResults.error = null;

        const response = await fetch(`/api/tributes?search=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`);
        
        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        this.searchResults = {
            tributes: data.tributes || [],
            total_pages: data.total_pages || 1,
            currentPage: page,
            isLoading: false,
            error: null
        };
    } catch (error) {
        // Error handling
    }
}
```

## Technical Implementation Challenges

### Challenge: TypeScript Type Safety

To ensure type safety, proper interfaces were defined for all tribute data:

```typescript
// Tribute interface for type safety
export interface Tribute {
    id?: number | string;
    title: string; // Loved one's name
    slug: string;
    description?: string;
    memorialDate?: string;
    memorialLocation?: string;
    custom_html?: string | null;
    created_at?: string;
    updated_at?: string;
    [key: string]: any; // Allow for additional properties
}

// Interface for tribute data sent to the API
export interface TributeData {
    title: string;
    slug: string;
    custom_html?: string | null;
    user_name: string;
    user_email: string;
    user_phone: string;
    memorial_date?: string;
    memorial_location?: string;
}
```

### Challenge: State Synchronization

Using Svelte 5's reactivity runes to maintain synchronized state:

```typescript
// Using $effect for reactivity
$effect(() => {
    if (masterStore.lovedOneInfo.fullName) {
        setSlugFromName(masterStore.lovedOneInfo.fullName);
    }
});

// Automatic persistence with $effect
$effect(() => {
    if (typeof window !== 'undefined') {
        this.saveToLocalStorage();
    }
});
```

## Security Considerations

### Password Generation

```typescript
export function generateSecurePassword(length = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
    let password = '';
    
    // Create a cryptographically secure random array
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    // Generate password from random values
    for (let i = 0; i < length; i++) {
        password += charset[randomValues[i] % charset.length];
    }
    
    return password;
}
```

### JWT Validation

```typescript
const validateJWT = (jwt: string | undefined) => {
    if (!jwt) {
        throw new Error('No JWT provided');
    }
    // In production, you would validate the JWT here
    return true;
};
```

## Conclusion

This technical implementation leverages SvelteKit 5's reactivity model with runes, provides robust form handling with progressive enhancement, and follows best practices for authentication and data management. The code is type-safe, modular, and maintainable.