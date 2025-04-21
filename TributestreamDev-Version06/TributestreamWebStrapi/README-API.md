# TributeStream Backend API and Test Interface

This document provides an overview of the backend API integration between the SvelteKit frontend and Strapi backend for the TributeStream application.

## Architecture Overview

This implementation follows a proxy pattern where the SvelteKit backend acts as a middleman between the frontend and the Strapi API. This approach provides several benefits:

1. **Security:** The frontend doesn't need to know about backend implementation details
2. **Authentication:** JWT tokens are stored in HttpOnly cookies, which is more secure than local storage
3. **Simplified frontend code:** Frontend components can use relative URLs instead of dealing with cross-origin requests
4. **Centralized error handling:** API errors can be handled consistently

## API Endpoints

The following API endpoints have been implemented:

### Authentication

- `POST /api/auth` - Login (authenticate a user)
- `POST /api/auth/register` - Register a new user

### Users

- `GET /api/users/me` - Get the current authenticated user

### Tributes

- `GET /api/tributes` - List all tributes (with optional filtering)
- `POST /api/tributes` - Create a new tribute
- `GET /api/tributes/:id` - Get a specific tribute
- `PUT /api/tributes/:id` - Update a specific tribute
- `DELETE /api/tributes/:id` - Delete a specific tribute

## Authentication Flow

1. When a user logs in or registers, the frontend sends credentials to the SvelteKit backend
2. The SvelteKit backend forwards the request to Strapi
3. If authentication is successful, Strapi returns a JWT token
4. The SvelteKit backend stores this token in an HttpOnly cookie
5. Subsequent requests include this cookie automatically
6. The server.hooks file validates the JWT token on each request and sets user data in event.locals

## Component Files Overview

### Core Files

- `src/lib/server/proxy.ts` - Utility for proxying requests to Strapi
- `src/hooks.server.ts` - Server hooks for authentication and route protection
- `src/app.d.ts` - TypeScript definitions for auth data

### API Endpoints

- `src/routes/api/auth/+server.ts` - Login endpoint
- `src/routes/api/auth/register/+server.ts` - Registration endpoint
- `src/routes/api/users/me/+server.ts` - Current user endpoint
- `src/routes/api/tributes/+server.ts` - Tributes list and creation endpoints
- `src/routes/api/tributes/[id]/+server.ts` - Single tribute endpoints

### Documentation

- `static/api-docs.html` - API documentation page

## Setup and Configuration

1. Ensure Strapi backend is running at http://localhost:1338 (or update the backend URL in proxy files)
2. In Strapi admin, add the SvelteKit URL to the allowed CORS origins
3. Configure environment variables if needed

## Testing the API

You can test the API endpoints using:

1. **API Documentation Page**: Navigate to `/api-docs.html` to view the documentation
2. **Command Line Tools**: Use curl or similar tools to make requests to the endpoints
3. **API Testing Tools**: Use Postman, Insomnia, or similar tools

Example curl commands:

```bash
# Register a new user
curl -X POST http://localhost:5173/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5173/api/auth \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"test123"}'

# Create a tribute
curl -X POST http://localhost:5173/api/tributes \
  -H "Content-Type: application/json" \
  -d '{"data":{"lovedOnesFullName":"Jane Doe","slug":"jane-doe"}}'
```

## Next Steps

- Implement frontend components that use these API endpoints
- Add proper error handling and loading states
- Implement role-based access control
- Add pagination for large data sets
- Add frontend form validation
