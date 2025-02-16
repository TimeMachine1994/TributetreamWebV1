# SvelteKit User Meta Endpoints Update Plan

## Overview
We need to update our SvelteKit user-meta endpoints to properly align with the enhanced WordPress plugin implementation. The main focus is on ensuring proper parameter handling, error handling, and response transformation.

## Required Changes

### 1. GET Endpoint (`[userId]/+server.ts`)

#### Current Issues:
1. Response transformation doesn't match the new WordPress format
2. Error handling doesn't account for all new WordPress error cases
3. Hardcoded localhost URL

#### Required Updates:
1. Update response transformation:
```typescript
// Current
const transformedData = {
  meta_key: data.meta_key || '',
  meta_value: typeof data.meta_value === 'string' ? data.meta_value : JSON.stringify(data.meta_value),
  user_id: parseInt(params.userId),
  created_at: data.created_at || new Date().toISOString(),
  updated_at: data.updated_at || new Date().toISOString()
};

// New
const transformedData = {
  success: true,
  user_id: parseInt(params.userId),
  meta: data.meta.map(item => ({
    meta_key: item.meta_key,
    meta_value: item.meta_value
  }))
};
```

2. Update error handling to match WordPress errors:
```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  
  // Match WordPress error codes
  switch(errorData.code) {
    case 'user_not_found':
      return json({ error: true, message: 'User not found' }, { status: 404 });
    case 'db_query_failed':
      return json({ error: true, message: 'Database error' }, { status: 500 });
    case 'no_meta_found':
      return json({ error: true, message: 'No meta data found' }, { status: 404 });
    default:
      return json({ error: true, message: errorData.message || 'Unknown error' }, { status: response.status });
  }
}
```

3. Use environment variable for WordPress URL:
```typescript
const url = `${import.meta.env.VITE_WORDPRESS_URL}/wp-json/tributestream/v1/user-meta/${params.userId}`;
```

### 2. POST Endpoint (`+server.ts`)

#### Current Issues:
1. Request body format doesn't match new WordPress expectations
2. Error handling doesn't account for all cases
3. Hardcoded localhost URL

#### Required Updates:
1. Update request body validation:
```typescript
const data = await request.json();
if (!data.meta_key || !data.meta_value) {
  return json({
    error: true,
    message: 'meta_key and meta_value are required'
  }, { status: 400 });
}
```

2. Update error handling:
```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  
  switch(errorData.code) {
    case 'meta_update_failed':
      return json({ error: true, message: 'Failed to update meta data' }, { status: 500 });
    default:
      return json({ error: true, message: errorData.message || 'Unknown error' }, { status: response.status });
  }
}
```

3. Use environment variable for WordPress URL:
```typescript
const apiUrl = `${import.meta.env.VITE_WORDPRESS_URL}/wp-json/tributestream/v1/user-meta`;
```

### 3. Types Update

Create or update types in `$lib/types/api.ts`:
```typescript
export interface UserMetaItem {
  meta_key: string;
  meta_value: string;
}

export interface UserMetaResponse {
  success: boolean;
  user_id: number;
  meta: UserMetaItem[];
}

export interface UserMetaError {
  code: string;
  message: string;
  data: {
    status: number;
  };
}
```

## Implementation Steps

1. Update Types
   - Add new interfaces to api.ts
   - Update existing interfaces if needed
   - Ensure proper type imports

2. Update GET Endpoint
   - Update URL to use environment variable
   - Implement new error handling
   - Update response transformation
   - Add proper type annotations

3. Update POST Endpoint
   - Update URL to use environment variable
   - Add request body validation
   - Implement new error handling
   - Update success response handling

4. Testing
   - Test GET endpoint with:
     * Valid user ID
     * Invalid user ID
     * User with no meta
     * Database errors
   - Test POST endpoint with:
     * Valid meta data
     * Invalid meta data
     * Missing required fields
     * Database errors

## Verification

1. Ensure all responses match WordPress format
2. Verify error codes and messages are properly handled
3. Check type safety throughout the implementation
4. Verify environment variables are properly used
5. Test all error scenarios
6. Verify proper logging is maintained

## Rollback Plan

1. Keep backup of current implementation
2. Test thoroughly in development
3. Deploy with monitoring
4. Be prepared to revert if issues arise