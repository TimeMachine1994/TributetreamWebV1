# TributeStream API Documentation

This document outlines the available API endpoints in the TributeStream application.

## Base URL

All API endpoints are relative to: `https://wp.tributestream.com/wp-json/tributestream/v1`

## Authentication

Most endpoints require authentication via JWT token. The token should be included in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Authentication Endpoints

### Login

**POST** `/api/auth`

Authenticates a user and returns a JWT token.

#### Request Body
```json
{
  "username": "string",
  "password": "string"
}
```

#### Response
```json
{
  "token": "string",
  "user_display_name": "string",
  "user_email": "string",
  "user_nicename": "string",
  "roles": ["string"],
  "capabilities": {}
}
```

### Register

**POST** `/api/register`

Creates a new user account.

#### Request Body
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### Response
Returns the created user data on success with status 201.

#### Error Responses
- 400: Missing required fields
- 500: Registration failed

### Logout

**POST** `/api/logout`

Logs out the current user by clearing their JWT token.

#### Response
```json
{
  "success": true
}
```

## Admin Endpoints

### Users

Base path: `/api/admin/users`

#### GET /api/admin/users
Retrieves users based on query parameters. Requires admin privileges.

Query Parameters:
- `id` (optional): Get a specific user by ID
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Items per page (default: 10)
- `search` (optional): Search term for filtering users
- `count` (optional): If true, returns total count of users
- `recent` (optional): If true, returns 5 most recent users

#### POST /api/admin/users
Creates a new user. Requires admin privileges.

Request Body: User data object

#### PUT /api/admin/users
Updates an existing user. Requires admin privileges.

Request Body:
```json
{
  "id": "number",
  "...updateData": "object"
}
```

#### DELETE /api/admin/users
Deletes a user. Requires admin privileges.

Request Body:
```json
{
  "id": "number"
}
```

### Tributes

Base path: `/api/admin/tributes`

#### GET /api/admin/tributes
Retrieves tributes based on query parameters. Requires admin privileges.

Query Parameters:
- `id` (optional): Get a specific tribute by ID
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Items per page (default: 10)
- `search` (optional): Search term for filtering tributes
- `count` (optional): If true, returns total count of tributes
- `recent` (optional): If true, returns 5 most recent tributes

#### POST /api/admin/tributes
Creates a new tribute. Requires admin privileges.

Request Body: Tribute data object

#### PUT /api/admin/tributes
Updates an existing tribute. Requires admin privileges.

Request Body:
```json
{
  "id": "number",
  "...updateData": "object"
}
```

#### DELETE /api/admin/tributes
Deletes a tribute. Requires admin privileges.

Request Body:
```json
{
  "id": "number"
}
```

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 400 Bad Request
```json
{
  "error": "Error message describing the issue"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to complete operation",
  "details": "Optional error details"
}
```

## Payment Endpoint

**POST** `/api/payment`

Processes payments using Square's Payment API.

#### Request Body
```json
{
  "locationId": "string",
  "sourceId": "string"
}
```

#### Response
Returns the Square payment result object on success.

#### Error Response
```json
{
  "success": false,
  "error": "string",
  "details": "object | null"
}
```

## Tribute Table Endpoint

**POST** `/api/tribute-table`

Creates a new tribute entry.

#### Request Body
```json
{
  "user_id": "string",
  "loved_one_name": "string",
  "slug": "string"
}
```

#### Headers
- `Authorization`: Bearer token required

#### Response
Returns the created tribute entry data from WordPress.

#### Error Responses
- 400: Missing required fields
- 401: Authentication required
- 500: Internal Server Error

## Notes

1. All endpoints require a valid JWT token obtained through the auth endpoint, except for the auth endpoint itself.
2. Admin endpoints require the user to have admin privileges in addition to a valid JWT token.
3. Pagination is available for list endpoints with default values of page=1 and per_page=10.
4. Search functionality is provided for both users and tributes endpoints.
5. The API integrates with WordPress backend, proxying requests to the WordPress REST API.
