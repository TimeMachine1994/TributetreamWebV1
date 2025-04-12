# Password Reset API Implementation Prompt

## Task Overview

We need to implement proxy API endpoints in our SvelteKit application to interact with a WordPress REST API plugin for password reset functionality. The current implementation attempts to directly call WordPress endpoints but falls back to simulated success responses for development/testing. We need to create proper proxy endpoints similar to our existing auth endpoint.

## Background

Our WordPress site has a plugin installed that provides three REST API endpoints for password reset:

1. `/wp-json/bdpwr/v1/reset-password` - To request a password reset code
2. `/wp-json/bdpwr/v1/validate-code` - To validate a reset code
3. `/wp-json/bdpwr/v1/set-password` - To set a new password using the code

Currently, our SvelteKit application in `TributestreamDev-Version03/src/routes/my-portal/password-reset/+page.server.ts` tries to call these endpoints directly, but it's not working correctly and falls back to simulated success responses.

## Implementation Requirements

Please implement the following:

1. Create a new directory structure for the password reset API endpoints:
   ```
   TributestreamDev-Version03/src/routes/api/password-reset/
   ```

2. Implement three proxy endpoints:
   - `request/+server.ts` - For requesting a password reset code
   - `validate/+server.ts` - For validating a reset code
   - `set/+server.ts` - For setting a new password

3. Each endpoint should:
   - Accept POST requests with the necessary parameters
   - Forward the request to the corresponding WordPress endpoint at https://wp.tributestream.com
   - Return the response from WordPress to the client
   - Include proper error handling and logging

4. Update the password reset page server to use our new proxy endpoints instead of directly calling the WordPress endpoints

## Technical Details

### Request Endpoint

The request endpoint should:
- Accept a POST request with an email parameter
- Forward the request to `https://wp.tributestream.com/wp-json/bdpwr/v1/reset-password`
- Return the WordPress response to the client

### Validate Endpoint

The validate endpoint should:
- Accept a POST request with email and code parameters
- Forward the request to `https://wp.tributestream.com/wp-json/bdpwr/v1/validate-code`
- Return the WordPress response to the client

### Set Password Endpoint

The set password endpoint should:
- Accept a POST request with email, code, and password parameters
- Forward the request to `https://wp.tributestream.com/wp-json/bdpwr/v1/set-password`
- Return the WordPress response to the client

### Error Handling

Each endpoint should include proper error handling:
- Validate required parameters and return appropriate error responses
- Handle network errors when communicating with the WordPress API
- Pass through error responses from the WordPress API

### Logging

Include detailed logging for debugging purposes:
- Log incoming requests (without sensitive data)
- Log responses from the WordPress API
- Log any errors that occur

## Reference Implementation

You can use our existing auth API endpoint as a reference for implementation:
`TributestreamDev-Version03/src/routes/api/auth/+server.ts`

This endpoint follows a similar pattern of forwarding requests to a WordPress endpoint and handling responses.

## Expected Updates

After implementing the proxy endpoints, update the password reset page server:
`TributestreamDev-Version03/src/routes/my-portal/password-reset/+page.server.ts`

Change the fetch calls from:
```typescript
const response = await fetch('/wp-json/bdpwr/v1/reset-password', ...
```

To:
```typescript
const response = await fetch('/api/password-reset/request', ...
```

And similarly for the other endpoints.

## Benefits

This approach provides:
1. **Security**: The frontend never directly communicates with the WordPress API
2. **Flexibility**: We can modify the proxy endpoints without changing the frontend code
3. **Maintainability**: Consistent pattern across all API endpoints
4. **Error Handling**: Centralized error handling for API requests

Please implement this solution following our TypeScript and SvelteKit best practices. Use proper typing and error handling throughout.