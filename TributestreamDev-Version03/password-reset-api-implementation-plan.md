# Password Reset API Implementation Plan

## Overview

This document outlines the plan for implementing proxy API endpoints in the SvelteKit project to interact with a WordPress REST API plugin for password reset functionality.

## Background

The WordPress plugin provides three REST API endpoints for password reset functionality:
- `/wp-json/bdpwr/v1/reset-password` - To request a password reset code
- `/wp-json/bdpwr/v1/validate-code` - To validate a reset code
- `/wp-json/bdpwr/v1/set-password` - To set a new password using the code

The current implementation in the SvelteKit project tries to directly call these WordPress endpoints, but it's falling back to simulated success responses for development/testing. We need to create proxy API endpoints in the SvelteKit project that will forward these requests to the WordPress REST API.

## Implementation Plan

### Step 1: Create Password Reset API Directory Structure

Create a new directory structure for the password reset API endpoints:
```
TributestreamDev-Version03/src/routes/api/password-reset/
```

### Step 2: Implement the Reset Password Endpoint

Create a file `TributestreamDev-Version03/src/routes/api/password-reset/request/+server.ts` to handle requests for a password reset code.

This endpoint will:
- Accept POST requests with an email parameter
- Forward the request to the WordPress endpoint: `https://wp.tributestream.com/wp-json/bdpwr/v1/reset-password`
- Return the response from WordPress to the client

### Step 3: Implement the Validate Code Endpoint

Create a file `TributestreamDev-Version03/src/routes/api/password-reset/validate/+server.ts` to handle code validation requests.

This endpoint will:
- Accept POST requests with email and code parameters
- Forward the request to the WordPress endpoint: `https://wp.tributestream.com/wp-json/bdpwr/v1/validate-code`
- Return the response from WordPress to the client

### Step 4: Implement the Set Password Endpoint

Create a file `TributestreamDev-Version03/src/routes/api/password-reset/set/+server.ts` to handle password reset requests.

This endpoint will:
- Accept POST requests with email, code, and password parameters
- Forward the request to the WordPress endpoint: `https://wp.tributestream.com/wp-json/bdpwr/v1/set-password`
- Return the response from WordPress to the client

### Step 5: Update the Password Reset Page Server

Update the file `TributestreamDev-Version03/src/routes/my-portal/password-reset/+page.server.ts` to use our new proxy endpoints instead of directly calling the WordPress endpoints.

Change:
```typescript
const response = await fetch('/wp-json/bdpwr/v1/reset-password', ...
```

To:
```typescript
const response = await fetch('/api/password-reset/request', ...
```

And similarly for the other endpoints.

## Architecture Diagram

```
SvelteKit Frontend → SvelteKit API Proxy → WordPress REST API
```

### SvelteKit API Proxy Endpoints
- `/api/password-reset/request` → `/wp-json/bdpwr/v1/reset-password`
- `/api/password-reset/validate` → `/wp-json/bdpwr/v1/validate-code`
- `/api/password-reset/set` → `/wp-json/bdpwr/v1/set-password`

## Implementation Details

### Common Structure for Each Endpoint

Each endpoint will follow a similar pattern:

1. Import necessary modules from SvelteKit
2. Define a POST handler function
3. Parse the incoming request body
4. Validate required parameters
5. Forward the request to the WordPress endpoint
6. Handle the response and any errors
7. Return the response to the client

### Error Handling

Each endpoint will include proper error handling:
- Validate required parameters and return appropriate error responses
- Handle network errors when communicating with the WordPress API
- Pass through error responses from the WordPress API

### Logging

Include detailed logging for debugging purposes:
- Log incoming requests (without sensitive data)
- Log responses from the WordPress API
- Log any errors that occur

## Benefits of This Approach

1. **Security**: The frontend never directly communicates with the WordPress API
2. **Flexibility**: We can modify the proxy endpoints without changing the frontend code
3. **Maintainability**: Consistent pattern across all API endpoints
4. **Error Handling**: Centralized error handling for API requests