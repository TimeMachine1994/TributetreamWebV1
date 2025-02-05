Below is an **example** of how you might create **SvelteKit +server.js** endpoints that **mirror** the REST API routes from your WordPress plugin. Each **+server.js** file in SvelteKit will **call** the corresponding WordPress REST endpoint. The final result is a set of **SvelteKit** endpoints that act as **proxies** (or wrappers) to the WordPress REST API. 

> #### Why Proxy Through SvelteKit?
> - **Security**: You can add additional authentication or header logic if needed.  
> - **Unified API**: You may want to keep your front-end calls within the same domain (CORS simplification) and route everything through SvelteKit.  
> - **Server-Side Logic**: You can do data transformations, caching, or other logic in your SvelteKit layer before/after calling the WP API.

---

# 1. Project Structure in SvelteKit

In SvelteKit, you typically place your API endpoints under a folder like `src/routes/api/...`. Each folder or file can have a `+server.js` that exports functions named after the HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, etc.).

A possible directory layout mirroring your WordPress endpoints might look like this:

```
src/
└─ routes/
   └─ api/
      └─ tributestream/
         └─ v1/
            ├─ getRole/
            │  └─ +server.js
            ├─ all-tributes/
            │  └─ +server.js
            ├─ tributes/
            │  ├─ +server.js         (handles GET, POST)
            │  └─ [id]/
            │     └─ +server.js      (handles GET, PUT, DELETE)
            ├─ tribute/
            │  ├─ +server.js         (handles POST for /tribute)
            │  └─ [slug]/
            │     └─ +server.js      (handles GET for /tribute/<slug>)
            ├─ user-meta/
            │  ├─ +server.js         (POST)
            │  └─ [user_id]/
            │     └─ +server.js      (GET)
            └─ register/
               └─ +server.js         (handles POST)
```

Each `+server.js` file implements a **function** corresponding to the HTTP method you want to handle (e.g., `export async function GET(...) {}`, `export async function POST(...) {}`, etc.).

---

# 2. Example: `getRole` Endpoint

**WordPress** route:  
- `GET /wp-json/tributestream/v1/getRole?id=123`

**SvelteKit** file: `src/routes/api/tributestream/v1/getRole/+server.js`

```js
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  // Grab the query parameter 'id' from the request
  const userId = url.searchParams.get('id');

  // Construct the URL to your WordPress site’s REST endpoint
  const wpUrl = `https://YOUR_WP_SITE.com/wp-json/tributestream/v1/getRole?id=${userId}`;

  // Fetch from WordPress
  const res = await fetch(wpUrl);
  if (!res.ok) {
    // Forward the error status/body if WP returned an error
    return new Response(await res.text(), { status: res.status });
  }

  // Convert response to JSON and return
  const data = await res.json();
  return json(data);
}
```

Now, hitting `GET /api/tributestream/v1/getRole?id=123` in your SvelteKit app will proxy to `https://YOUR_WP_SITE.com/wp-json/tributestream/v1/getRole?id=123`.

---

# 3. `all-tributes` Endpoint

**WordPress** route:  
- `GET /wp-json/tributestream/v1/all-tributes`

**SvelteKit** file: `src/routes/api/tributestream/v1/all-tributes/+server.js`

```js
import { json } from '@sveltejs/kit';

export async function GET() {
  const wpUrl = 'https://YOUR_WP_SITE.com/wp-json/tributestream/v1/all-tributes';

  const res = await fetch(wpUrl);
  if (!res.ok) {
    return new Response(await res.text(), { status: res.status });
  }

  const data = await res.json();
  return json(data);
}
```

---

# 4. `tributes` (GET & POST in one file)

**WordPress** routes:
- `GET /wp-json/tributestream/v1/tributes` (paginated list, e.g. `?page=1&per_page=10`)
- `POST /wp-json/tributestream/v1/tributes` (create a new tribute)

**SvelteKit** file: `src/routes/api/tributestream/v1/tributes/+server.js`

