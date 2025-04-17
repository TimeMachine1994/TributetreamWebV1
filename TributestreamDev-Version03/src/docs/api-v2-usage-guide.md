# API v2 Usage Guide

This guide provides comprehensive documentation for the Tributestream API v2 endpoints, including authentication, request/response formats, and examples for all endpoints.

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Error Handling](#error-handling)
4. [User Management Endpoints](#user-management-endpoints)
5. [Tribute Management Endpoints](#tribute-management-endpoints)
6. [Location Management Endpoints](#location-management-endpoints)
7. [Event Management Endpoints](#event-management-endpoints)

## Authentication

All API endpoints (except public endpoints) require authentication using JWT tokens. Authentication is handled through cookies or Authorization headers.

### Cookie Authentication

The API uses the following cookies for authentication:
- `jwt_token`: Contains the JWT token
- `user`: Contains the user information

### Header Authentication

Alternatively, you can use the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### Login

```
POST /api/v2/auth/login
```

Request:
```json
{
  "username": "user@example.com",
  "password": "password123",
  "remember_me": true
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "user",
      "email": "user@example.com",
      "name": "User Name",
      "roles": ["subscriber"],
      "capabilities": {},
      "user_type": "user"
    }
  }
}
```

#### Logout

```
POST /api/v2/auth/logout
```

Response:
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data specific to the endpoint
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

For error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "status": 400,
    "details": {
      // Optional error details
    }
  }
}
```

## Error Handling

The API uses standard HTTP status codes and provides detailed error messages.

Common error codes:

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | BAD_REQUEST | Invalid request parameters |
| 400 | VALIDATION_ERROR | Request validation failed |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

## User Management Endpoints

### List Users

```
GET /api/v2/users
```

Query Parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)
- `search`: Search term
- `sort_by`: Field to sort by (default: registered_date)
- `sort_order`: Sort order (asc or desc, default: desc)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "name": "Admin User",
      "display_name": "Admin User",
      "first_name": "Admin",
      "last_name": "User",
      "roles": ["administrator"],
      "capabilities": {
        "manage_options": true
      },
      "user_type": "admin",
      "registered_date": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "username": "user",
      "email": "user@example.com",
      "name": "Regular User",
      "display_name": "Regular User",
      "first_name": "Regular",
      "last_name": "User",
      "roles": ["subscriber"],
      "capabilities": {},
      "user_type": "user",
      "registered_date": "2023-01-02T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "total": 2,
      "page": 1,
      "per_page": 10,
      "total_pages": 1
    }
  }
}
```

### Get User by ID

```
GET /api/v2/users/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "name": "Admin User",
    "display_name": "Admin User",
    "first_name": "Admin",
    "last_name": "User",
    "roles": ["administrator"],
    "capabilities": {
      "manage_options": true
    },
    "user_type": "admin",
    "registered_date": "2023-01-01T00:00:00.000Z"
  }
}
```

### Create User

```
POST /api/v2/users
```

Request:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "first_name": "New",
  "last_name": "User",
  "user_type": "user"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "username": "newuser",
    "email": "newuser@example.com",
    "name": "New User",
    "display_name": "New User",
    "first_name": "New",
    "last_name": "User",
    "roles": ["subscriber"],
    "capabilities": {},
    "user_type": "user",
    "registered_date": "2023-01-03T00:00:00.000Z"
  },
  "meta": {
    "message": "User created successfully"
  }
}
```

### Update User

```
PUT /api/v2/users/:id
```

Request:
```json
{
  "email": "updated@example.com",
  "name": "Updated User",
  "first_name": "Updated",
  "last_name": "User"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "username": "newuser",
    "email": "updated@example.com",
    "name": "Updated User",
    "display_name": "Updated User",
    "first_name": "Updated",
    "last_name": "User",
    "roles": ["subscriber"],
    "capabilities": {},
    "user_type": "user",
    "registered_date": "2023-01-03T00:00:00.000Z"
  },
  "meta": {
    "message": "User updated successfully"
  }
}
```

### Delete User

```
DELETE /api/v2/users/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 3
  },
  "meta": {
    "message": "User deleted successfully"
  }
}
```

## Tribute Management Endpoints

### List Tributes

```
GET /api/v2/tributes
```

Query Parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)
- `search`: Search term
- `user_id`: Filter by user ID
- `sort_by`: Field to sort by (default: created_at)
- `sort_order`: Sort order (asc or desc, default: desc)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "loved_ones_name": "John Doe",
      "slug": "john-doe",
      "user_id": 2,
      "status": "published",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "loved_ones_name": "Jane Smith",
      "slug": "jane-smith",
      "user_id": 2,
      "status": "draft",
      "created_at": "2023-01-02T00:00:00.000Z",
      "updated_at": "2023-01-02T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "total": 2,
      "page": 1,
      "per_page": 10,
      "total_pages": 1
    }
  }
}
```

