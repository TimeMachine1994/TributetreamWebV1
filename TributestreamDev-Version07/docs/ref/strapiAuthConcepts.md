# Strapi Authentication in SvelteKit

This document explains how authentication with Strapi works in a SvelteKit application.

## Authentication Flow

1. **User logs in**:
   - The user submits credentials (identifier and password) through a form
   - SvelteKit's form action processes the submission
   - The credentials are sent to Strapi's `/api/auth/local` endpoint
   - Strapi validates the credentials and returns a JWT token

2. **JWT storage**:
   - The JWT token is stored in an HttpOnly cookie
   - This cookie is secure and cannot be accessed by JavaScript
   - The token is used for all subsequent authenticated requests

3. **Authentication verification**:
   - SvelteKit's load function checks for the JWT cookie
   - If present, it fetches the user profile from Strapi
   - User data is made available to the page as a prop

4. **Logout**:
   - When the user logs out, the JWT cookie is deleted
   - This invalidates the session from the client side

## JWT Token Security

We use the following best practices for JWT token security:

- **HttpOnly**: Prevents JavaScript access to the cookie
- **Secure**: Only sent over HTTPS connections
- **SameSite: lax**: Prevents CSRF attacks while allowing normal navigation
- **Path: '/'**: Makes the cookie available throughout the application
- **MaxAge**: Sets the cookie expiration (typically 1 week)

## Implementation Files

Our implementation consists of several key files:

- `src/routes/+page.server.ts`: Contains the load function and login form action
- `src/routes/api/auth/me/+server.ts`: Endpoint for fetching user profile
- `src/routes/api/auth/logout/+server.ts`: Endpoint for logging out
- `src/lib/api/auth.ts`: API functions for authentication
- `src/lib/components/login-form.svelte`: Form component for user login
- `src/lib/components/user-profile.svelte`: Component for displaying user information

## Strapi Authentication Endpoints

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/api/auth/local` | POST | User login | `{identifier, password}` | `{jwt, user}` |
| `/api/users/me` | GET | Get current user | Auth header | User object |
| `/api/auth/local/register` | POST | User registration | `{username, email, password}` | `{jwt, user}` |

## Error Handling

Our authentication system handles various error cases:

- Invalid credentials
- Server errors
- Network failures
- Session expiration

Each error is properly displayed to the user with clear messages.