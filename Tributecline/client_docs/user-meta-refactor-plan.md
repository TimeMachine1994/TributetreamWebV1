# User Meta Endpoint Refactoring Plan

## Overview
We need to refactor the user-meta endpoints in WordpressPlugin.php to implement the new Meta write plugin functionality.

## Current Implementation
The current WordpressPlugin.php has these user-meta related sections:

1. Endpoint Registrations (lines 262-297):
   ```php
   register_rest_route(
       $namespace,
       '/user-meta',
       // POST endpoint implementation
   );

   register_rest_route(
       $namespace,
       '/user-meta/(?P<user_id>\d+)',
       // GET endpoint implementation
   );
   ```

2. Handler Functions (lines 590-648):
   - `ts_store_user_meta()` (lines 590-618)
   - `ts_get_all_user_meta()` (lines 619-648)

## Required Changes

### 1. Remove Current Implementation
Delete or comment out:
- Both endpoint registrations
- Both handler functions
- Any related comments or documentation

### 2. Add New Implementation
Add the new Meta write plugin functionality:

1. New endpoint registrations with improved parameter handling:
   ```php
   register_rest_route(
       'tributestream/v1',
       '/user-meta',
       array(
           array(
               'methods' => WP_REST_Server::CREATABLE,
               'callback' => 'ts_store_user_meta',
               'permission_callback' => 'custom_jwt_authenticate',
               'args' => array(
                   'meta_key' => array(
                       'required' => true,
                       'sanitize_callback' => 'sanitize_text_field',
                   ),
                   'meta_value' => array(
                       'required' => true,
                       'sanitize_callback' => 'sanitize_text_field',
                   ),
               ),
           ),
       )
   );

   register_rest_route(
       'tributestream/v1',
       '/user-meta/(?P<user_id>\d+)',
       array(
           array(
               'methods' => WP_REST_Server::READABLE,
               'callback' => 'ts_get_all_user_meta',
               'permission_callback' => 'custom_jwt_authenticate',
               'args' => array(
                   'user_id' => array(
                       'required' => true,
                       'validate_callback' => function($param, $request, $key) {
                           return is_numeric($param);
                       },
                   ),
               ),
           ),
       )
   );
   ```

2. New handler functions with improved error handling:
   - `ts_get_all_user_meta()`: Enhanced with proper user validation and error handling
   - `ts_store_user_meta()`: Improved parameter handling and response formatting

### 3. Authentication
No changes needed to the JWT authentication as both implementations use the same `custom_jwt_authenticate` function.

## Implementation Steps

1. Switch to Code mode
2. Create a backup of the current WordpressPlugin.php
3. Use apply_diff to:
   a. Remove the old endpoint registrations
   b. Remove the old handler functions
   c. Add the new endpoint registrations
   d. Add the new handler functions
4. Test the new endpoints:
   - POST /tributestream/v1/user-meta
   - GET /tributestream/v1/user-meta/{user_id}

## Verification Steps

1. Ensure both endpoints are accessible
2. Verify JWT authentication still works
3. Test error handling:
   - Invalid user ID
   - Missing required fields
   - Invalid meta key/value
4. Confirm proper response formatting
5. Verify database operations work as expected

## Rollback Plan

If issues are encountered:
1. Restore from the backup
2. Document the specific issues
3. Create a new plan addressing the problems