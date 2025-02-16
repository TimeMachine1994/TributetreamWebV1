Below is a more concise and polished set of instructions for the programmer to follow. All key requirements remain the same, just clarified and cleaned up for easier implementation.

---

# SvelteKit Data Fetching Implementation Plan
**Last Updated: 2/16/2025**

## Overview
We will use SvelteKit's built-in features to implement server-side rendering (SSR) and straightforward data fetching. This includes:
- Server-side data loading
- Proper caching and headers
- Error handling and graceful fallbacks
- Basic SEO optimizations (metadata, etc.)

## Core Principles

1. **Server-First Approach**  
   - Use `+page.server.ts` files for server-side data loading.  
   - Keep all sensitive logic server-side for better security.  
   - Utilize SvelteKit 5's form actions for data mutations (e.g., login flow).

2. **Caching Strategy**  
   - Set relevant cache headers (`Cache-Control`) on API routes.  
   - Leverage SvelteKit's built-in caching where applicable.

3. **Error Handling**  
   - Provide clear, consistent error messages to the user.  
   - Include fallback UI in case API calls fail.  
   - Maintain a uniform error display across the application.

---

## Implementation Structure

### 1. Server Routes (`+page.server.ts`)

```ts
// src/routes/[route]/+page.server.ts
export const load = async ({ fetch, params }) => {
    try {
        const response = await fetch('/api/endpoint');

        if (!response.ok) {
            return {
                error: 'Failed to load data'
            };
        }

        const data = await response.json();

        return {
            data,
            meta: {
                title: 'Page Title',
                description: 'Page Description'
            }
        };
    } catch (e) {
        return {
            error: 'Internal server error'
        };
    }
};
```

- **Purpose**: Fetch data on the server and pass it to client components.
- **Error Handling**: If any fetch fails, return an `error` key for the client to display an error message.
- **SEO**: Return `meta` data (e.g., `title`, `description`) that can be used for SSR SEO improvements.

### 2. API Routes (`+server.ts`)

```ts
// src/routes/api/[endpoint]/+server.ts
import { json } from '@sveltejs/kit';

export const GET = async ({ fetch, request }) => {
    try {
        const response = await fetch('https://wp.tributestream.com/wp-json/...'); // Replace with actual endpoint
        const data = await response.json();

        return json(data, {
            headers: {
                'Cache-Control': 'public, max-age=60'
            }
        });
    } catch (error) {
        return json({ error: 'Failed to fetch data' }, { status: 500 });
    }
};
```

- **Purpose**: Proxy requests to external services (e.g., WordPress) or handle custom backend logic.
- **Caching**: Example sets a `max-age=60` so data is cached for 60 seconds.

### 3. Client Components (`+page.svelte`)

```svelte
<script>
    export let data;
</script>

{#if data.error}
    <div class="error">{data.error}</div>
{:else if data.data}
    <!-- Render data here -->
{:else}
    <!-- Loading state -->
{/if}
```

- **Purpose**: Display the server-loaded data or show loading/error states.
- **Structure**:  
  - `data` is passed in from the server load function.  
  - Display an error if `data.error` is defined.  
  - Otherwise, render `data.data`.  
  - Show a loading state if the data is still undefined.

---

## Authentication Implementation

### 1. Login Flow

```ts
// src/routes/login/+page.server.ts
export const actions = {
    default: async ({ request, fetch, cookies }) => {
        const formData = await request.formData();
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            // 1) Attempt login via our custom /api route:
            const response = await fetch('/api/auth', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                return { success: false, message: 'Authentication failed' };
            }

            // 2) After a successful login, call /api/getrole to retrieve user role:
            const { token } = await response.json();
            const roleResponse = await fetch('/api/getrole', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const roleData = await roleResponse.json();

            // 3) Set secure HTTP-only cookie with the token
            cookies.set('auth_token', token, {
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'strict'
            });

            // 4) Redirect user to a success page (e.g., /succc.svelte)
            //    The success page should display the role info returned by getrole.
            return {
                success: true,
                redirect: '/succc',  // or whichever route you create for success
                role: roleData.role   // pass along role info if needed
            };
        } catch (error) {
            return { success: false, message: 'Server error' };
        }
    }
};
```

**Key Points**:
- **Fetch to `/api/auth`**: Attempts to authenticate the user with provided credentials.  
- **Get Role**: After successful login, call `/api/getrole` to retrieve user role info.  
- **Redirect**: Forward the user to a success page (e.g., `/succc.svelte`), which you need to create. Display the role data on that page.  
- **Set Cookie**: Store `auth_token` in a secure, HTTP-only cookie.

### 2. Protected Routes

```ts
// src/hooks.server.ts
export const handle = async ({ event, resolve }) => {
    const token = event.cookies.get('auth_token');

    if (token) {
        try {
            const response = await event.fetch('/api/validate-token', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const userData = await response.json();
                event.locals.user = userData;
            } else {
                event.cookies.delete('auth_token');
            }
        } catch (error) {
            event.cookies.delete('auth_token');
        }
    }

    return resolve(event);
};
```

- **Purpose**: Validates the `auth_token` on every request. If the token is invalid, remove it and treat the user as unauthenticated.
- **Usage**: You can then check `event.locals.user` in server routes or `+layout.server.ts` to conditionally allow or block access to certain pages.

---

## Implementation Steps

1. **Server-Side Implementation**  
   - Create API routes (`+server.ts`) for WordPress communication or any external data source.  
   - Set up error handling and responses (e.g., `500` on server errors).  
   - Configure caching headers (e.g., `Cache-Control: public, max-age=60`).

2. **Authentication Flow**  
   - Update the login process to use the SvelteKit server action (`+page.server.ts`).  
   - After successful authentication, call `/api/getrole` and store the user’s role.  
   - Redirect to a success page (e.g., `/succces.svelte`), displaying the user role.

3. **Client-Side Implementation**  
   - Update client components (`+page.svelte`) to use data loaded from `+page.server.ts`.  
   - Include loading states and error messaging.  
   - Ensure user experiences are consistent across the application.
 

---

## Next Steps

1. **Review & Approval**: Review this plan and confirm it meets requirements.  
2. **Authentication First**: Implement the login and role retrieval flow as a priority.  
3. **Feature Rollout**: Implement the remaining features in the order of priority.  
 5. **Documentation**: Keep internal documentation up to date for future reference.

---

**Questions or clarifications?** Let us know before proceeding with implementation.