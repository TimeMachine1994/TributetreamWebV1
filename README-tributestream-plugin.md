# Tributestream Plugin SvelteKit Integration

This project implements a SvelteKit API layer that integrates with the WordPress Tributestream Plugin. It provides a type-safe, well-documented API for frontend applications to interact with the WordPress backend.

## Project Structure

```
TributestreamDev-Version03/
├── src/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── auth.ts           # Authentication utilities
│   │   │   ├── errors.ts         # Error handling utilities
│   │   │   └── wordpress.ts      # WordPress API client
│   │   └── types/
│   │       └── tribute.ts        # TypeScript interfaces for data models
│   └── routes/
│       └── api/
│           └── tribute/
│               ├── +server.ts                    # Tribute pages collection endpoint
│               ├── [id]/+server.ts               # Single tribute page endpoint
│               ├── funeral-homes/
│               │   ├── +server.ts                # Funeral homes collection endpoint
│               │   └── [id]/+server.ts           # Single funeral home endpoint
│               ├── locations/
│               │   ├── +server.ts                # Locations collection endpoint
│               │   └── [id]/+server.ts           # Single location endpoint
│               ├── events/
│               │   ├── +server.ts                # Events collection endpoint
│               │   └── [id]/+server.ts           # Single event endpoint
│               ├── schedules/
│               │   ├── +server.ts                # Schedules collection endpoint
│               │   └── [id]/+server.ts           # Single schedule endpoint
│               └── README.md                     # API documentation
```

## Features

- **Type-Safe API**: All data models are defined using TypeScript interfaces
- **Consistent Error Handling**: Centralized error handling for all API endpoints
- **Authentication**: JWT-based authentication with WordPress
- **Comprehensive Documentation**: Detailed API documentation with examples
- **RESTful Design**: Clean, RESTful API design following best practices

## API Endpoints

The API provides the following endpoints:

### Tribute Pages
- `GET /api/tribute` - Get all tribute pages
- `GET /api/tribute/[id]` - Get a specific tribute page
- `POST /api/tribute` - Create a new tribute page
- `PUT /api/tribute/[id]` - Update a tribute page
- `DELETE /api/tribute/[id]` - Delete a tribute page

### Funeral Homes
- `GET /api/tribute/funeral-homes` - Get all funeral homes
- `GET /api/tribute/funeral-homes/[id]` - Get a specific funeral home
- `POST /api/tribute/funeral-homes` - Create a new funeral home
- `PUT /api/tribute/funeral-homes/[id]` - Update a funeral home
- `DELETE /api/tribute/funeral-homes/[id]` - Delete a funeral home

### Locations
- `GET /api/tribute/locations` - Get all locations
- `GET /api/tribute/locations/[id]` - Get a specific location
- `POST /api/tribute/locations` - Create a new location
- `PUT /api/tribute/locations/[id]` - Update a location
- `DELETE /api/tribute/locations/[id]` - Delete a location

### Events
- `GET /api/tribute/events` - Get all events
- `GET /api/tribute/events/[id]` - Get a specific event
- `POST /api/tribute/events` - Create a new event
- `PUT /api/tribute/events/[id]` - Update an event
- `DELETE /api/tribute/events/[id]` - Delete an event

### Schedules
- `GET /api/tribute/schedules` - Get all schedules
- `GET /api/tribute/schedules/[id]` - Get a specific schedule
- `POST /api/tribute/schedules` - Create a new schedule
- `PUT /api/tribute/schedules/[id]` - Update a schedule
- `DELETE /api/tribute/schedules/[id]` - Delete a schedule

## Getting Started

1. Ensure you have a WordPress installation with the Tributestream Plugin activated
2. Configure the WordPress REST API to accept JWT authentication
3. Set the `VITE_WORDPRESS_API_URL` environment variable to point to your WordPress installation
4. Start the SvelteKit development server:

```bash
npm run dev
```

## Authentication

All API endpoints require authentication. The API uses JWT tokens stored in cookies for authentication. To authenticate:

1. Log in through the WordPress authentication system
2. Store the JWT token in a cookie named `jwt`
3. All subsequent API requests will include this cookie automatically

## Error Handling

The API provides consistent error handling:

- All errors return appropriate HTTP status codes
- Error responses include a descriptive message
- Validation errors include details about what went wrong

## Documentation

For detailed API documentation, see:

- [API Documentation](TributestreamDev-Version03/src/routes/api/tribute/README.md)
- [Integration Plan](tributestream-plugin-plan.md)

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- WordPress installation with Tributestream Plugin

### Environment Variables

Create a `.env` file with the following variables:

```
VITE_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json
```

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
```

## Best Practices

- Use TypeScript for type safety
- Follow SvelteKit conventions
- Document code thoroughly
- Write unit tests for critical functionality
- Use server-side rendering for initial page loads
- Implement client-side caching for frequently accessed data

## License

This project is licensed under the MIT License - see the LICENSE file for details.