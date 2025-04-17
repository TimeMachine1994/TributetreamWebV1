# API v2 Usage Guide

This document provides information on how to use the Tributestream API v2 endpoints.

## Base URL

All API v2 endpoints are available at:

```
/api/v2/
```

## Authentication

Most API endpoints require authentication. The API uses JWT tokens for authentication, which are stored in cookies.

### Login

To authenticate, send a POST request to `/api/v2/auth` with your credentials:

```javascript
// Example using fetch
const response = await fetch('/api/v2/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'your_username',
    password: 'your_password',
    remember_me: true // Optional, defaults to true
  }),
  credentials: 'include' // Important for cookies
});

const data = await response.json();
```

The response will include user information and set cookies for authentication.

### Check Authentication Status

To check if a user is authenticated, send a GET request to `/api/v2/auth`:

```javascript
const response = await fetch('/api/v2/auth', {
  credentials: 'include'
});

const data = await response.json();
// data.isAuthenticated will be true if the user is authenticated
// data.user will contain user information if authenticated
```

### Logout

To log out, send a POST request to `/api/v2/auth/logout`:

```javascript
const response = await fetch('/api/v2/auth/logout', {
  method: 'POST',
  credentials: 'include'
});

const data = await response.json();
```

### Register

To register a new user, send a POST request to `/api/v2/auth/register`:

```javascript
const response = await fetch('/api/v2/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'new_username',
    email: 'user@example.com',
    password: 'secure_password',
    name: 'User Name', // Optional
    first_name: 'User', // Optional
    last_name: 'Name', // Optional
    user_type: 'guest', // Optional, defaults to 'guest'
    send_welcome_email: true // Optional, defaults to true
  }),
  credentials: 'include'
});

const data = await response.json();
```

## User Management

### Get Current User

To get information about the currently authenticated user, send a GET request to `/api/v2/users/me`:

```javascript
const response = await fetch('/api/v2/users/me', {
  credentials: 'include'
});

const data = await response.json();
// data.data will contain user information
```

### Update Current User

To update the currently authenticated user, send a PATCH request to `/api/v2/users/me`:

```javascript
const response = await fetch('/api/v2/users/me', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'new_email@example.com', // Optional
    first_name: 'New First Name', // Optional
    last_name: 'New Last Name', // Optional
    name: 'New Display Name', // Optional
    password: 'new_password' // Optional
  }),
  credentials: 'include'
});

const data = await response.json();
// data.data will contain updated user information
```

## Role Management

### Check User Roles

To check if a user has a specific role or capability, send a GET request to `/api/v2/roles/check`:

```javascript
// Check if the current user has a specific role
const response = await fetch('/api/v2/roles/check?role=administrator', {
  credentials: 'include'
});

const data = await response.json();
// data.data.hasRole will be true if the user has the role

// Check if the current user has a specific capability
const response = await fetch('/api/v2/roles/check?capability=manage_options', {
  credentials: 'include'
});

const data = await response.json();
// data.data.hasCapability will be true if the user has the capability
```

To check roles for a specific user (admin only), send a POST request to `/api/v2/roles/check`:

```javascript
const response = await fetch('/api/v2/roles/check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 123,
    role: 'administrator', // Optional
    capability: 'manage_options' // Optional
  }),
  credentials: 'include'
});

const data = await response.json();
```

### Assign Roles

To assign a role to a user (admin only), send a POST request to `/api/v2/roles/assign`:

```javascript
const response = await fetch('/api/v2/roles/assign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 123,
    role: 'editor',
    userType: 'funeral_director' // Optional
  }),
  credentials: 'include'
});

const data = await response.json();
```

### Update Roles

To update a user's role (admin only), send a PUT request to `/api/v2/roles/assign`:

```javascript
const response = await fetch('/api/v2/roles/assign', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 123,
    role: 'author',
    userType: 'family_member' // Optional
  }),
  credentials: 'include'
});

const data = await response.json();
```

### Remove Roles

To remove a role from a user (admin only), send a DELETE request to `/api/v2/roles/assign`:

```javascript
const response = await fetch('/api/v2/roles/assign?userId=123&role=author', {
  method: 'DELETE',
  credentials: 'include'
});

const data = await response.json();
```

## Response Format

All API responses follow a standard format:

```javascript
{
  "success": true, // or false if there was an error
  "data": {
    // Response data specific to the endpoint
  },
  "error": {
    // Only present if success is false
    "code": "ERROR_CODE",
    "message": "Error message",
    "status": 400, // HTTP status code
    "details": {} // Optional additional error details
  },
  "meta": {
    // Optional metadata
    "pagination": {
      "total": 100,
      "page": 1,
      "per_page": 10,
      "total_pages": 10
    }
  }
}
```

## Error Handling

When an error occurs, the API will return a response with `success: false` and an `error` object containing details about the error:

```javascript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields: username, password",
    "status": 400,
    "details": {
      "missing": ["username", "password"]
    }
  }
}
```

Common error codes:

- `UNAUTHORIZED`: Authentication is required
- `FORBIDDEN`: You don't have permission to perform this action
- `NOT_FOUND`: The requested resource was not found
- `VALIDATION_ERROR`: The request data failed validation
- `BAD_REQUEST`: The request was malformed
- `CONFLICT`: The resource already exists
- `INTERNAL_ERROR`: An unexpected error occurred
- `SERVICE_UNAVAILABLE`: The service is temporarily unavailable

## Pagination

List endpoints support pagination using the `page` and `per_page` query parameters:

```
GET /api/v2/users?page=2&per_page=20
```

The response will include pagination metadata:

```javascript
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "total": 100,
      "page": 2,
      "per_page": 20,
      "total_pages": 5
    }
  }
}
```

## Sorting

List endpoints support sorting using the `sort_by` and `sort_order` query parameters:

```
GET /api/v2/users?sort_by=name&sort_order=desc
```

## Filtering

List endpoints support filtering using various query parameters specific to each endpoint:

```
GET /api/v2/tributes?user_id=123&search=John
```

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for specific domains. If you're accessing the API from a different domain, make sure your domain is allowed in the CORS configuration.