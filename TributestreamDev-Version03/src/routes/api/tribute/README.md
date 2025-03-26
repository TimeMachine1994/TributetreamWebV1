# Tributestream API Documentation

This document provides comprehensive information about the Tributestream API endpoints, their functionality, required parameters, and expected responses.

## Authentication

All API endpoints require authentication. Authentication is handled via JWT tokens stored in cookies.

### Authentication Methods

- JWT Token: Stored in cookies as `jwt`
- All requests must include this cookie, or they will receive a 401 Unauthorized response

## Common Response Formats

### Success Responses

Successful responses will return the requested data with appropriate HTTP status codes:
- `200 OK`: Request was successful
- `201 Created`: Resource was successfully created

### Error Responses

Error responses follow this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

Common error status codes:
- `400 Bad Request`: Missing or invalid parameters
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## API Endpoints

### Tribute Pages

#### Get All Tribute Pages
- **URL**: `/api/tribute`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Retrieves all tribute pages
- **Response**: Array of tribute page objects

#### Get Tribute Page by ID
- **URL**: `/api/tribute/[id]`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the tribute page
- **Description**: Retrieves a specific tribute page
- **Response**: Tribute page object
- **Error Responses**: 404 if tribute page not found

#### Create Tribute Page
- **URL**: `/api/tribute`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "created_by_user_id": 123,
    "point_of_contact_user_id": 456,
    "loved_ones_name": "John Doe",
    "page_html": "<div>Tribute content</div>",
    "loved_ones_dob": "1950-01-01", // Optional
    "loved_ones_dod": "2023-01-01"  // Optional
  }
  ```
- **Description**: Creates a new tribute page
- **Response**: Newly created tribute page object

#### Update Tribute Page
- **URL**: `/api/tribute/[id]`
- **Method**: `PUT`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the tribute page
- **Request Body**: Same as create, but all fields are optional
- **Description**: Updates an existing tribute page
- **Response**: Updated tribute page object
- **Error Responses**: 404 if tribute page not found

#### Delete Tribute Page
- **URL**: `/api/tribute/[id]`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the tribute page
- **Description**: Deletes a tribute page
- **Response**: Success message
- **Error Responses**: 404 if tribute page not found

### Funeral Homes

#### Get All Funeral Homes
- **URL**: `/api/tribute/funeral-homes`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Retrieves all funeral homes
- **Response**: Array of funeral home objects

#### Get Funeral Home by ID
- **URL**: `/api/tribute/funeral-homes/[id]`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the funeral home
- **Description**: Retrieves a specific funeral home
- **Response**: Funeral home object
- **Error Responses**: 404 if funeral home not found

#### Create Funeral Home
- **URL**: `/api/tribute/funeral-homes`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "created_by_user_id": 123,
    "fh_name": "Example Funeral Home",
    "fh_address": "123 Main St, City, State, ZIP",
    "fh_phone_number": "555-123-4567"
  }
  ```
- **Description**: Creates a new funeral home
- **Response**: Newly created funeral home object

#### Update Funeral Home
- **URL**: `/api/tribute/funeral-homes/[id]`
- **Method**: `PUT`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the funeral home
- **Request Body**: Same as create, but all fields are optional
- **Description**: Updates an existing funeral home
- **Response**: Updated funeral home object
- **Error Responses**: 404 if funeral home not found

#### Delete Funeral Home
- **URL**: `/api/tribute/funeral-homes/[id]`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the funeral home
- **Description**: Deletes a funeral home
- **Response**: Success message
- **Error Responses**: 404 if funeral home not found

### Locations

#### Get All Locations
- **URL**: `/api/tribute/locations`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Retrieves all locations
- **Response**: Array of location objects

#### Get Location by ID
- **URL**: `/api/tribute/locations/[id]`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the location
- **Description**: Retrieves a specific location
- **Response**: Location object
- **Error Responses**: 404 if location not found

