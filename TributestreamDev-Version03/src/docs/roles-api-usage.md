# Roles API Usage Guide

This document provides information on how to use the Roles API endpoints and the Role-Based Access Control (RBAC) components in the Tributestream application.

## Table of Contents

1. [API Endpoints](#api-endpoints)
   - [Check User Role](#check-user-role)
   - [Assign User Role](#assign-user-role)
2. [WordPress Plugin Endpoints](#wordpress-plugin-endpoints)
   - [Get User Role](#get-user-role)
   - [Update User Role](#update-user-role)
3. [Role-Based Access Component](#role-based-access-component)
   - [Basic Usage](#basic-usage)
   - [Advanced Usage](#advanced-usage)
4. [Utility Functions](#utility-functions)
   - [Role Checking](#role-checking)
   - [Role Assignment](#role-assignment)

## API Endpoints

### Check User Role

**Endpoint:** `GET /api/roles/check`

**Query Parameters:**
- `userId` (required): The ID of the user to check
- `role` (optional): The role to check for
- `capability` (optional): The capability to check for

**Authentication:**
- Requires a valid JWT token in cookies

**Response:**
```json
{
  "success": true,
  "hasRole": true,
  "roles": ["administrator", "editor"]
}
```

or

```json
{
  "success": true,
  "hasCapability": true,
  "capabilities": ["manage_options", "edit_posts"]
}
```

**Example Usage:**
```typescript
// Check if a user has the 'administrator' role
const response = await fetch(`/api/roles/check?userId=123&role=administrator`);
const data = await response.json();

if (data.success && data.hasRole) {
  console.log('User is an administrator');
}
```

### Assign User Role

**Endpoint:** `POST /api/roles/assign`

**Request Body:**
```json
{
  "userId": "123",
  "role": "editor",
  "userType": "funeral_director" // Optional
}
```

**Authentication:**
- Requires a valid JWT token in cookies
- Requires administrator privileges

**Response:**
```json
{
  "success": true,
  "message": "Role assigned successfully",
  "userId": "123",
  "role": "editor"
}
```

**Example Usage:**
```typescript
// Assign the 'editor' role to a user
const response = await fetch('/api/roles/assign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: '123',
    role: 'editor'
  })
});

const data = await response.json();

if (data.success) {
  console.log('Role assigned successfully');
}
```

## WordPress Plugin Endpoints

### Get User Role

**Endpoint:** `GET /tributestream/v1/users/{id}/role`

**Authentication:**
- Requires a valid JWT token
- Any authenticated user can access

**Response:**
```json
{
  "user_id": "123",
  "roles": ["editor"],
  "capabilities": {
    "edit_posts": true,
    "publish_posts": true
  },
  "user_type": "funeral_director"
}
```

### Update User Role

**Endpoint:** `PUT /tributestream/v1/users/{id}/role`

**Request Body:**
```json
{
  "role": "editor",
  "user_type": "funeral_director" // Optional
}
```

**Authentication:**
- Requires a valid JWT token
- Requires administrator privileges

**Response:**
```json
{
  "user_id": "123",
  "role": "editor",
  "message": "User role updated successfully"
}
```

## Role-Based Access Component

The `RoleBasedAccess` component provides a simple way to conditionally render content based on user roles and permissions.

### Basic Usage

```svelte
<script>
  import RoleBasedAccess from '$lib/components/role-based-access.svelte';
</script>

<!-- Only show content to administrators -->
<RoleBasedAccess adminOnly={true}>
  <div>Admin-only content</div>
  
  <div slot="unauthorized">
    You need administrator privileges to view this content.
  </div>
</RoleBasedAccess>

<!-- Only show content to users with the 'editor' role -->
<RoleBasedAccess userId={currentUser?.id} requiredRole="editor">
  <div>Editor-only content</div>
  
  <div slot="unauthorized">
    You need editor privileges to view this content.
  </div>
</RoleBasedAccess>
```

### Advanced Usage

The `RoleBasedAccess` component provides several slots for customizing the UI:

- `default`: Content to show when the user has access
- `unauthorized`: Content to show when the user doesn't have access
- `loading`: Content to show while checking permissions
- `error`: Content to show when an error occurs

```svelte
<RoleBasedAccess userId={userId} requiredRole="author">
  <!-- Content for authorized users -->
  <div>
    <h2>Author Dashboard</h2>
    <p>Welcome to the author dashboard!</p>
  </div>
  
  <!-- Content for unauthorized users -->
  <div slot="unauthorized">
    <p>You need author privileges to access this content.</p>
    <a href="/contact">Contact an administrator for access</a>
  </div>
  
  <!-- Loading state -->
  <div slot="loading">
    <p>Checking permissions...</p>
    <div class="spinner"></div>
  </div>
  
  <!-- Error state -->
  <div slot="error" let:error>
    <p>Error: {error}</p>
    <button on:click={() => window.location.reload()}>Retry</button>
  </div>
</RoleBasedAccess>
```

## Utility Functions

The `role-helpers.ts` file provides several utility functions for working with roles.

### Role Checking

```typescript
import { checkUserRole, checkUserCapability, isAdmin } from '$lib/utils/role-helpers';

// Check if a user has a specific role
const result = await checkUserRole('123', 'editor');
if (result.success && result.hasRole) {
  console.log('User has the editor role');
}

// Check if a user has a specific capability
const result = await checkUserCapability('123', 'edit_posts');
if (result.success && result.hasCapability) {
  console.log('User can edit posts');
}

// Check if the current user is an admin
const currentUser = parseUserFromCookieString(document.cookie);
if (isAdmin(currentUser)) {
  console.log('Current user is an admin');
}
```

### Role Assignment

```typescript
import { assignUserRole } from '$lib/utils/role-helpers';

// Assign a role to a user
try {
  await assignUserRole('123', 'editor', 'funeral_director');
  console.log('Role assigned successfully');
} catch (error) {
  console.error('Failed to assign role:', error);
}
```

## Role Mapping

The system uses the following mapping between user types and WordPress roles:

| User Type | WordPress Role |
|-----------|---------------|
| admin | administrator |
| funeral_director | editor |
| family_member | author |
| guest | subscriber |

This mapping is used when assigning roles to users and when checking user permissions.