```js
import { json } from '@sveltejs/kit';

// GET => List tributes
export async function GET({ url }) {
  // For example, forward pagination/query params to WP
  const page = url.searchParams.get('page') || 1;
  const perPage = url.searchParams.get('per_page') || 10;
  const search = url.searchParams.get('search') || '';

  const wpUrl = new URL('https://YOUR_WP_SITE.com/wp-json/tributestream/v1/tributes');
  wpUrl.searchParams.set('page', page);
  wpUrl.searchParams.set('per_page', perPage);
  if (search) {
    wpUrl.searchParams.set('search', search);
  }

  const res = await fetch(wpUrl);
  if (!res.ok) {
    return new Response(await res.text(), { status: res.status });
  }

  const data = await res.json();
  return json(data);
}

// POST => Create a new tribute
export async function POST({ request }) {
  // Parse the incoming JSON
  const payload = await request.json();

  // Make a POST request to the WP endpoint
  const res = await fetch('https://YOUR_WP_SITE.com/wp-json/tributestream/v1/tributes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    return new Response(await res.text(), { status: res.status });
  }

  const data = await res.json();
  return json(data);
}
```

---

# 5. `tributes/[id]` (GET, PUT, DELETE in one file)

**WordPress** routes:
- `GET /wp-json/tributestream/v1/tributes/<id>`
- `PUT /wp-json/tributestream/v1/tributes/<id>`
- `DELETE /wp-json/tributestream/v1/tributes/<id>`

**SvelteKit** file: `src/routes/api/tributestream/v1/tributes/[id]/+server.js`

```js
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
  // The [id] segment is available via params.id
  const { id } = params;
  const wpUrl = `https://YOUR_WP_SITE.com/wp-json/tributestream/v1/tributes/${id}`;

  const res = await fetch(wpUrl);
  if (!res.ok) {
    return new Response(await res.text(), { status: res.status });
  }
  const data = await res.json();
  return json(data);
}

export async function PUT({ params, request }) {
  const { id } = params;
  const payload = await request.json();

  const res = await fetch(`https://YOUR_WP_SITE.com/wp-json/tributestream/v1/tributes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    return new Response(await res.text(), { status: res.status });
  }
  const data = await res.json();
  return json(data);
}

export async function DELETE({ params }) {
  const { id } = params;

  const res = await fetch(`https://YOUR_WP_SITE.com/wp-json/tributestream/v1/tributes/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    return new Response(await res.text(), { status: res.status });
  }
  const data = await res.json();
  return json(data);
}
```

---

# 6. `/tribute` (POST Only, JWT-Protected in WP)

**WordPress** route:
- `POST /wp-json/tributestream/v1/tribute` (requires JWT auth)

**SvelteKit** file: `src/routes/api/tributestream/v1/tribute/+server.js`

```js
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const payload = await request.json();

  // If you need to pass JWT token from SvelteKit to WP,
  // you might store it in cookies or session. For example:
  // const jwt = cookies.get('jwt_token'); 

  // Then forward it in the Authorization header
  const res = await fetch('https://YOUR_WP_SITE.com/wp-json/tributestream/v1/tribute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${jwt}` // if you have a JWT
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    return new Response(await res.text(), { status: res.status });
  }

  const data = await res.json();
  return json(data);
}
```

---

# 7. `/tribute/[slug]` (GET Only)

**WordPress** route:
- `GET /wp-json/tributestream/v1/tribute/<slug>`

**SvelteKit** file: `src/routes/api/tributestream/v1/tribute/[slug]/+server.js`

```js
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
  const { slug } = params;
  const wpUrl = `https://YOUR_WP_SITE.com/wp-json/tributestream/v1/tribute/${slug}`;

  const res = await fetch(wpUrl);
  if (!res.ok) {
    return new Response(await res.text(), { status: res.status });
  }

  const data = await res.json();
  return json(data);
}
```

---

# 8. `user-meta` (POST)

**WordPress** route:
- `POST /wp-json/tributestream/v1/user-meta` (requires JWT auth)

**SvelteKit** file: `src/routes/api/tributestream/v1/user-meta/+server.js`

```js
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const payload = await request.json();

  // Possibly retrieve JWT from a cookie or session
  // const jwt = cookies.get('jwt_token');

  const res = await fetch('https://YOUR_WP_SITE.com/wp-json/tributestream/v1/user-meta', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    return new Response(await res.text(), { status: res.status });
  }
  const data = await res.json();
  return json(data);
}
```

---

# 9. `user-meta/[user_id]` (GET)

**WordPress** route:
- `GET /wp-json/tributestream/v1/user-meta/<user_id>` (requires JWT auth)

**SvelteKit** file: `src/routes/api/tributestream/v1/user-meta/[user_id]/+server.js`

```js
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
  const { user_id } = params;

  // Possibly retrieve JWT from a cookie or session
  // const jwt = cookies.get('jwt_token');

  const res = await fetch(`https://YOUR_WP_SITE.com/wp-json/tributestream/v1/user-meta/${user_id}`, {
    method: 'GET',
    headers: {
      // 'Authorization': `Bearer ${jwt}`
    }
  });

  if (!res.ok) {
    return new Response(await res.text(), { status: res.status });
  }
  const data = await res.json();
  return json(data);
}
```

---

# 10. `register` (POST)

**WordPress** route:
- `POST /wp-json/tributestream/v1/register` (public)

**SvelteKit** file: `src/routes/api/tributestream/v1/register/+server.js`

```js
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const payload = await request.json();

  const res = await fetch('https://YOUR_WP_SITE.com/wp-json/tributestream/v1/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    return new Response(await res.text(), { status: res.status });
  }
  const data = await res.json();
  return json(data);
}
```

---

## Considerations

1. **Production URLs**:  
   - Replace `https://YOUR_WP_SITE.com` with the **actual** domain of your WordPress site.  
   - In a local dev environment, it might be `http://localhost:8888` or something similar.