### Get Tribute by ID

```
GET /api/v2/tributes/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "loved_ones_name": "John Doe",
    "slug": "john-doe",
    "user_id": 2,
    "status": "published",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "details": {
      "birth_date": "1950-01-01",
      "death_date": "2022-12-31",
      "obituary": "John Doe was a beloved father and husband...",
      "photos": [
        {
          "id": 1,
          "url": "https://example.com/photos/1.jpg",
          "caption": "John at the beach"
        }
      ]
    }
  }
}
```

### Get Tribute by Slug

```
GET /api/v2/tributes/by-slug/:slug
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "loved_ones_name": "John Doe",
    "slug": "john-doe",
    "user_id": 2,
    "status": "published",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "details": {
      "birth_date": "1950-01-01",
      "death_date": "2022-12-31",
      "obituary": "John Doe was a beloved father and husband...",
      "photos": [
        {
          "id": 1,
          "url": "https://example.com/photos/1.jpg",
          "caption": "John at the beach"
        }
      ]
    }
  }
}
```

### Create Tribute

```
POST /api/v2/tributes
```

Request:
```json
{
  "loved_ones_name": "Robert Johnson",
  "status": "draft",
  "details": {
    "birth_date": "1960-05-15",
    "death_date": "2023-01-10",
    "obituary": "Robert Johnson was a beloved father and husband..."
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "loved_ones_name": "Robert Johnson",
    "slug": "robert-johnson",
    "user_id": 2,
    "status": "draft",
    "created_at": "2023-01-03T00:00:00.000Z",
    "updated_at": "2023-01-03T00:00:00.000Z",
    "details": {
      "birth_date": "1960-05-15",
      "death_date": "2023-01-10",
      "obituary": "Robert Johnson was a beloved father and husband..."
    }
  },
  "meta": {
    "message": "Tribute created successfully"
  }
}
```

### Update Tribute

```
PUT /api/v2/tributes/:id
```

Request:
```json
{
  "loved_ones_name": "Robert J. Johnson",
  "status": "published",
  "details": {
    "birth_date": "1960-05-15",
    "death_date": "2023-01-10",
    "obituary": "Robert J. Johnson was a beloved father and husband..."
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "loved_ones_name": "Robert J. Johnson",
    "slug": "robert-j-johnson",
    "user_id": 2,
    "status": "published",
    "created_at": "2023-01-03T00:00:00.000Z",
    "updated_at": "2023-01-03T12:00:00.000Z",
    "details": {
      "birth_date": "1960-05-15",
      "death_date": "2023-01-10",
      "obituary": "Robert J. Johnson was a beloved father and husband..."
    }
  },
  "meta": {
    "message": "Tribute updated successfully"
  }
}
```

### Delete Tribute

```
DELETE /api/v2/tributes/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 3
  },
  "meta": {
    "message": "Tribute deleted successfully"
  }
}
```

## Location Management Endpoints

### List Locations

```
GET /api/v2/locations
```

