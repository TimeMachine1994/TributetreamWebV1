
# plugin-endpoints.md

## Overview

This document describes the endpoints provided by the **A6 Tributestream (Refactored)** WordPress plugin. All routes are defined under the `tributestream/v1` namespace, so each endpoint is prefixed by:

/wp-json/tributestream/v1/

Some endpoints are publicly accessible (no authentication required), while others require a **JWT Bearer Token** in the `Authorization` header (e.g. `Authorization: Bearer <your-jwt-token>`). Token validation is performed by calling the route `/jwt-auth/v1/token/validate`.

Below is a comprehensive breakdown of each endpoint, including the HTTP method, URL, expected parameters (inputs), example request/response, and notes on authentication.

---

## Table of Contents

1. [GET /getRole](#1-get-getrole)
2. [GET /tributes](#2-get-tributes)
3. [POST /tributes](#3-post-tributes)
4. [GET /tributes/{id}](#4-get-tributesid)
5. [PUT /tributes/{id}](#5-put-tributesid)
6. [DELETE /tributes/{id}](#6-delete-tributesid)
7. [POST /tribute](#7-post-tribute)
8. [GET /tribute/{slug}](#8-get-tributeslug)
9. [POST /user-meta](#9-post-user-meta)
10. [GET /user-meta/{user_id}](#10-get-user-metauser_id)
11. [POST /register](#11-post-register)

---

## 1. GET /getRole

**Endpoint**:  
GET /wp-json/tributestream/v1/getRole

**Query Parameters**:
- `id` *(integer, required)* — The user ID for which to fetch roles.

**Authentication**:
- No authentication required by default. (Permission callback returns `true`.)

**Example Request**:
```bash
curl -X GET "https://example.com/wp-json/tributestream/v1/getRole?id=123"
Example Successful Response (HTTP 200):
{
  "user_id": 123,
  "roles": [
    "subscriber"
  ]
}
Error Response (HTTP 404 if the user is not found):
{
  "code": "user_not_found",
  "message": "No user found for the specified ID.",
  "data": {
    "status": 404
  }
}

2. GET /tributes
Retrieve all tributes in a paginated format from the custom tributes table.
Endpoint:
GET /wp-json/tributestream/v1/tributes
Query Parameters (all optional except as noted below):
page (integer, default = 1) — Which page of results to fetch.
per_page (integer, default = 10) — How many items to return per page.
search (string) — Search for a keyword in certain fields (like title or description).
Authentication:
No authentication required ('permission_callback' => '__return_true').
Example Request:
curl -X GET "https://example.com/wp-json/tributestream/v1/tributes?page=2&per_page=5"
Example Successful Response (HTTP 200):
{
  "tributes": [
    {
      "id": 23,
      "user_id": "123",
      "loved_one_name": "Jane Doe",
      "slug": "jane-doe-tribute",
      "custom_html": "<p>Memorial for Jane</p>",
      "phone_number": "123-456-7890",
      "number_of_streams": "2",
      "created_at": "2024-12-01 12:00:00",
      "updated_at": "2024-12-01 12:00:00"
    },
    {
      "...": "..."
    }
  ],
  "total_pages": 5
}

3. POST /tributes
Create a new tribute record in the custom wp_tributes table.
Endpoint:
POST /wp-json/tributestream/v1/tributes
Request Body (JSON):
user_id (integer, required)
loved_one_name (string, required)
slug (string, required)
custom_html (string, optional)
phone_number (string, required)
number_of_streams (integer, optional)
Authentication:
No authentication required ('permission_callback' => '__return_true').
Example Request:
curl -X POST "https://example.com/wp-json/tributestream/v1/tributes" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 456,
    "loved_one_name": "Bob Doe",
    "slug": "bob-doe-tribute",
    "custom_html": "<h2>Bob's Memorial</h2>",
    "phone_number": "987-654-3210",
    "number_of_streams": 3
  }'
Example Successful Response (HTTP 200):
{
  "success": true,
  "id": 45
}
Error Response (HTTP 500 on insert failure):
{
  "code": "db_insert_error",
  "message": "Failed to insert data",
  "data": {
    "status": 500
  }
}

4. GET /tributes/{id}
Retrieve a single tribute by its numeric ID.
Endpoint:
GET /wp-json/tributestream/v1/tributes/{id}
Route Parameters:
{id} (integer, required) — ID of the tribute to fetch.
Authentication:
No authentication required.
Example Request:
curl -X GET "https://example.com/wp-json/tributestream/v1/tributes/45"
Example Successful Response (HTTP 200):
{
  "id": 45,
  "user_id": "456",
  "loved_one_name": "Bob Doe",
  "slug": "bob-doe-tribute",
  "custom_html": "<h2>Bob's Memorial</h2>",
  "phone_number": "987-654-3210",
  "number_of_streams": "3",
  "created_at": "2024-12-02 08:00:00",
  "updated_at": "2024-12-02 08:00:00"
}
Error Response (HTTP 404 if not found):
{
  "code": "not_found",
  "message": "Tribute not found",
  "data": {
    "status": 404
  }
}

5. PUT /tributes/{id}
Update a tribute record by its numeric ID.
Endpoint:
PUT /wp-json/tributestream/v1/tributes/{id}
Route Parameters:
{id} (integer, required) — ID of the tribute to update.
Request Body (JSON):
loved_one_name (string, optional)
slug (string, optional)
custom_html (string, optional)
phone_number (string, optional)
number_of_streams (integer, optional)
Only the fields provided in the request body will be updated. Unprovided fields remain unchanged.
Authentication:
No authentication required.
Example Request:
curl -X PUT "https://example.com/wp-json/tributestream/v1/tributes/45" \
  -H "Content-Type: application/json" \
  -d '{
    "loved_one_name": "Bob A. Doe",
    "phone_number": "555-555-5555"
  }'
Example Successful Response (HTTP 200):
{
  "success": true,
  "updated_rows": 1
}
updated_rows returns the number of database rows that were updated.
Error Responses:
HTTP 400 if no valid fields are provided:
{
  "code": "no_update",
  "message": "No valid fields to update",
  "data": {
    "status": 400
  }
}
HTTP 500 if a database error occurs.

6. DELETE /tributes/{id}
Delete a single tribute record by its numeric ID.
Endpoint:
DELETE /wp-json/tributestream/v1/tributes/{id}
Route Parameters:
{id} (integer, required) — ID of the tribute to remove.
Authentication:
No authentication required.
Example Request:
curl -X DELETE "https://example.com/wp-json/tributestream/v1/tributes/45"
Example Successful Response (HTTP 200):
{
  "success": true,
  "deleted_rows": 1
}
Error Response (HTTP 500 if the delete fails):
{
  "code": "db_delete_error",
  "message": "Failed to delete data",
  "data": {
    "status": 500
  }
}

7. POST /tribute
Create a new tribute in the custom table (same idea as POST /tributes, but requires a valid JWT token).
Endpoint:
POST /wp-json/tributestream/v1/tribute
Request Body (JSON):
user_id (integer, required)
loved_one_name (string, required)
slug (string, required)
Additional fields (if desired) can be included, but the plugin primarily handles the above.
Authentication:
JWT token is required. Must include the Authorization: Bearer <token> header.
Example Request:
curl -X POST "https://example.com/wp-json/tributestream/v1/tribute" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "user_id": 123,
    "loved_one_name": "John Doe",
    "slug": "john-doe-tribute"
  }'
Example Successful Response (HTTP 201):
{
  "message": "Tribute created successfully",
  "id": 99
}
Error Responses:
HTTP 403 if the JWT token is missing or invalid:
{
  "code": "jwt_auth_no_auth_header",
  "message": "Authorization header not found or invalid.",
  "data": {
    "status": 403
  }
}
HTTP 400 if required fields are missing:
{
  "code": "missing_fields",
  "message": "Required fields (user_id, loved_one_name, slug) are missing or empty.",
  "data": {
    "status": 400
  }
}
HTTP 500 if the database insert fails.

8. GET /tribute/{slug}
Retrieve a single tribute record by its slug.
Endpoint:
GET /wp-json/tributestream/v1/tribute/{slug}
Route Parameters:
{slug} (string, required) — The slug that identifies the tribute.
Authentication:
No authentication required (__return_true).
Example Request:
curl -X GET "https://example.com/wp-json/tributestream/v1/tribute/john-doe-tribute"
Example Successful Response (HTTP 200):
{
  "id": 99,
  "user_id": "123",
  "loved_one_name": "John Doe",
  "slug": "john-doe-tribute",
  "created_at": "2025-01-01 10:00:00",
  "updated_at": "2025-01-01 10:00:00"
}
Error Response (HTTP 404 if not found):
{
  "message": "Tribute not found"
}

9. POST /user-meta
Create or update user meta key-value data for a specified user in the wp_usermeta table.
Endpoint:
POST /wp-json/tributestream/v1/user-meta
Request Body (JSON):
user_id (integer, required)
meta_key (string, required)
meta_value (string, required)
Authentication:
JWT token is required. Must include the Authorization: Bearer <token> header.
Example Request:
curl -X POST "https://example.com/wp-json/tributestream/v1/user-meta" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "user_id": 123,
    "meta_key": "favorite_color",
    "meta_value": "blue"
  }'
Example Successful Response (HTTP 200):
{
  "success": true,
  "message": "User meta updated successfully.",
  "user_id": 123,
  "meta_key": "favorite_color",
  "meta_value": "blue"
}
Error Responses:
HTTP 403 if token missing/invalid.
HTTP 400 if required fields (user_id, meta_key) are missing.

10. GET /user-meta/{user_id}
Retrieve all meta keys and values for the specified user from wp_usermeta.
Endpoint:
GET /wp-json/tributestream/v1/user-meta/{user_id}
Route Parameters:
{user_id} (integer, required) — The user ID whose meta data you want.
Authentication:
JWT token is required. Must include the Authorization: Bearer <token> header.
Example Request:
curl -X GET "https://example.com/wp-json/tributestream/v1/user-meta/123" \
  -H "Authorization: Bearer <your-jwt-token>"
Example Successful Response (HTTP 200):
{
  "success": true,
  "user_id": 123,
  "meta": [
    {
      "meta_key": "favorite_color",
      "meta_value": "blue"
    },
    {
      "meta_key": "last_login",
      "meta_value": "2025-01-01 09:00:00"
    }
  ]
}
Error Responses:
HTTP 403 if token is missing/invalid.
HTTP 404 if the user is not found or if there is no meta data.

11. POST /register
Register a new WordPress user (plus optional user meta). Also sends a welcome email.
Endpoint:
POST /wp-json/tributestream/v1/register
Request Body (JSON):
username (string, required)
email (string, required)
password (string, required)
meta (object, optional) — A map of meta key-value pairs.
Authentication:
No authentication required (__return_true).
Example Request:
curl -X POST "https://example.com/wp-json/tributestream/v1/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "secret123",
    "meta": {
      "phone": "555-123-4567",
      "full_name": "New User"
    }
  }'
Example Successful Response (HTTP 201):
{
  "user_id": 777
}
Error Response (HTTP 400 if registration fails, e.g. username exists):
{
  "code": "registration_failed",
  "message": "Username already exists",
  "data": {
    "status": 400
  }
}

JWT Authentication
Several routes above require a valid JWT for access. Make sure to include the header:
Authorization: Bearer <token>
The token can be obtained from your chosen JWT plugin endpoint (commonly /wp-json/jwt-auth/v1/token), and is validated by this plugin by calling /wp-json/jwt-auth/v1/token/validate.
If the JWT token is invalid or missing, you will receive an HTTP 403 error with a message like Token validation failed.

Summary
This plugin provides a comprehensive REST API for:
Managing tributes (CRUD via /tributes/ + additional single-tribute endpoints).
Handling user meta in wp_usermeta.
Registering new WordPress users (with meta).
Fetching user roles.
Authenticating via JWT tokens where indicated.
Ensure you have the JWT plugin installed and active if you intend to use the secured endpoints. The routes that require JWT have their permission_callback set to either verify_jwt_cookie or custom_jwt_authenticate.
