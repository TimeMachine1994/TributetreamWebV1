# Tributestream Plugin Integration Plan

This document outlines the comprehensive plan for integrating the WordPress Tributestream Plugin with a SvelteKit frontend application.

## Overview

The Tributestream Plugin is a WordPress plugin that manages data related to funeral homes, tribute pages, locations, events, and schedules. This integration plan details how to create SvelteKit API endpoints that communicate with the WordPress REST API to provide a seamless experience for users.

## Database Schema

The WordPress plugin creates the following tables:

1. **tributestream_funeral_homes**
   - `funeral_home_id` (Primary Key)
   - `created_by_user_id` (Foreign Key to WordPress users)
   - `fh_name`
   - `fh_address`
   - `fh_phone_number`

2. **tributestream_tribute_pages**
   - `tribute_id` (Primary Key)
   - `created_by_user_id` (Foreign Key to WordPress users)
   - `point_of_contact_user_id` (Foreign Key to WordPress users)
   - `loved_ones_name`
   - `slugified_name`
   - `page_html`
   - `loved_ones_dob` (nullable)
   - `loved_ones_dod` (nullable)

3. **tributestream_locations**
   - `location_id` (Primary Key)
   - `tribute_id` (Foreign Key to tribute_pages)
   - `location_name`
   - `sort_order`
   - `location_address`

4. **tributestream_events**
   - `event_id` (Primary Key)
   - `location_id` (Foreign Key to locations)
   - `stream_html`
   - `start_time` (nullable)
   - `end_time` (nullable)

5. **tributestream_schedules**
   - `schedule_id` (Primary Key)
   - `funeral_director_user_id` (Foreign Key to WordPress users)
   - `funeral_home_id` (Foreign Key to funeral_homes)
   - `number_of_days`
   - `tribute_id` (Foreign Key to tribute_pages)

## WordPress REST API Endpoints

The WordPress plugin exposes the following REST API endpoints:

### Funeral Homes
- `GET /tributestream/v1/funeral-homes` - Get all funeral homes
- `GET /tributestream/v1/funeral-homes/{id}` - Get a specific funeral home
- `POST /tributestream/v1/funeral-homes` - Create a new funeral home
- `PUT /tributestream/v1/funeral-homes/{id}` - Update a funeral home
- `DELETE /tributestream/v1/funeral-homes/{id}` - Delete a funeral home

### Tribute Pages
- `GET /tributestream/v1/tribute-pages` - Get all tribute pages
- `GET /tributestream/v1/tribute-pages/{id}` - Get a specific tribute page
- `POST /tributestream/v1/tribute-pages` - Create a new tribute page
- `PUT /tributestream/v1/tribute-pages/{id}` - Update a tribute page
- `DELETE /tributestream/v1/tribute-pages/{id}` - Delete a tribute page

### Locations
- `GET /tributestream/v1/locations` - Get all locations
- `GET /tributestream/v1/locations/{id}` - Get a specific location
- `POST /tributestream/v1/locations` - Create a new location
- `PUT /tributestream/v1/locations/{id}` - Update a location
- `DELETE /tributestream/v1/locations/{id}` - Delete a location

### Events
- `GET /tributestream/v1/events` - Get all events
- `GET /tributestream/v1/events/{id}` - Get a specific event
- `POST /tributestream/v1/events` - Create a new event
- `PUT /tributestream/v1/events/{id}` - Update an event
- `DELETE /tributestream/v1/events/{id}` - Delete an event

### Schedules
- `GET /tributestream/v1/schedules` - Get all schedules
- `GET /tributestream/v1/schedules/{id}` - Get a specific schedule
- `POST /tributestream/v1/schedules` - Create a new schedule
- `PUT /tributestream/v1/schedules/{id}` - Update a schedule
- `DELETE /tributestream/v1/schedules/{id}` - Delete a schedule

## SvelteKit API Implementation

The SvelteKit API implementation provides a clean interface for the frontend to interact with the WordPress REST API. The implementation includes:

### Core Utility Files

1. **WordPress API Client** (`src/lib/api/wordpress.ts`)
   - Handles communication with the WordPress REST API
   - Manages authentication and error handling

2. **Error Handling** (`src/lib/api/errors.ts`)
   - Provides consistent error handling across the application
   - Formats error responses for the frontend

3. **Authentication** (`src/lib/api/auth.ts`)
   - Manages JWT authentication
   - Provides utility functions for checking authentication status