Query Parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)
- `tribute_id`: Filter by tribute ID
- `sort_by`: Field to sort by (default: created_at)
- `sort_order`: Sort order (asc or desc, default: desc)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tribute_id": 1,
      "location_name": "Memorial Park",
      "location_address": "123 Main St, Anytown, USA",
      "location_type": "cemetery",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "tribute_id": 1,
      "location_name": "City Funeral Home",
      "location_address": "456 Oak St, Anytown, USA",
      "location_type": "funeral_home",
      "created_at": "2023-01-02T00:00:00.000Z",
      "updated_at": "2023-01-02T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "total": 2,
      "page": 1,
      "per_page": 10,
      "total_pages": 1
    }
  }
}
```

### Get Location by ID

```
GET /api/v2/locations/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tribute_id": 1,
    "location_name": "Memorial Park",
    "location_address": "123 Main St, Anytown, USA",
    "location_type": "cemetery",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "details": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "phone": "555-123-4567",
      "website": "https://example.com/memorial-park"
    }
  }
}
```

### Get Locations by Tribute

```
GET /api/v2/tributes/:id/locations
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tribute_id": 1,
      "location_name": "Memorial Park",
      "location_address": "123 Main St, Anytown, USA",
      "location_type": "cemetery",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "tribute_id": 1,
      "location_name": "City Funeral Home",
      "location_address": "456 Oak St, Anytown, USA",
      "location_type": "funeral_home",
      "created_at": "2023-01-02T00:00:00.000Z",
      "updated_at": "2023-01-02T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "total": 2,
      "page": 1,
      "per_page": 10,
      "total_pages": 1
    }
  }
}
```

### Create Location

```
POST /api/v2/locations
```

Request:
```json
{
  "tribute_id": 1,
  "location_name": "Community Church",
  "location_address": "789 Pine St, Anytown, USA",
  "location_type": "church",
  "details": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "phone": "555-987-6543",
    "website": "https://example.com/community-church"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "tribute_id": 1,
    "location_name": "Community Church",
    "location_address": "789 Pine St, Anytown, USA",
    "location_type": "church",
    "created_at": "2023-01-03T00:00:00.000Z",
    "updated_at": "2023-01-03T00:00:00.000Z",
    "details": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "phone": "555-987-6543",
      "website": "https://example.com/community-church"
    }
  },
  "meta": {
    "message": "Location created successfully"
  }
}
```

### Update Location

```
PUT /api/v2/locations/:id
```

Request:
```json
{
  "location_name": "Community Church Center",
  "location_address": "789 Pine St, Anytown, USA",
  "details": {
    "phone": "555-987-6543",
    "website": "https://example.com/community-church-center"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "tribute_id": 1,
    "location_name": "Community Church Center",
    "location_address": "789 Pine St, Anytown, USA",
    "location_type": "church",
    "created_at": "2023-01-03T00:00:00.000Z",
    "updated_at": "2023-01-03T12:00:00.000Z",
    "details": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "phone": "555-987-6543",
      "website": "https://example.com/community-church-center"
    }
  },
  "meta": {
    "message": "Location updated successfully"
  }
}
```

### Delete Location

```
DELETE /api/v2/locations/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 3
  },
  "meta": {
    "message": "Location deleted successfully"
  }
}
```

## Event Management Endpoints

### List Events

```
GET /api/v2/events
```

Query Parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)
- `location_id`: Filter by location ID
- `tribute_id`: Filter by tribute ID
- `active`: Filter active events (true/false)
- `upcoming`: Filter upcoming events (true/false)
- `past`: Filter past events (true/false)
- `start_date`: Filter events starting after this date
- `end_date`: Filter events ending before this date
- `sort_by`: Field to sort by (default: start_time)
- `sort_order`: Sort order (asc or desc, default: asc)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "location_id": 2,
      "event_name": "Funeral Service",
      "start_time": "2023-01-15T10:00:00.000Z",
      "end_time": "2023-01-15T12:00:00.000Z",
      "status": "scheduled",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "location_id": 1,
      "event_name": "Burial Service",
      "start_time": "2023-01-15T14:00:00.000Z",
      "end_time": "2023-01-15T15:00:00.000Z",
      "status": "scheduled",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "total": 2,
      "page": 1,
      "per_page": 10,
      "total_pages": 1
    }
  }
}
```

### Get Event by ID

