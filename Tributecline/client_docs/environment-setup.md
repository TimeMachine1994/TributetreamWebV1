# WordPress API Environment Configuration Guide

Last Updated: 2024-02-13

## Overview

This document describes the environment variable configuration for the WordPress API integration in our SvelteKit application.

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# WordPress API Configuration
WORDPRESS_URL="https://wp.tributestream.com"
PUBLIC_WORDPRESS_URL="https://wp.tributestream.com"

# JWT Configuration
JWT_SECRET="your-jwt-secret-here"
JWT_EXPIRES_IN="7d"

# Environment
NODE_ENV="development"
```

## Variable Descriptions

- `WORDPRESS_URL`: The server-side WordPress API URL (not exposed to client)
- `PUBLIC_WORDPRESS_URL`: The public WordPress API URL (available in browser)
- `JWT_SECRET`: Secret key for JWT token verification
- `JWT_EXPIRES_IN`: JWT token expiration time
- `NODE_ENV`: Application environment ('development' or 'production')

## Configuration Structure

The environment configuration is managed through several key files:

### 1. Environment Configuration (`src/lib/config/env.ts`)
- Validates required environment variables
- Provides type-safe access to environment variables
- Centralizes environment configuration

### 2. WordPress API Configuration (`src/lib/config/wordpress.ts`)
- Defines API endpoints
- Provides URL utilities
- Handles error types

### 3. API Utilities
- Server-side: `src/lib/utils/api.server.ts`
- Client-side: `src/lib/utils/api.client.ts`

## Usage Examples

### Server-side Usage
```typescript
import { wordpressUrl } from '$lib/config/env';
import { getServerApiUrl } from '$lib/config/wordpress';

// Use environment variables
const apiUrl = getServerApiUrl('/wp/v2/users');
```

### Client-side Usage
```typescript
import { getClientApiUrl } from '$lib/config/wordpress';

// Use public environment variables
const apiUrl = getClientApiUrl('/wp/v2/posts');
```

## Security Considerations

1. Server-side variables (`WORDPRESS_URL`, `JWT_SECRET`) are never exposed to the client
2. Public variables must be prefixed with `PUBLIC_`
3. JWT tokens are stored in HTTP-only cookies
4. Environment validation runs at startup

## Development Setup

1. Copy `.env.example` to `.env`
2. Update variables with your WordPress installation details
3. Never commit `.env` to version control
4. Keep `.env.example` updated with required variables (but not actual values)

## Error Handling

The configuration system includes built-in error handling:

1. Startup validation ensures all required variables are present
2. URL format validation prevents malformed API calls
3. Type-safe access prevents runtime errors
4. Custom error types for API-related errors

## Best Practices

1. Always use the provided configuration utilities instead of accessing process.env directly
2. Keep sensitive information in server-side variables
3. Use TypeScript types for environment variables
4. Validate environment variables at startup
5. Document any new environment variables in this guide

## Troubleshooting

Common issues and solutions:

1. "Missing required environment variable":
   - Check if all required variables are defined in .env
   - Ensure variable names match exactly

2. "Invalid WordPress API URL":
   - Verify URL format includes protocol (https://)
   - Check for trailing slashes

3. "JWT validation failed":
   - Verify JWT_SECRET matches WordPress configuration
   - Check token expiration time

## Adding New Environment Variables

When adding new environment variables:

1. Add to `.env` and `.env.example`
2. Update `EnvConfig` interface in `src/lib/config/env.ts`
3. Add validation in `validateEnv()`
4. Document in this guide
5. Update any affected configuration modules

Remember to maintain backward compatibility when modifying environment variables.