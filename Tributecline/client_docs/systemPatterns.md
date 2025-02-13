# System Patterns
Last Updated: 2/13/2025

## Architecture Overview

### API Layer
The application uses a direct, type-safe approach to API communication with WordPress:

1. **Environment Configuration**
   - API endpoints configured via environment variables:
     ```
     WP_API_BASE=https://wp.tributestream.com/wp-json
     WP_API_NAMESPACE=tributestream/v1
     ```
   - Allows for easy environment switching (dev/staging/prod)

2. **Type System**
   - Centralized type definitions in `src/lib/types/api.ts`
   - Key interfaces:
     - `User` - User profile data
     - `UserMeta` - User metadata
     - `Tribute` - Tribute content
     - `PaginatedResponse<T>` - Paginated API responses
     - `LoginResponse` - Authentication response
     - `RegisterData` - Registration data

3. **API Endpoints**
   - Direct fetch calls with proper error handling
   - Consistent response structure
   - Endpoint pattern: `${env.WP_API_BASE}/${env.WP_API_NAMESPACE}/[endpoint]`
   - Authentication via Bearer tokens

4. **Error Handling**
   - Consistent error response structure:
     ```typescript
     {
       error: true,
       message: string
     }
     ```
   - HTTP status codes for different error types
   - Comprehensive error logging
   - Response validation at each endpoint

## Data Flow

1. **Authentication Flow**
   - Login endpoint validates credentials
   - JWT token received from WordPress
   - Token stored in user store
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

3. **Response Validation**
   - Type checking against defined interfaces
   - Null/undefined checks
   - Required field validation
   - Fallback values where appropriate

## Key Technical Decisions

1. **Direct API Calls**
   - Removed abstraction layer (api.ts)
   - Benefits:
     - Simpler code path
     - Easier debugging
     - Better error context
     - Reduced complexity

2. **Centralized Types**
   - Single source of truth for API types
   - Shared between client and server
   - Ensures consistency across codebase

3. **Environment Configuration**
   - External configuration for API endpoints
   - Supports different environments
   - Easy to modify without code changes

4. **Error Handling**
   - Detailed error logging
   - Consistent error response format
   - Proper HTTP status codes
   - Client-friendly error messages

## Best Practices

1. **API Endpoints**
   - Use proper HTTP methods (GET, POST, PUT, DELETE)
   - Validate input data
   - Return appropriate status codes
   - Include error context in responses

2. **Type Safety**
   - Use TypeScript interfaces
   - Validate response data
   - Include proper type annotations
   - Handle edge cases

3. **Error Handling**
   - Log errors with context
   - Return user-friendly messages
   - Include technical details in logs
   - Use appropriate status codes

4. **Security**
   - Validate authentication tokens
   - Sanitize input data
   - Protect sensitive endpoints
   - Use HTTPS for all requests

## Future Considerations

1. **Potential Enhancements**
   - Request retry logic
   - Rate limiting
   - Request caching
   - API versioning

2. **Monitoring**
   - API performance metrics
   - Error rate tracking
   - Response time monitoring
   - Usage analytics