4. **Type Definitions** (`src/lib/types/tribute.ts`)
   - Defines TypeScript interfaces for all data models
   - Ensures type safety throughout the application

### API Endpoints

The SvelteKit API endpoints mirror the WordPress REST API endpoints but provide additional validation, error handling, and type safety:

#### Tribute Pages
- `GET /api/tribute` - Get all tribute pages
- `GET /api/tribute/[id]` - Get a specific tribute page
- `POST /api/tribute` - Create a new tribute page
- `PUT /api/tribute/[id]` - Update a tribute page
- `DELETE /api/tribute/[id]` - Delete a tribute page

#### Funeral Homes
- `GET /api/tribute/funeral-homes` - Get all funeral homes
- `GET /api/tribute/funeral-homes/[id]` - Get a specific funeral home
- `POST /api/tribute/funeral-homes` - Create a new funeral home
- `PUT /api/tribute/funeral-homes/[id]` - Update a funeral home
- `DELETE /api/tribute/funeral-homes/[id]` - Delete a funeral home

#### Locations
- `GET /api/tribute/locations` - Get all locations
- `GET /api/tribute/locations/[id]` - Get a specific location
- `POST /api/tribute/locations` - Create a new location
- `PUT /api/tribute/locations/[id]` - Update a location
- `DELETE /api/tribute/locations/[id]` - Delete a location

#### Events
- `GET /api/tribute/events` - Get all events
- `GET /api/tribute/events/[id]` - Get a specific event
- `POST /api/tribute/events` - Create a new event
- `PUT /api/tribute/events/[id]` - Update an event
- `DELETE /api/tribute/events/[id]` - Delete an event

#### Schedules
- `GET /api/tribute/schedules` - Get all schedules
- `GET /api/tribute/schedules/[id]` - Get a specific schedule
- `POST /api/tribute/schedules` - Create a new schedule
- `PUT /api/tribute/schedules/[id]` - Update a schedule
- `DELETE /api/tribute/schedules/[id]` - Delete a schedule

## Implementation Details

### Authentication Flow

1. User logs in through the WordPress authentication system
2. WordPress returns a JWT token
3. The token is stored in a cookie
4. All subsequent API requests include the cookie
5. The SvelteKit API validates the token before processing requests

### Error Handling

The API implements consistent error handling:

1. All errors are caught and formatted consistently
2. HTTP status codes are used appropriately
3. Error messages are clear and actionable
4. Validation errors include details about what went wrong

### Validation

Input validation is performed at multiple levels:

1. TypeScript interfaces ensure type safety
2. Required fields are checked before processing requests
3. Data formats are validated (e.g., dates, emails)
4. Foreign key relationships are validated

### Security Considerations

The implementation includes several security measures:

1. JWT authentication for all endpoints
2. Input sanitization to prevent XSS attacks
3. CSRF protection
4. Rate limiting to prevent abuse
5. Proper error handling to avoid information leakage

## Frontend Integration

The SvelteKit frontend can integrate with these API endpoints using:

1. SvelteKit's `load` functions for server-side rendering
2. Client-side fetch for dynamic updates
3. Form actions for form submissions

Example of a `load` function:

```typescript
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
```

## Best Practices

### Code Organization

- Keep related functionality together
- Use consistent naming conventions
- Document code thoroughly
- Write unit tests for critical functionality

### Performance Optimization

- Use server-side rendering for initial page loads
- Implement client-side caching for frequently accessed data
- Optimize database queries
- Use pagination for large data sets

### Maintainability

- Follow SvelteKit conventions
- Use TypeScript for type safety
- Document API endpoints thoroughly
- Implement comprehensive error handling

## Deployment Considerations

### WordPress Configuration

- Ensure WordPress is configured to accept JWT authentication
- Configure CORS to allow requests from the SvelteKit frontend
- Set up proper security headers

### SvelteKit Configuration

- Configure environment variables for WordPress API URL
- Set up proper CORS handling
- Implement rate limiting
- Configure proper caching headers

## Conclusion

This integration plan provides a comprehensive approach to connecting a SvelteKit frontend with a WordPress backend using the Tributestream Plugin. By following this plan, developers can create a robust, type-safe, and maintainable application that provides a seamless experience for users.

The implementation leverages the strengths of both WordPress (content management, user authentication) and SvelteKit (performance, developer experience, type safety) to create a modern web application.
