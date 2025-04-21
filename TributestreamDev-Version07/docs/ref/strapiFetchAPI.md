Exploring Strapi fetch API
The user is asking about how to make a basic fetch request with Strapi, likely using SvelteKit or another frontend. Strapi has both REST and GraphQL endpoints, which means they can use the fetch API to get data. They might need to handle authentication—using public endpoints or JWT with Bearer tokens. I might also look into how the user is storing the JWT, but for now, I’ll stick to fetch examples. I could browse up-to-date Strapi docs to be sure.
Providing code example for Strapi fetch
I found the official Strapi docs, which should help for building a response with citations. The user wants to fetch data from Strapi using a simple example. So, I'll show how to make a GET request with the fetch API, both with public access and authentication tokens.
I’ll also include an example for logging in with POST, setting the JWT in cookies, and then explain how to fetch this data from SvelteKit. I'll cover the difference between REST and GraphQL too, as they asked.
Gathering code examples and citations
The page has both code examples and security information, which is great. We might also need to check the login endpoint docs, but for now, the blog lines will be sufficient for citations. I'll pull relevant code lines, like "const response = await fetch('http://localhost:1337/api/articles'..." from lines 7-8, and be sure to cite them. I’ll also reference lines 6 for prerequisites related to content types and cite endpoints from lines 10. I'll add appropriate citations from the source.
Thought for 50 seconds
Below is the 90‑second tour of “making a Strapi request with fetch().”
 Keep it handy the next time you blank on the exact header or URL shape.

1 · Know the URL Strapi Exposes
Every collection‑type you create is automatically exposed as:
GET  /api/:pluralApiId        → list documents
GET  /api/:pluralApiId/:id    → single document
POST /api/:pluralApiId        → create
PUT  /api/:pluralApiId/:id    → update
DELETE …                      → delete

…plus the same pattern for single‑types. These routes exist immediately after the content‑type is saved in the admin UI.citeturn2view0
Example
 http://localhost:1337/api/articles

2 · Decide Who’s Allowed to See It
Public content – flip the “Public → find” permission on in Settings → Users & Permissions.
 → No auth header needed.


Protected content – authenticate either with an API token (good for server‑to‑server jobs) or with a user JWT (good for logged‑in humans).
 All content is private until you do one of those.citeturn2view0



3 · Bare‑bones Fetch (no auth)
const res = await fetch(
  'https://your‑strapi.com/api/articles?populate=*'
);
const { data, meta } = await res.json();

Add any of Strapi’s query helpers—populate, filters, pagination, etc.—directly on the URL.

4 · Authenticated Fetch with an API Token
const res = await fetch(
  'https://your‑strapi.com/api/articles',
  {
    headers: { Authorization: 'Bearer ' + STRAPI_API_TOKEN }
  }
);
const json = await res.json();

Same pattern works with axios, ky, etc.citeturn5view0

5 · User Login → Store JWT → Subsequent Requests
// 1. Log in (identifier = email or username)
const login = await fetch(
  'https://your‑strapi.com/api/auth/local',
  {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ identifier, password })
  }
);
const { jwt, user } = await login.json();

// 2. In SvelteKit, stash the JWT safely:
cookies.set('jwt', jwt, {
  httpOnly: true,
  secure : true,
  sameSite: 'lax',
  path   : '/'
});

// 3. Use it on server‑side requests:
const articles = await event.fetch(
  'https://your‑strapi.com/api/articles',
  { headers: { Authorization: `Bearer ${jwt}` } }
);

Store the JWT in an HttpOnly cookie (server‑side only) or—if you must—in localStorage plus XSS protections.citeturn5view0

6 · POST / PUT / DELETE Are the Same Dance
await fetch('…/api/articles', {
  method : 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization : `Bearer ${jwt}`
  },
  body: JSON.stringify({ title: 'My new post' })
});


7 · SvelteKit Quick‑Drop Snippet
// +page.server.ts
import { STRAPI_URL } from '$env/static/private';

export const load = async ({ cookies, fetch }) => {
  const jwt = cookies.get('jwt');
  const res = await fetch(`${STRAPI_URL}/api/articles`, {
    headers: { Authorization: `Bearer ${jwt}` }
  });
  return { articles: await res.json() };
};

 
TL;DR
Pick the right URL (/api/collection or /graphql).


Public? Skip headers. Private? Add Authorization: Bearer ….


REST query helpers (populate, filters, pagination) go straight on the URL.


For SvelteKit, keep secrets on the server (use event.fetch and HttpOnly cookies).


Happy fetching!

