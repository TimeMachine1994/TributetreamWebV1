# TributeStream.com Technical Documentation
Last Updated: 2025-02-16

## System Architecture

### Overview
TributeStream.com is a SvelteKit 5 frontend application communicating with a WordPress backend via REST APIs. The architecture emphasizes type safety, direct API communication, and proper error handling.

### API Layer
- Direct, type-safe approach to API communication
- Environment-based configuration
- Centralized type definitions in `src/lib/types/api.ts`
- Consistent error handling patterns

### Core Components
1. **Frontend (SvelteKit 5)**
   - Server-side rendering (SSR) capabilities
   - File-based routing system
   - TypeScript integration
   - Tailwind CSS for styling

2. **Backend (WordPress)**
   - Custom plugin for extended functionality, exposing new endpoints
   - JWT Authentication for API security
   - Enhanced user meta handling with robust validation and security
   - REST API endpoints with comprehensive error handling

### Data Flow
1. **Authentication Flow**
   - Login endpoint validates credentials
   - JWT token received from WordPress
   - Token stored in cookies via hooks.server.ts
   - Token included in subsequent API requests

2. **API Request Pattern**
```typescript
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  // Handle error with proper logging and status code
}

const data = await response.json();
// Validate and return data
```

## Authentication & Security

### JWT Implementation
1. **Token Storage**
   - Stored in cookies via hooks.server.ts
   - Cookie management handled by SvelteKit
   - Token and auth state available in event.locals

2. **Protected Routes**
   - Authentication check via locals.isAuthenticated
   - Token validation on protected endpoints
   - User authorization checks
   - Proper error handling

## WordPress Plugin

### Overview
The WordPress plugin (A7 Tributestream) provides custom REST API endpoints under the 'tributestream/v1' namespace. It integrates with JWT Authentication and implements comprehensive CORS handling.

### Key Features
1. **Custom Table Management**
   - Manages 'wp_tributes' table
   - Enhanced user meta handling with improved security
   - Implements CRUD operations

2. **Authentication Integration**
   - JWT token validation
   - Protected routes
   - Public endpoints where appropriate

3. **CORS Configuration**
   - Environment-based origin validation
   - Proper headers for credentials
   - Preflight request handling

### REST API Endpoints

1. **User Management**
   ```
   GET  /tributestream/v1/getRole?id={id}
   POST /tributestream/v1/register
   ```
   - Get user roles
   - User registration with meta data
   - Public access

2. **Tribute Management**
   ```
   GET    /tributestream/v1/all-tributes
   GET    /tributestream/v1/tributes
   POST   /tributestream/v1/tributes
   GET    /tributestream/v1/tributes/{id}
   PUT    /tributestream/v1/tributes/{id}
   DELETE /tributestream/v1/tributes/{id}
   POST   /tributestream/v1/tribute
   GET    /tributestream/v1/tribute/{slug}
   ```
   - CRUD operations for tributes
   - Pagination support
   - Search functionality
   - Both public and protected routes

3. **User Meta (Enhanced Implementation)**
   ```
   POST /tributestream/v1/user-meta
   GET  /tributestream/v1/user-meta/{user_id}
   ```
   - Secure storage and retrieval of user metadata
   - Enhanced parameter validation and sanitization
   - Comprehensive error handling with try-catch blocks
   - Protected by JWT authentication
   - Safe database operations with proper escaping

### Implementation Details

1. **CORS Handling**
```php
function send_cors_headers() {
    $allowed_origins = [
        'http://localhost:5173',    // SvelteKit dev server
        'http://localhost:4173',    // SvelteKit preview
        'http://localhost:3000',    // Alternative dev port
        'https://wp.tributestream.com', // Production WordPress
        'https://tributestream.com'    // Production frontend
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, $allowed_origins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');
        header('Access-Control-Max-Age: 3600');
        header('Vary: Origin');
    }
}
```

2. **JWT Authentication**
```php
function verify_jwt_cookie($request) {
    $auth_header = $request->get_header('Authorization');
    if (!$auth_header || stripos($auth_header, 'Bearer ') === false) {
        return new WP_Error('jwt_auth_no_auth_header', 'Authorization header not found.');
    }
    
    $token = trim(str_ireplace('Bearer', '', $auth_header));
    // Validate token...
    return true;
}
```

3. **Enhanced Error Handling**
```php
// Example error response with improved detail
return new WP_Error(
    'error_code',
    'Human readable message',
    [
        'status' => 4xx/5xx,
        'additional_info' => $context
    ]
);

// Success response with consistent structure
return new WP_REST_Response([
    'success' => true,
    'data' => $data,
    'message' => 'Operation completed successfully'
], 200);
```

### Security Measures

1. **Input Validation**
   - Enhanced sanitization of user inputs
   - Strict type checking
   - Required field validation
   - SQL injection prevention
   - Parameter sanitization callbacks

2. **Authentication**
   - JWT token validation
   - Role-based access control
   - Protected routes
   - Proper error responses

3. **CORS Security**
   - Origin validation
   - Proper header configuration
   - Credentials handling
   - Preflight response

### Plugin Features

1. **Tribute Management**
   - Create, read, update, delete tributes
   - Slug-based access
   - Pagination and search
   - Meta data handling

2. **User Management**
   - User registration
   - Role management
   - Enhanced meta data storage and retrieval
   - Email notifications

3. **Data Validation**
   - Improved input sanitization
   - Strict type checking
   - Required fields validation
   - Comprehensive error handling
   - Try-catch blocks for database operations

## Environment Configuration

### Required Variables
```env
# WordPress API Configuration
WORDPRESS_URL="https://wp.tributestream.com"
PUBLIC_WORDPRESS_URL="https://wp.tributestream.com"
VITE_WP_API_NAMESPACE="tributestream/v1"

# JWT Configuration
JWT_SECRET="your-jwt-secret-here"
JWT_EXPIRES_IN="7d"

# Environment
NODE_ENV="development"
```

### Configuration Structure
1. **Environment Config** (`src/lib/config/env.ts`)
   - Validates required variables
   - Type-safe access
   - Centralized configuration

2. **WordPress Config** (`src/lib/config/wordpress.ts`)
   - API endpoint definitions
   - URL utilities
   - Error type handling

## Development Status

### Completed Features ✅
1. **Core Website Structure**
   - Header, footer, hero components
   - Forms and calculators
   - WordPress plugin integration
   - User authentication system
   - API architecture improvements
   - Type system enhancement
   - Enhanced user meta handling

### In Progress Features ⚙️

1. **Authentication System**
   - Login endpoint
   - Token validation
   - Protected routes
   - User meta handling
2. **Session Management**
   - Cookie-based sessions
   - Session validation
   - State management

### Current Focus
1. **API Architecture Improvement**
   - Remove unnecessary abstractions
   - Implement direct fetch calls
   - Enhance error handling
   - Centralize type definitions

2. **Authentication Enhancement**
   - Implement secure session handling
   - Add session persistence
   - Create cleanup routines
   - Enhance error handling