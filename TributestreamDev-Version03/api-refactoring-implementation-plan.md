# API Refactoring Implementation Plan

This document outlines a comprehensive step-by-step plan for refactoring the TributeStream application to use the new v2 API endpoints located in `src/routes/api`.

## Table of Contents
1. [Current API Architecture Analysis](#current-api-architecture-analysis)
2. [API Endpoint Mapping](#api-endpoint-mapping)
3. [Refactoring Plan for +page.server.ts](#refactoring-plan-for-pageserverts)
4. [Testing and Validation Strategy](#testing-and-validation-strategy)
5. [Backward Compatibility Considerations](#backward-compatibility-considerations)
6. [Performance Optimization Opportunities](#performance-optimization-opportunities)

## Current API Architecture Analysis

Currently, the application uses a mix of direct WordPress API calls and some refactored endpoint calls. The key files involved in this refactoring are:

- `src/routes/+page.svelte` - Frontend component with form handling
- `src/routes/+page.server.ts` - Server actions that process form submissions
- `src/routes/api/tributes/+server.ts` - New API endpoint for tribute operations
- `src/routes/api/auth/+server.ts` - New API endpoint for authentication operations

### Current API Calls in +page.server.ts

| Line | API Endpoint | Status | Action Required |
|------|-------------|--------|----------------|
| 29 | `/api/tributes?search=...` | ✅ Already using new endpoint | None |
| 100 | `/api/auth/register` | ✅ Already using new endpoint | None |
| 139 | `/api/auth` | ✅ Already using new endpoint | None |
| 230 | `https://wp.tributestream.com/wp-json/tributestream/v1/user-meta` | ❌ Direct WordPress call | Replace with new endpoint |
| 279 | `https://wp.tributestream.com/wp-json/tributestream/v1/tributes` | ❌ Direct WordPress call | Replace with new endpoint |
| 333 | `/api/send-email` | ✅ Already using new endpoint | None |
| 355 | `/api/send-email` (fallback) | ✅ Already using new endpoint | None |

## API Endpoint Mapping

To successfully complete the refactoring, we need to map each direct WordPress API call to its corresponding new endpoint.

### 1. User Meta Operations

**Old Endpoint:** `https://wp.tributestream.com/wp-json/tributestream/v1/user-meta`
**New Endpoint:** `/api/users/[userId]/tributes-data`

| Operation | HTTP Method | Old URL | New URL | Data Structure Changes |
|-----------|-------------|---------|---------|------------------------|
| Create or Update User Meta | POST | `/wp-json/tributestream/v1/user-meta` | `/api/users/[userId]/tributes-data` | Instead of separate `meta_key` and `meta_value`, the new endpoint accepts the data directly in the request body |

### 2. Tribute Operations

**Old Endpoint:** `https://wp.tributestream.com/wp-json/tributestream/v1/tributes`
**New Endpoint:** `/api/tributes`

| Operation | HTTP Method | Old URL | New URL | Data Structure Changes |
|-----------|-------------|---------|---------|------------------------|
| Create Tribute | POST | `/wp-json/tributestream/v1/tributes` | `/api/tributes` | The data structure is mostly the same, but we should use the `extended_data` field to store additional metadata instead of using separate user meta calls |

## Refactoring Plan for +page.server.ts

### Phase 1: Preparation

1. Add strategic console logging to existing code to track current behavior.
2. Create TypeScript interfaces for request/response data structures.
3. Add logging utilities for API debugging.

### Phase 2: Refactoring User Meta API Call (Line 230)

**Step 1:** Replace direct WordPress API call with new endpoint:

```typescript
// BEFORE: Direct WordPress call
const metaResponse = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/user-meta', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authResult.token}`
    },
    body: JSON.stringify(metaPayload)
});

// AFTER: Using refactored endpoint
// We'll include this data directly in the tribute creation instead of a separate call
// to avoid using the user-meta endpoint
const tributeExtendedData = {
    director: {
        firstName: creatorFirstName,
        lastName: creatorLastName
    },
    deceased: {
        firstName,
        lastName,
        fullName: data.lovedOneName,
        dob: '',
        dop: ''
    },
    contact: {
        email: data.creatorEmail,
        phone: data.creatorPhone
    },
    memorial: {
        locationName: '',
        locationAddress: '',
        time: '',
        date: ''
    }
};

// This will be used in the tribute creation call
```

### Phase 3: Refactoring Tributes API Call (Line 279)

**Step 1:** Replace direct WordPress API call with new endpoint:

```typescript
// BEFORE: Direct WordPress call
const tributeResponse = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tributes', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authResult.token}`
    },
    body: JSON.stringify(tributePayload)
});

