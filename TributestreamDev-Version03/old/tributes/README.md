# Tribute Management API Documentation

This directory contains the REST API endpoints for managing tributes in the Tributestream application. These endpoints act as proxies to our WordPress backend API.

## Available Endpoints

### 1. List and Create Tributes

**Endpoint:** `/api/tributes`

#### GET - Retrieve Tributes

Retrieves a paginated list of tributes.

**Query Parameters:**
- `page` (optional, default: 1) - Page number for pagination
- `per_page` (optional, default: 10) - Number of items per page
- `search` (optional) - Search term for filtering tributes

**Example Request:**
```http
GET /api/tributes?page=1&per_page=10&search=John
```

**Example Response:**
```json
{
  "tributes": [
    {
      "id": 123,
      "user_id": 456,
      "loved_one_name": "John Doe",
      "slug": "john_doe",
      "created_at": "2023-03-15T12:00:00Z",
      "updated_at": "2023-03-16T15:30:00Z",
      "custom_html": "<p>Celebrating John's life...</p>",
      "phone_number": "+1234567890",
      "number_of_streams": 10
    },
    // More tributes...
  ],
  "total_pages": 5,
  "total_items": 45,
  "current_page": 1
}
```

#### POST - Create a Tribute

Creates a new tribute.

**Authentication Required:** Yes (JWT token in Authorization header)

**Request Body:**
```json
{
  "user_id": 456,
  "loved_one_name": "Jane Smith",
  "slug": "jane_smith",
  "phone_number": "+1234567890",
  "custom_html": "<p>In memory of Jane...</p>",
  "number_of_streams": 0,
  "extended_data": {
    "memorial_details": {
      "location": "Memorial Park",
      "date": "2023-04-01"
    }
  }
}
```

**Required Fields:**
- `user_id` - WordPress user ID
- `loved_one_name` - Name of the deceased
- `phone_number` - Contact phone number

**Example Response:**
```json
{
  "success": true,
  "id": 789,
  "slug": "jane_smith"
}
```

### 2. Get Tribute by ID

**Endpoint:** `/api/tributes/[id]`

#### GET - Retrieve a Single Tribute by ID

**Authentication:** Optional (provides more data when authenticated)

**Example Request:**
```http
GET /api/tributes/123
```

**Example Response:**
```json
{
  "id": 123,
  "user_id": 456,
  "loved_one_name": "John Doe",
  "slug": "john_doe",
  "created_at": "2023-03-15T12:00:00Z",
  "updated_at": "2023-03-16T15:30:00Z",
  "custom_html": "<p>Celebrating John's life...</p>",
  "phone_number": "+1234567890",
  "number_of_streams": 10
}
```

### 3. Get Tribute by Slug

**Endpoint:** `/api/tributes/by-slug/[slug]`

#### GET - Retrieve a Single Tribute by Slug

**Authentication:** Not required (public endpoint)

**Example Request:**
```http
GET /api/tributes/by-slug/john_doe
```

**Example Response:**
```json
{
  "id": 123,
  "user_id": 456,
  "loved_one_name": "John Doe",
  "slug": "john_doe",
  "created_at": "2023-03-15T12:00:00Z",
  "updated_at": "2023-03-16T15:30:00Z",
  "custom_html": "<p>Celebrating John's life...</p>",
  "phone_number": "+1234567890",
  "number_of_streams": 10
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": true,
  "message": "Error message goes here",
  "status": 400
}
```

Common status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (tribute doesn't exist)
- `500` - Internal Server Error (unexpected errors)

## Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

To obtain a JWT token, use the `/api/auth` endpoint with valid credentials.

## Integration with Frontend

Example of using these endpoints from SvelteKit components:

```typescript
// Fetching tributes
async function fetchTributes() {
  const response = await fetch('/api/tributes?page=1&per_page=10');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch tributes');
  }
  return await response.json();
}

// Creating a tribute
async function createTribute(data, token) {
  const response = await fetch('/api/tributes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create tribute');
  }
  
  return await response.json();
}