```
GET /api/v2/events/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "location_id": 2,
    "event_name": "Funeral Service",
    "start_time": "2023-01-15T10:00:00.000Z",
    "end_time": "2023-01-15T12:00:00.000Z",
    "status": "scheduled",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "details": {
      "description": "A service to celebrate the life of John Doe",
      "dress_code": "formal",
      "is_public": true
    },
    "location": {
      "id": 2,
      "tribute_id": 1,
      "location_name": "City Funeral Home",
      "location_address": "456 Oak St, Anytown, USA",
      "location_type": "funeral_home"
    }
  }
}
```

### Get Active Events

```
GET /api/v2/events/active
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "location_id": 2,
      "event_name": "Funeral Service",
      "start_time": "2023-01-15T10:00:00.000Z",
      "end_time": "2023-01-15T12:00:00.000Z",
      "status": "scheduled",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "location_id": 1,
      "event_name": "Burial Service",
      "start_time": "2023-01-15T14:00:00.000Z",
      "end_time": "2023-01-15T15:00:00.000Z",
      "status": "scheduled",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "total": 2,
      "page": 1,
      "per_page": 10,
      "total_pages": 1
    }
  }
}
```

### Get Events by Location

```
GET /api/v2/locations/:id/events
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "location_id": 2,
      "event_name": "Funeral Service",
      "start_time": "2023-01-15T10:00:00.000Z",
      "end_time": "2023-01-15T12:00:00.000Z",
      "status": "scheduled",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "total": 1,
      "page": 1,
      "per_page": 10,
      "total_pages": 1
    }
  }
}
```

### Get Events by Tribute

```
GET /api/v2/tributes/:id/events
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "location_id": 2,
      "event_name": "Funeral Service",
      "start_time": "2023-01-15T10:00:00.000Z",
      "end_time": "2023-01-15T12:00:00.000Z",
      "status": "scheduled",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "location_id": 1,
      "event_name": "Burial Service",
      "start_time": "2023-01-15T14:00:00.000Z",
      "end_time": "2023-01-15T15:00:00.000Z",
      "status": "scheduled",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "total": 2,
      "page": 1,
      "per_page": 10,
      "total_pages": 1
    }
  }
}
```

### Create Event

```
POST /api/v2/events
```

Request:
```json
{
  "location_id": 3,
  "event_name": "Memorial Service",
  "start_time": "2023-01-16T10:00:00.000Z",
  "end_time": "2023-01-16T12:00:00.000Z",
  "status": "scheduled",
  "details": {
    "description": "A memorial service to celebrate the life of John Doe",
    "dress_code": "business casual",
    "is_public": true
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "location_id": 3,
    "event_name": "Memorial Service",
    "start_time": "2023-01-16T10:00:00.000Z",
    "end_time": "2023-01-16T12:00:00.000Z",
    "status": "scheduled",
    "created_at": "2023-01-03T00:00:00.000Z",
    "updated_at": "2023-01-03T00:00:00.000Z",
    "details": {
      "description": "A memorial service to celebrate the life of John Doe",
      "dress_code": "business casual",
      "is_public": true
    }
  },
  "meta": {
    "message": "Event created successfully"
  }
}
```

### Update Event

```
PUT /api/v2/events/:id
```

Request:
```json
{
  "event_name": "Memorial Service and Reception",
  "start_time": "2023-01-16T10:00:00.000Z",
  "end_time": "2023-01-16T13:00:00.000Z",
  "details": {
    "description": "A memorial service and reception to celebrate the life of John Doe",
    "dress_code": "business casual",
    "is_public": true
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "location_id": 3,
    "event_name": "Memorial Service and Reception",
    "start_time": "2023-01-16T10:00:00.000Z",
    "end_time": "2023-01-16T13:00:00.000Z",
    "status": "scheduled",
    "created_at": "2023-01-03T00:00:00.000Z",
    "updated_at": "2023-01-03T12:00:00.000Z",
    "details": {
      "description": "A memorial service and reception to celebrate the life of John Doe",
      "dress_code": "business casual",
      "is_public": true
    }
  },
  "meta": {
    "message": "Event updated successfully"
  }
}
```

### Delete Event

```
DELETE /api/v2/events/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 3
  },
  "meta": {
    "message": "Event deleted successfully"
  }
}
