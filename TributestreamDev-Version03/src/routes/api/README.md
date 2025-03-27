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

- **GET /api/tribute-pages** - List tributes with pagination and search
- **POST /api/tribute-pages** - Create a new tribute
- **GET /api/tribute-pages/[id]** - Get a tribute by ID
- **PUT /api/tribute-pages/[id]** - Update a tribute (full update)
- **PATCH /api/tribute-pages/[id]** - Update a tribute (partial update)
- **DELETE /api/tribute-pages/[id]** - Delete a tribute
- **GET /api/tribute/[slug]** - Get a tribute by slug
- **GET /api/tribute-pages/[id]/events** - Get events for a specific tribute
- **GET /api/tribute-pages/[id]/locations** - Get locations for a specific tribute

## Locations

Endpoints for managing locations.

- **GET /api/locations** - List locations with pagination and filtering
- **POST /api/locations** - Create a new location
- **GET /api/locations/[id]** - Get a location by ID
- **PUT /api/locations/[id]** - Update a location (full update)
- **PATCH /api/locations/[id]** - Update a location (partial update)
- **DELETE /api/locations/[id]** - Delete a location
- **GET /api/locations/[id]/events** - Get events for a specific location

## Events

Endpoints for managing events.

- **GET /api/events** - List events with pagination and filtering
- **POST /api/events** - Create a new event
- **GET /api/events/[id]** - Get an event by ID
- **PUT /api/events/[id]** - Update an event (full update)
- **PATCH /api/events/[id]** - Update an event (partial update)
- **DELETE /api/events/[id]** - Delete an event
- **GET /api/events/active** - Get active events (not ended yet)

## Users

Endpoints for managing user data.

- **GET /api/users** - List users (admin only)
- **POST /api/users** - Create a new user (admin only)
- **GET /api/users/[id]** - Get a user by ID (admin or self)
- **PUT /api/users/[id]** - Update a user (full update)
- **PATCH /api/users/[id]** - Update a user (partial update)
- **DELETE /api/users/[id]** - Delete a user (admin only)
- **GET /api/users/me** - Get current user

## Funeral Homes

Endpoints for managing funeral homes.

- **GET /api/funeral-homes** - List funeral homes
- **POST /api/funeral-homes** - Create a new funeral home
- **GET /api/funeral-homes/[id]** - Get a funeral home by ID
- **PUT /api/funeral-homes/[id]** - Update a funeral home (full update)
- **PATCH /api/funeral-homes/[id]** - Update a funeral home (partial update)
- **DELETE /api/funeral-homes/[id]** - Delete a funeral home

## Schedules

Endpoints for managing schedules.

- **GET /api/schedules** - List schedules
- **POST /api/schedules** - Create a new schedule
- **GET /api/schedules/[id]** - Get a schedule by ID
- **PUT /api/schedules/[id]** - Update a schedule (full update)
- **PATCH /api/schedules/[id]** - Update a schedule (partial update)
- **DELETE /api/schedules/[id]** - Delete a schedule

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