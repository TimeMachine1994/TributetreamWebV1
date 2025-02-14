# CORS Implementation Plan

## Overview
This document outlines the plan for implementing comprehensive CORS (Cross-Origin Resource Sharing) support between the SvelteKit frontend and WordPress backend.

## 1. WordPress Backend Changes

### Add CORS Headers Middleware
Add the following headers to the WordPress plugin:

```php
add_action('rest_api_init', function () {
    // Allow from specific origin(s)
    header('Access-Control-Allow-Origin: ' . get_allowed_cors_origin());
    
    // Allow credentials (cookies, authorization headers)
    header('Access-Control-Allow-Credentials: true');
    
    // Allow specific headers
    header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');
    
    // Allow specific methods
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
});

/**
 * Get allowed CORS origin based on environment
 * @return string
 */
function get_allowed_cors_origin() {
    $allowed_origins = [
        'http://localhost:5173',    // SvelteKit dev server
        'http://localhost:4173',    // SvelteKit preview
        // Add production URLs here
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    return in_array($origin, $allowed_origins) ? $origin : '';
}
```

### JWT Authentication Support
Ensure JWT plugin works with CORS:
- Add 'Authorization' to allowed headers
- Handle preflight requests for protected routes
- Validate token with proper CORS headers

## 2. Frontend Changes

### API Client Enhancement
Update api.client.ts:

```typescript
async function makeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = getClientApiUrl(endpoint);
    const headers = new Headers(options.headers);

    // Set default headers
    headers.set('Content-Type', 'application/json');
    
    // Add authorization if token is provided
    if (options.token) {
        headers.set('Authorization', `Bearer ${options.token}`);
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
            mode: 'cors'
        });

        // Handle CORS errors specifically
        if (!response.ok) {
            if (response.status === 0) {
                throw new ApiError(
                    'cors_error',
                    'CORS error: Unable to access the API. Please check CORS configuration.',
                    0
                );
            }
            // ... rest of error handling
        }

        return await response.json() as T;
    } catch (error) {
        // Enhanced error handling
        if (error instanceof TypeError && error.message.includes('CORS')) {
            throw new ApiError(
                'cors_error',
                'CORS policy violation: ' + error.message,
                0
            );
        }
        // ... rest of error handling
    }
}
```

### Environment Configuration
Ensure proper CORS URLs in .env:

```env
# Development
PUBLIC_WORDPRESS_URL=http://localhost:8080
WP_API_NAMESPACE=tributestream/v1

# Production
# PUBLIC_WORDPRESS_URL=https://api.tributestream.com
# WP_API_NAMESPACE=tributestream/v1
```

## 3. Security Considerations

1. Origin Validation
- Strictly validate allowed origins
- Use environment variables for origin configuration
- Never use wildcard (*) for sensitive routes

2. Credentials
- Only enable credentials for trusted origins
- Ensure secure cookie handling
- Implement proper session management

3. Headers
- Only expose necessary headers
- Validate Authorization header handling
- Implement proper CSRF protection

## 4. Testing Plan

1. Development Environment
- Test local development setup
- Verify CORS headers
- Test authentication flows

2. Production Environment
- Test with production URLs
- Verify security headers
- Test error scenarios

## Implementation Steps

1. Backend Implementation
- [ ] Add CORS headers middleware to WordPress plugin
- [ ] Configure allowed origins
- [ ] Test preflight requests
- [ ] Verify JWT authentication

2. Frontend Implementation
- [ ] Update API client error handling
- [ ] Test CORS error scenarios
- [ ] Verify credentials handling
- [ ] Document CORS requirements

3. Testing & Validation
- [ ] Test all API endpoints
- [ ] Verify authentication flows
- [ ] Test error scenarios
- [ ] Document testing results

## Next Steps

1. Review and approve this implementation plan
2. Implement WordPress plugin changes
3. Update frontend API client
4. Test and validate changes
5. Deploy to staging environment
6. Final testing and production deployment