# Strapi API Proxy Example in SvelteKit

This document demonstrates how to implement an API proxy in SvelteKit for Strapi, allowing you to make authenticated requests from both the server and client sides.

## Why Use a Proxy?

1. **Security**: Keep your Strapi JWT token secure in HttpOnly cookies
2. **Simplicity**: Unified API endpoints for your frontend
3. **Flexibility**: Transform API responses before sending them to the client
4. **CORS**: Avoid cross-origin issues

## Basic Proxy Implementation

Here's a simple implementation of a proxy endpoint for Strapi:

```typescript
// src/routes/api/[...path]/+server.ts
import { STRAPI_URL } from '$lib/config';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, fetch, request, cookies }) => {
  const path = params.path;
  const jwt = cookies.get('jwt');
  
  // Construct the URL for the Strapi API
  const url = new URL(`${STRAPI_URL}/api/${path}`);
  
  // Copy the query parameters
  for (const [key, value] of new URL(request.url).searchParams.entries()) {
    url.searchParams.set(key, value);
  }
  
  try {
    const response = await fetch(url.toString(), {
      headers: jwt ? {
        'Authorization': `Bearer ${jwt}`
      } : {}
    });
    
    if (!response.ok) {
      return json({ error: 'API request failed' }, { status: response.status });
    }
    
    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Error proxying to Strapi:', error);
    return json({ error: 'Failed to fetch data from Strapi' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ params, request, cookies }) => {
  const path = params.path;
  const jwt = cookies.get('jwt');
  
  try {
    const body = await request.json();
    const response = await fetch(`${STRAPI_URL}/api/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jwt ? { 'Authorization': `Bearer ${jwt}` } : {})
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      return json({ error: 'API request failed' }, { status: response.status });
    }
    
    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Error proxying to Strapi:', error);
    return json({ error: 'Failed to post data to Strapi' }, { status: 500 });
  }
};

// Implement other methods (PUT, DELETE) as needed with similar pattern
```

## Using the Proxy

### In Server-Side Load Functions

```typescript
// src/routes/tributes/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  const response = await fetch('/api/tributes?populate=*');
  const tributes = await response.json();
  
  return {
    tributes: tributes.data || []
  };
};
```

### In Client-Side Components

```typescript
// src/lib/components/tribute-form.svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  
  let title = '';
  let description = '';
  
  async function handleSubmit() {
    const response = await fetch('/api/tributes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          title,
          description
        }
      })
    });
    
    if (response.ok) {
      // Handle success
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <!-- Form fields -->
</form>
```

## Advanced: Response Transformation

You can transform the Strapi response before sending it to the client:

```typescript
export const GET: RequestHandler = async ({ params, fetch, request, cookies }) => {
  // ... existing code to fetch from Strapi
  
  if (!response.ok) {
    return json({ error: 'API request failed' }, { status: response.status });
  }
  
  const data = await response.json();
  
  // Transform the response
  const transformed = {
    items: data.data.map(item => ({
      id: item.id,
      ...item.attributes,
      createdAt: new Date(item.attributes.createdAt).toLocaleDateString()
    })),
    meta: data.meta
  };
  
  return json(transformed);
};
```

## Error Handling

Proper error handling is essential for a robust API proxy:

```typescript
try {
  // API request code
} catch (error) {
  console.error('Error details:', error);
  
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return json({ error: 'Unable to connect to Strapi API' }, { status: 503 });
  } 
  
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return json({ error: 'Invalid response from API' }, { status: 502 });
  }
  
  return json({ error: 'An unexpected error occurred' }, { status: 500 });
}
```

## Handling Authentication

The proxy automatically adds the JWT token from cookies to each request, but you might want to handle authorization errors:

```typescript
const response = await fetch(url.toString(), {
  headers: jwt ? {
    'Authorization': `Bearer ${jwt}`
  } : {}
});

if (response.status === 401) {
  // Clear the invalid token
  cookies.delete('jwt', { path: '/' });
  return json({ error: 'Authentication required' }, { status: 401 });
}
```

This implementation provides a flexible, secure way to interact with your Strapi API while keeping the JWT token secure on the server side.