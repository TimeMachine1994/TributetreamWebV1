# API Route-Centric Refactoring Plan

## Current Structure
- API routes in src/routes/api/ handle WordPress communication
- Components currently use lib/utils/api.client.ts and lib/stores/userStore.ts
- Need to maintain API route layer as single point of WordPress contact

## Improved Architecture

### API Routes as Service Layer
All external WordPress communication happens through our API routes:
```
src/routes/api/
├── all-tributes/    # Tribute listing endpoints
├── auth/            # Authentication handling
├── getRole/         # User role management
├── register/        # User registration
├── send-email/      # Email functionality
├── tribute/         # Single tribute operations
├── tributes/        # Tribute management
├── user-meta/       # User metadata operations
├── users/           # User management
└── validate-token/  # Token validation
```

### API Route Implementation Pattern
Each API route should:
1. Handle WordPress communication
2. Provide proper error handling
3. Format responses consistently
4. Validate input data
5. Handle authentication where needed

Example API route structure:
```typescript
// src/routes/api/auth/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { username, password } = await request.json();
    
    // WordPress JWT auth endpoint call
    const response = await fetch(`${WP_URL}/jwt-auth/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const error = await response.json();
      return json({
        success: false,
        message: error.message || 'Authentication failed'
      }, { status: response.status });
    }

    const authData = await response.json();
    return json({
      success: true,
      data: authData
    });

  } catch (error) {
    return json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
};
```

### Component Usage
Components should:
1. Use fetch to call our API routes
2. Handle loading states locally
3. Manage their own error states
4. Use proper typing for API responses

Example component:
```typescript
// src/routes/login/+page.svelte
<script lang="ts">
  let loading = false;
  let error: string | null = null;

  async function handleLogin(event: SubmitEvent) {
    loading = true;
    error = null;
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        error = result.message;
        return;
      }

      // Handle successful login
      goto('/dashboard');
      
    } catch (e) {
      error = 'Failed to connect to server';
    } finally {
      loading = false;
    }
  }
</script>
```

## Migration Steps

1. Strengthen API Routes
   - Review and enhance error handling
   - Standardize response formats
   - Add input validation
   - Improve WordPress error handling

2. Update Components
   - Remove api.client.ts dependencies
   - Remove userStore dependencies
   - Implement local state management
   - Add proper error handling

3. Testing
   - Verify API route functionality
   - Test error scenarios
   - Validate component behavior
   - Check authentication flow

4. Cleanup
   - Remove unused lib files
   - Update documentation
   - Remove deprecated code

## Standard API Response Format
```typescript
// Success response
interface SuccessResponse<T> {
  success: true;
  data: T;
}

// Error response
interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
}
```

## Error Handling Strategy
1. API routes handle WordPress errors
2. Consistent error response format
3. Proper HTTP status codes
4. Clear error messages
5. Logging where appropriate

## Authentication Flow
1. Login through /api/auth
2. Token validation via /api/validate-token
3. User data through /api/users/me
4. Protected routes check auth status

## Benefits
1. Single point of WordPress communication
2. Consistent error handling
3. Simpler component logic
4. Better maintainability
5. Clear responsibility separation

## Timeline
1. API route enhancement: 2-3 days
2. Component updates: 2-3 days
3. Testing: 1-2 days
4. Cleanup: 1 day

Total: 6-9 days

## Success Criteria
1. All WordPress communication through API routes
2. Consistent error handling
3. Simplified component code
4. Improved maintainability
5. Full functionality preserved

## Next Steps
1. Review and enhance one API route
2. Update corresponding components
3. Verify functionality
4. Continue with remaining routes