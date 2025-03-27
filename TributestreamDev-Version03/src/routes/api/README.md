# TributeStream API Endpoints

This directory contains SvelteKit server endpoints that proxy requests to the WordPress TributeStream API.

## Authentication

The TributeStream API uses JSON Web Tokens (JWT) for authentication. All authenticated endpoints require an `Authorization` header with a Bearer token.

### Authentication Endpoints

- **POST /api/auth/token** - Obtain a JWT token with username/password
- **POST /api/auth/validate** - Validate an existing JWT token
- **POST /api/auth/register** - Register a new user and obtain a token

## Tributes

Endpoints for managing tribute pages.

- **GET /api/tributes** - List tributes with pagination and search
- **POST /api/tributes** - Create a new tribute
- **GET /api/tributes/[id]** - Get a tribute by ID
- **PUT /api/tributes/[id]** - Update a tribute
- **DELETE /api/tributes/[id]** - Delete a tribute
- **GET /api/tribute/[slug]** - Get a tribute by slug
- **GET /api/tributes/[id]/data** - Get extended tribute data
- **POST /api/tributes/[id]/data** - Create or replace tribute data
- **PUT /api/tributes/[id]/data** - Update tribute data (partial update)

## Users

Endpoints for managing user data.

- **GET /api/users/[userId]/tributes** - Get tributes for a specific user
- **GET /api/users/[userId]/meta** - Get all metadata for a user
- **POST /api/users/[userId]/meta** - Create or update user metadata
- **GET /api/users/[userId]/meta/[metaKey]** - Get a single metadata value
- **DELETE /api/users/[userId]/meta/[metaKey]** - Delete user metadata

## Forms

Endpoints for managing form data.

- **GET /api/forms/[userId]** - Get form data for a user
- **POST /api/forms** - Save form data for a user

## Response Format

All API endpoints return responses in the following format:

```typescript
{
  success: boolean;         // Whether the request was successful
  data?: T;                 // Response data (when success is true)
  error?: string;           // Error message (when success is false)
  code?: string;            // Error code (when success is false)
  status: number;           // HTTP status code
}
```

## Authentication Requirements

- Unauthenticated endpoints:
  - POST /api/auth/token
  - POST /api/auth/register
  - GET /api/tribute/[slug] (public tributes only)

- Authenticated endpoints (require valid JWT token):
  - All other endpoints

## Error Handling

Common error codes:

- `AUTHENTICATION_REQUIRED` - No authentication token provided
- `INVALID_TOKEN` - Invalid or expired token
- `PERMISSION_DENIED` - User doesn't have permission for the resource
- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `SERVER_ERROR` - Internal server error

## Implementation Notes

These endpoints are implemented as SvelteKit server routes (+server.ts files) that proxy requests to the WordPress REST API. They handle:

1. Authentication and authorization
2. Request validation and transformation
3. Error handling and standardized responses
4. Response transformation to match frontend requirements

The implementation uses utility functions from:
- `$lib/server/apiUtils.ts` - API request forwarding and response handling
- `$lib/server/authUtils.ts` - Authentication and permission checks
- `$lib/server/types.ts` - TypeScript interfaces for request/response data