#### Create Location
- **URL**: `/api/tribute/locations`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "tribute_id": 123,
    "location_name": "Example Location",
    "sort_order": 1,
    "location_address": "123 Main St, City, State, ZIP"
  }
  ```
- **Description**: Creates a new location
- **Response**: Newly created location object

#### Update Location
- **URL**: `/api/tribute/locations/[id]`
- **Method**: `PUT`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the location
- **Request Body**: Same as create, but all fields are optional
- **Description**: Updates an existing location
- **Response**: Updated location object
- **Error Responses**: 404 if location not found

#### Delete Location
- **URL**: `/api/tribute/locations/[id]`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the location
- **Description**: Deletes a location
- **Response**: Success message
- **Error Responses**: 404 if location not found

### Events

#### Get All Events
- **URL**: `/api/tribute/events`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Retrieves all events
- **Response**: Array of event objects

#### Get Event by ID
- **URL**: `/api/tribute/events/[id]`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the event
- **Description**: Retrieves a specific event
- **Response**: Event object
- **Error Responses**: 404 if event not found

#### Create Event
- **URL**: `/api/tribute/events`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "location_id": 123,
    "stream_html": "<div>Stream content</div>",
    "start_time": "2023-01-01T10:00:00", // Optional
    "end_time": "2023-01-01T12:00:00"    // Optional
  }
  ```
- **Description**: Creates a new event
- **Response**: Newly created event object

#### Update Event
- **URL**: `/api/tribute/events/[id]`
- **Method**: `PUT`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the event
- **Request Body**: Same as create, but all fields are optional
- **Description**: Updates an existing event
- **Response**: Updated event object
- **Error Responses**: 404 if event not found

#### Delete Event
- **URL**: `/api/tribute/events/[id]`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the event
- **Description**: Deletes an event
- **Response**: Success message
- **Error Responses**: 404 if event not found

### Schedules

#### Get All Schedules
- **URL**: `/api/tribute/schedules`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Retrieves all schedules
- **Response**: Array of schedule objects

#### Get Schedule by ID
- **URL**: `/api/tribute/schedules/[id]`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the schedule
- **Description**: Retrieves a specific schedule
- **Response**: Schedule object
- **Error Responses**: 404 if schedule not found

#### Create Schedule
- **URL**: `/api/tribute/schedules`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "funeral_director_user_id": 123,
    "funeral_home_id": 456,
    "number_of_days": 3,
    "tribute_id": 789
  }
  ```
- **Description**: Creates a new schedule
- **Response**: Newly created schedule object

#### Update Schedule
- **URL**: `/api/tribute/schedules/[id]`
- **Method**: `PUT`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the schedule
- **Request Body**: Same as create, but all fields are optional
- **Description**: Updates an existing schedule
- **Response**: Updated schedule object
- **Error Responses**: 404 if schedule not found

#### Delete Schedule
- **URL**: `/api/tribute/schedules/[id]`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**: `id` - The ID of the schedule
- **Description**: Deletes a schedule
- **Response**: Success message
- **Error Responses**: 404 if schedule not found

## Best Practices

### Error Handling

- Always check for error responses and handle them appropriately
- Implement retry logic for network failures
- Validate input data before sending requests

### Validation

- Ensure all required fields are provided
- Validate data types and formats before submitting
- Handle validation errors gracefully on the client side

### Security

- Never expose JWT tokens in client-side code
- Use HTTPS for all API requests
- Implement proper CORS policies
- Validate and sanitize all user inputs

## Integration Examples

### JavaScript Example

```javascript
// Example: Fetching all tribute pages
async function getAllTributePages() {
  try {
    const response = await fetch('/api/tribute', {
      method: 'GET',
      credentials: 'include', // Important for sending cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch tribute pages');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching tribute pages:', error);
    throw error;
  }
}

// Example: Creating a new tribute page
async function createTributePage(tributeData) {
  try {
    const response = await fetch('/api/tribute', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tributeData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create tribute page');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating tribute page:', error);
    throw error;
  }
}
```

### SvelteKit Example

```typescript
// Example: Using SvelteKit's load function to fetch a tribute page
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch, params }) => {
  try {
    const response = await fetch(`/api/tribute/${params.id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw error(response.status, errorData.error || 'Failed to load tribute page');
    }
    
    const tributePage = await response.json();
    return { tributePage };
  } catch (err) {
    console.error('Error loading tribute page:', err);
    throw err;
  }
};