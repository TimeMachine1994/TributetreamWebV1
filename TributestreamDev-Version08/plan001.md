# Login Implementation Plan

## 🧭 Objective

Implement a secure login form on the homepage (`+page.svelte`) that:

1. Authenticates the user via Strapi’s `/api/auth/local` endpoint.
2. Stores the JWT in an HttpOnly cookie.
3. Fetches and displays the authenticated user’s data using the JWT.

---

## 🧱 Architecture Overview

```mermaid
graph TD
  A[Login Form on Homepage] --> B[POST /api/auth/login (SvelteKit API Route)]
  B --> C[Strapi /api/auth/local]
  C --> D[JWT + User Info]
  D --> E[Set HttpOnly Cookie]
  E --> F[Redirect to Homepage]
  F --> G[+page.server.ts fetches /api/users/me]
  G --> H[Strapi /api/users/me with JWT]
  H --> I[User Data Rendered in +page.svelte]
```

---

## 🔨 Implementation Steps

### 1. Create Login Form UI

- File: `src/routes/+page.svelte`
- Use Shadcn UI components for form inputs and button.
- Bind form fields to `identifier` and `password`.

### 2. Create Login API Endpoint

- File: `src/routes/api/auth/login/+server.ts`
- Method: `POST`
- Logic:
  - Forward credentials to `https://your-strapi.com/api/auth/local`
  - On success, extract `jwt` and `user`
  - Set `jwt` in an HttpOnly cookie
  - Return minimal user info or redirect instruction

### 3. Handle Form Submission

- Use `form` action with `use:enhance` or `on:submit` handler
- POST to `/api/auth/login`
- On success, redirect or trigger page reload

### 4. Fetch User Data on Page Load

- File: `src/routes/+page.server.ts`
- Use `cookies.get('jwt')` to retrieve token
- Use `event.fetch` to call `https://your-strapi.com/api/users/me` with `Authorization: Bearer ${jwt}`
- Return user data to page

### 5. Display User Info

- File: `+page.svelte`
- Use `export let data` to receive user info
- Conditionally render user data if authenticated

### 6. Add Logout Endpoint

- File: `src/routes/api/auth/logout/+server.ts`
- Method: `POST`
- Logic: Clear the `jwt` cookie

### 7. Add Logout Button

- File: `+page.svelte`
- POST to `/api/auth/logout` and reload page

---
