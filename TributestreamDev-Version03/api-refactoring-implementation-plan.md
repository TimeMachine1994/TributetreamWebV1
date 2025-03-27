# TributeStream API Refactoring Implementation Plan

This document outlines the comprehensive implementation plan for refactoring the API client in 'TributestreamDev-Version03/src/lib/api' to create SvelteKit server endpoints that proxy requests to the WordPress plugin TributestreamAPI-Plugin-for-Wordpress.php.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Implementation Phases](#implementation-phases)
3. [API Endpoint Documentation](#api-endpoint-documentation)
4. [Authentication Flow](#authentication-flow)
5. [Error Handling Strategy](#error-handling-strategy)
6. [Response Transformation](#response-transformation)
7. [Example Implementation](#example-implementation)
8. [Testing Strategy](#testing-strategy)
9. [Future Optimizations](#future-optimizations)

## Architecture Overview

The refactored API architecture follows a server-side proxy pattern with the following components:

- **SvelteKit Server Endpoints**: Implemented as +server.ts files in the `/src/routes/api` directory structure.
- **Server Utilities**: Helper functions in `$lib/server` for authentication, request forwarding, and error handling.
- **Type Definitions**: TypeScript interfaces in `$lib/server/types.ts` for request and response objects.

```
src/
├── lib/
│   ├── server/
│   │   ├── apiUtils.ts    # API utilities for request forwarding and response handling
│   │   ├── authUtils.ts   # Authentication utilities
│   │   └── types.ts       # TypeScript interfaces for request/response data
│   └── api/               # Frontend API client (to be deprecated after migration)
│       └── tribute-api-client.ts
└── routes/
    └── api/
        ├── README.md      # API documentation
        ├── auth/          # Authentication endpoints
        │   ├── token/
        │   ├── validate/
        │   └── register/
        ├── tributes/      # Tribute management endpoints
        │   └── [id]/
        │       └── data/  # Tribute data endpoints
        ├── tribute/
        │   └── [slug]/    # Get tribute by slug
        ├── users/
        │   └── [userId]/
        │       ├── tributes/
        │       └── meta/
        │           └── [metaKey]/
        └── forms/         # Form data endpoints
            └── [userId]/
```

## Implementation Phases

### Phase 1: Foundation Setup ✅

1. Create the necessary folder structure in src/routes/api
2. Establish base utility functions in `$lib/server` for:
   - WordPress API communication 
   - Authentication handling
   - Error handling and response transformation

### Phase 2: Endpoint Analysis ✅

1. Document all WordPress API endpoints
2. Identify request/response structures
3. Create TypeScript interfaces
4. Prioritize endpoints based on frontend requirements

### Phase 3: Individual Endpoint Implementation ✅

For each WordPress endpoint:
1. Create corresponding SvelteKit endpoint file
2. Implement HTTP method handlers
3. Set up parameter and request forwarding
4. Transform responses
5. Add endpoint-specific error handling
6. Add proper TypeScript typing
7. Document the endpoint

### Phase 4: Testing and Optimization ✅

1. Test each endpoint for correctness
2. Implement basic error handling
3. Document usage examples
4. Add performance optimizations

## API Endpoint Documentation

See the [API README](./src/routes/api/README.md) for complete endpoint documentation.

### Available Endpoints

#### Authentication

- **POST /api/auth/token** - Obtain a JWT token with username/password
- **POST /api/auth/validate** - Validate an existing JWT token
- **POST /api/auth/register** - Register a new user and obtain a token

#### Tributes

- **GET /api/tributes** - List tributes with pagination and search
- **POST /api/tributes** - Create a new tribute
- **GET /api/tributes/[id]** - Get a tribute by ID
- **PUT /api/tributes/[id]** - Update a tribute
- **DELETE /api/tributes/[id]** - Delete a tribute
- **GET /api/tribute/[slug]** - Get a tribute by slug
- **GET /api/tributes/[id]/data** - Get extended tribute data
- **POST /api/tributes/[id]/data** - Create or replace tribute data
- **PUT /api/tributes/[id]/data** - Update tribute data (partial update)

#### Users

- **GET /api/users/[userId]/tributes** - Get tributes for a specific user
- **GET /api/users/[userId]/meta** - Get all metadata for a user
- **POST /api/users/[userId]/meta** - Create or update user metadata
- **GET /api/users/[userId]/meta/[metaKey]** - Get a single metadata value
- **DELETE /api/users/[userId]/meta/[metaKey]** - Delete user metadata

#### Forms

- **GET /api/forms/[userId]** - Get form data for a user
- **POST /api/forms** - Save form data for a user

## Authentication Flow

The API uses JWT (JSON Web Token) authentication through the WordPress plugin 'JWT Authentication for WP REST API'. The authentication flow is as follows:

1. **Login**: Client sends credentials to `/api/auth/token` to obtain a JWT token
2. **Token Storage**: Client stores the token (localStorage, cookie, etc.)
3. **Authentication**: Client adds the token to the Authorization header for subsequent requests
4. **Validation**: Server endpoints validate the token using the `/api/auth/validate` endpoint
5. **Permission Checking**: Endpoints verify the user has permission for the requested operation

Implementation details:

- `ensureAuthenticated` function extracts and validates the JWT token
- `getAuthenticatedUserId` function retrieves the user ID from the token
- `checkTributePermission` verifies the user has permission to access a tribute

## Error Handling Strategy

All API endpoints follow a standardized error handling approach:

1. **Standard Error Response Format**:
```typescript
{
  success: false,
  error: string,
  code: string,
  status: number
}
```

2. **Error Categories**:
   - Authentication Errors (401)
   - Permission Errors (403)
   - Validation Errors (400)
   - Not Found Errors (404)
   - Server Errors (500)

3. **Error Handling Process**:
   - Try/catch blocks for all endpoint handlers
   - Authentication and permission checks before processing
   - Input validation with descriptive error messages
   - Forwarding and transforming WordPress API errors

## Response Transformation

Response transformation ensures consistent format between the WordPress API and the frontend:

1. **Standardized Response Format**:
```typescript
{
  success: boolean,
  data?: T,
  error?: string,
  code?: string,
  status: number
}
```

2. **Data Transformation Steps**:
   - Parse WordPress API responses
   - Transform response structure if needed
   - Handle WordPress-specific data formats
   - Normalize field names and data types

## Example Implementation

Here's a complete implementation example for the "Get tributes by user ID" endpoint:

1. **Endpoint Definition** (`src/routes/api/users/[userId]/tributes/+server.ts`):

```typescript
/**
 * Get Tributes by User Endpoint
 * 
 * Returns tributes associated with a specific user
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardRequestToWordPress } from '$lib/server/apiUtils';
import { ensureAuthenticated, checkTributePermission } from '$lib/server/authUtils';

/**
 * @api {get} /api/users/:userId/tributes Get tributes by user
 * @apiName GetTributesByUser
 * @apiGroup Users
 * @apiDescription Returns tributes associated with a specific user
 *
 * @apiParam {Number} userId User ID in route path
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful
 * @apiSuccess {Object} data Response data
 * @apiSuccess {Array} data.tributes List of tributes
 */
export const GET: RequestHandler = async (event) => {
  try {
    // Get the user ID from the URL parameter
    const userId = parseInt(event.params.userId, 10);
    
    if (isNaN(userId)) {
      return json({
        success: false,
        error: 'Invalid user ID',
        code: 'INVALID_PARAMETER',
        status: 400
      }, { status: 400 });
    }
    
    // Ensure user is authenticated and has permission
    await ensureAuthenticated(event);
    
    // Check if user has permission to access this user's tributes
    const { errorResponse } = await checkTributePermission(
      event,
      0, // Not checking a specific tribute
      userId // The user ID we're checking
    );
    
    if (errorResponse) {
      return errorResponse;
    }
    
    // Forward the request to WordPress
    const response = await forwardRequestToWordPress<{ tributes: Tribute[] }>(
      event,
      `/tributestream/v1/tributes/by-user/${userId}`
    );
    
    // Return the response
    return json(response, { status: response.success ? 200 : (response.status || 500) });
  } catch (error) {
    console.error('Error fetching tributes by user:', error);
    
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tributes',
      code: 'SERVER_ERROR',
      status: 500
    }, { status: 500 });
  }
};
```

2. **TypeScript Interface** (`src/lib/server/types.ts` excerpt):

```typescript
/**
 * Tribute data interface
 */
export interface Tribute {
  id: number;
  user_id: number;
  loved_one_name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  custom_html?: string;
  phone_number: string;
  number_of_streams?: number;
  extended_data?: Record<string, unknown>;
}
```

3. **API Utility Function** (`src/lib/server/apiUtils.ts` excerpt):

```typescript
/**
 * Forward a request to the WordPress API and return the response
 * 
 * @param event SvelteKit request event
 * @param path WordPress API path (without base URL)
 * @param options Additional fetch options
 * @returns API response with success status and data
 */
export async function forwardRequestToWordPress<T>(
  event: RequestEvent,
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Implementation details...
}
```

## Testing Strategy

For comprehensive testing of the API endpoints:

1. **Unit Testing**:
   - Test individual utility functions
   - Mock WordPress API responses
   - Test error handling paths

2. **Integration Testing**:
   - Test endpoint-to-WordPress communication
   - Verify authentication flows
   - Test with various input parameters

3. **Manual Testing Checklist**:
   - Verify each endpoint with valid parameters
   - Test error conditions
   - Validate response formats

## Future Optimizations

Potential future improvements for the API:

1. **Performance Optimizations**:
   - Implement request caching for appropriate endpoints
   - Add response compression
   - Optimize HTTP keep-alive connections

2. **Security Enhancements**:
   - Implement rate limiting
   - Add CSRF protection
   - Enhance permission checks

3. **Developer Experience**:
   - Add OpenAPI/Swagger documentation
   - Create comprehensive end-to-end tests
   - Improve error messaging

4. **Monitoring and Logging**:
   - Add request/response logging
   - Implement performance metrics
   - Set up error alerting