2. **JWT Authorization**:  
   - For the protected endpoints (like `POST /tribute` or `user-meta`), you likely have a JWT plugin installed in WordPress.  
   - Typically, you’d store the token in a browser cookie, session, or local storage. Then in your SvelteKit +server.js, you’d retrieve that token and pass it in the `Authorization` header (e.g., `Authorization: Bearer <token>`).

3. **Error Handling**:  
   - In these examples, if the WP API call fails (non-2xx), we forward the error. You can customize the error messages or handle them differently.

4. **Deployment**:  
   - Once you deploy your SvelteKit app, these routes will be accessible under your app’s domain, for example:  
     - `GET /api/tributestream/v1/tributes`  
     - `POST /api/tributestream/v1/register`, etc.

5. **Consolidating Some Endpoints**:  
   - It’s perfectly fine if you prefer to keep each HTTP method in its own file. Another approach is to handle multiple methods in a single `+server.js` using `if (request.method === 'GET') ... else if (request.method === 'POST') ...`.

---

## Summary

By placing `+server.js` files in **mirroring directories** under `src/routes/api/tributestream/v1/`, you can replicate each WordPress route inside SvelteKit. Each **SvelteKit** endpoint:
1. Receives the incoming request (with URL params, query strings, or body data).
2. Relays that request to the **WordPress REST API** (`/wp-json/tributestream/v1/...`).
3. Returns the **response** (JSON, errors, etc.) back to the client.

This approach makes your SvelteKit application act as a **centralized gateway** for your WordPress API.

We are using a wordpress plugin to expose additional endpoints for manipulating our wordpress, follow this documentation to create a custom endpoint for each of our endpoints in our plugin: +server.js files in SvelteKit allow you to define API endpoints that give you complete control over server responses. Here's a breakdown:
Route Definition: By including a +server.js file in a directory within the routes directory, you're essentially creating an API endpoint.
HTTP Verb Handling: Inside +server.js, you export functions that correspond to HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD). Each of these functions takes a RequestEvent argument and must return a Response object.
For example, exporting a function named GET will handle GET requests to that route.
RequestEvent: The RequestEvent object provides information about the incoming request. This includes things like request parameters, the request body, cookies, and more.
Response Object: The functions in +server.js must return a Response object. You can create a Response object using the Response constructor or convenience functions like json and text from @sveltejs/kit.
The json function helps to create a JSON response with the correct headers.
The text function lets you send a response with plain text.
Error Handling: If an error occurs during the processing of a request in a +server.js file, SvelteKit will return a JSON representation of the error or a fallback error page. The +error.svelte component will not be rendered in this case.
Content Negotiation: +server.js files can be placed in the same directory as +page files, allowing the same route to be both a page and an API endpoint. SvelteKit uses the accept header to determine whether to handle a request as a page or via the +server.js file.
Form actions: Form actions are the preferred method for sending data from a browser to a server.
Here's an example of a +server.js file that handles a POST request:
// src/routes/api/add/+server.js
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const { a, b } = await request.json();
  return json(a + b);
}

This endpoint expects a JSON payload with properties a and b, and it returns a JSON response containing the sum of those values.