// AFTER: Using refactored endpoint
console.log('🚀 Creating tribute using new API endpoint');
const enhancedTributePayload = {
    ...tributePayload,
    extended_data: tributeExtendedData // Include the extended data from previous step
};

const tributeResponse = await fetch('/api/tributes', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authResult.token}`
    },
    body: JSON.stringify(enhancedTributePayload)
});
```

### Phase 4: Implementing Strategic Console Logging

Add detailed logging throughout the refactored code to track execution flow and diagnose issues:

```typescript
// Add at the beginning of the createMemorial action
console.log('🚀 Starting memorial creation with refactored API endpoints');

// Add before API calls
console.log('📤 Preparing tribute creation payload:', enhancedTributePayload);

// Add after API calls
console.log('📥 Tribute creation response:', tributeResult);
```

## Testing and Validation Strategy

### 1. Unit Testing

Create test cases for each refactored API call:

1. Test successful tribute creation.
2. Test error scenarios (missing fields, authentication issues).
3. Validate response structure matches expectations.

### 2. Integration Testing

Verify end-to-end functionality:

1. Complete form submission from frontend.
2. Verify data is stored correctly in WordPress.
3. Confirm redirect to the correct tribute page.

### 3. Monitoring

Add monitoring for the refactored endpoints:

1. Track API call performance.
2. Monitor error rates.
3. Set up alerts for unexpected behavior.

## Backward Compatibility Considerations

### Data Storage Changes

Since we're moving from separate user meta to extended_data within tributes:

1. Add a migration script to copy existing user meta data to tribute extended_data.
2. Implement a fallback mechanism to check both locations during read operations.

### Error Handling Improvements

The new API endpoints return standardized error responses:

```typescript
// New error structure
{
  "code": "VALIDATION_ERROR", // Standardized error code
  "message": "Loved one name is required", // User-friendly message
  "status": 400 // HTTP status code
}
```

Update error handling to use these standardized responses:

```typescript
// BEFORE
if (!tributeResponse.ok) {
    const tributeError = await tributeResponse.json();
    console.error('❌ Tribute creation failed:', tributeError);
    return fail(tributeResponse.status, { 
        create: true,
        error: true, 
        message: tributeError.message || 'Failed to create memorial page',
        data
    });
}

// AFTER
if (!tributeResponse.ok) {
    const tributeError = await tributeResponse.json();
    console.error('❌ Tribute creation failed:', tributeError);
    return fail(tributeResponse.status, { 
        create: true,
        error: true, 
        message: tributeError.message || tributeError.code || 'Failed to create memorial page',
        errorCode: tributeError.code,
        data
    });
}
```

## Performance Optimization Opportunities

### 1. Reduce API Calls

By combining user meta and tribute creation, we reduce the number of API calls from 2 to 1, improving performance.

### 2. Implement Caching

Add caching for frequently accessed endpoints:

```typescript
// In the tributes GET endpoint
const CACHE_TTL = 60 * 5; // 5 minutes
const cacheKey = `tributes_search_${search}_page_${page}_perPage_${perPage}`;

// Check cache first
const cachedResult = await cache.get(cacheKey);
if (cachedResult) {
    return json(JSON.parse(cachedResult), { status: 200 });
}

// If not in cache, fetch from API and cache result
const response = await forwardRequestToWordPress<PaginatedTributesResponse>(/*...*/);
if (response.success) {
    await cache.set(cacheKey, JSON.stringify(response), CACHE_TTL);
}
```

### 3. Implement Batch Operations

For operations involving multiple tributes, implement batch endpoints to reduce round trips.

## Implementation Steps

1. Create necessary type definitions
2. Refactor the tribute creation code to include extended_data
3. Remove the separate user meta API call
4. Add comprehensive logging
5. Implement error handling for the new endpoint structure
6. Test the refactored code
7. Deploy and monitor
