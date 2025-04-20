# TributeStream Admin Endpoints Implementation Plan

This document outlines the plan for implementing administrative endpoints in the TributeStream WordPress plugin to allow administrators to manage the tributes table without ownership restrictions.

## Overview

The implementation will add a new set of REST API endpoints under the namespace `tributestream/v1/admin` that will be accessible only to WordPress administrators. These endpoints will provide comprehensive CRUD operations for tributes with advanced filtering and pagination capabilities.

```mermaid
graph TD
    A[tributestream/v1] --> B[/admin]
    B --> C[/tributes]
    B --> D[/tributes/:id]
    B --> E[/tributes/bulk]
    C --> F[GET - List all tributes with advanced filtering]
    C --> G[POST - Create new tribute]
    D --> H[GET - Get tribute by ID]
    D --> I[PUT - Update tribute]
    D --> J[DELETE - Delete tribute]
    E --> K[POST - Bulk operations on tributes]
```

## Implementation Steps

### Step 1: Add Administrator Permission Check

Create a dedicated permission check function that ensures only administrators can access the admin endpoints:

```php
/**
 * Check if the current user is an administrator.
 * 
 * @return bool|WP_Error True if user is admin, WP_Error otherwise
 */
public function check_admin_permission() {
    if (!is_user_logged_in()) {
        return new WP_Error(
            'unauthorized', 
            __('You must be logged in.', 'tributestream-complete'), 
            array('status' => 401)
        );
    }
    
    if (!current_user_can('administrator')) {
        return new WP_Error(
            'forbidden', 
            __('You must be an administrator to access this endpoint.', 'tributestream-complete'), 
            array('status' => 403)
        );
    }
    
    return true;
}
```

### Step 2: Register Admin Routes

Add the following code to the `register_routes` method to register the new admin endpoints:

```php
// Admin routes
// GET /admin/tributes
register_rest_route($namespace, '/admin/tributes', array(
    array(
        'methods'  => 'GET',
        'callback' => array($this, 'get_admin_tributes'),
        'permission_callback' => array($this, 'check_admin_permission'),
    ),
));

// POST /admin/tributes
register_rest_route($namespace, '/admin/tributes', array(
    array(
        'methods'  => 'POST',
        'callback' => array($this, 'create_admin_tribute'),
        'permission_callback' => array($this, 'check_admin_permission'),
    ),
));

// GET /admin/tributes/{id}
register_rest_route($namespace, '/admin/tributes/(?P<id>\d+)', array(
    array(
        'methods'  => 'GET',
        'callback' => array($this, 'get_admin_tribute_by_id'),
        'permission_callback' => array($this, 'check_admin_permission'),
    ),
));

// PUT /admin/tributes/{id}
register_rest_route($namespace, '/admin/tributes/(?P<id>\d+)', array(
    array(
        'methods'  => 'PUT',
        'callback' => array($this, 'update_admin_tribute'),
        'permission_callback' => array($this, 'check_admin_permission'),
    ),
));

// DELETE /admin/tributes/{id}
register_rest_route($namespace, '/admin/tributes/(?P<id>\d+)', array(
    array(
        'methods'  => 'DELETE',
        'callback' => array($this, 'delete_admin_tribute'),
        'permission_callback' => array($this, 'check_admin_permission'),
    ),
));

// POST /admin/tributes/bulk
register_rest_route($namespace, '/admin/tributes/bulk', array(
    array(
        'methods'  => 'POST',
        'callback' => array($this, 'bulk_admin_tribute_operations'),
        'permission_callback' => array($this, 'check_admin_permission'),
    ),
));
```

### Step 3: Implement GET Admin Tributes with Advanced Filtering

Create a method to handle the GET request for listing tributes with advanced filtering and pagination:

```php
/**
 * GET /admin/tributes - Get all tributes with advanced filtering
 * 
 * @param WP_REST_Request $request The request object
 * @return array Response data
 */
public function get_admin_tributes($request) {
    global $wpdb;

    // Pagination parameters
    $page = isset($request['page']) ? max(1, intval($request['page'])) : 1;
    $per_page = isset($request['per_page']) ? max(1, intval($request['per_page'])) : 10;
    
    // Sorting parameters
    $sort_by = isset($request['sort_by']) ? sanitize_sql_orderby($request['sort_by']) : 'created_at';
    $sort_order = isset($request['sort_order']) && strtolower($request['sort_order']) === 'asc' ? 'ASC' : 'DESC';
    
    // Ensure sort_by is a valid column
    $valid_columns = array('id', 'user_id', 'loved_one_name', 'slug', 'created_at', 'updated_at', 'number_of_streams');
    if (!in_array($sort_by, $valid_columns)) {
        $sort_by = 'created_at';
    }
    
    $offset = ($page - 1) * $per_page;
    
    // Build WHERE clause
    $where_clause = 'WHERE 1=1';
    $params = array();
    
    // Search filter
    if (isset($request['search']) && !empty($request['search'])) {
        $search_like = '%' . $wpdb->esc_like($request['search']) . '%';
        $where_clause .= " AND (loved_one_name LIKE %s OR slug LIKE %s)";
        $params[] = $search_like;
        $params[] = $search_like;
    }
    
    // User ID filter
    if (isset($request['user_id']) && intval($request['user_id']) > 0) {
        $where_clause .= " AND user_id = %d";
        $params[] = intval($request['user_id']);
    }
    
    // Date range filters
    if (isset($request['date_from']) && !empty($request['date_from'])) {
        $where_clause .= " AND created_at >= %s";
        $params[] = sanitize_text_field($request['date_from']);
    }
    
    if (isset($request['date_to']) && !empty($request['date_to'])) {
        $where_clause .= " AND created_at <= %s";
        $params[] = sanitize_text_field($request['date_to']);
    }
    
    // Stream count filters
    if (isset($request['min_streams']) && intval($request['min_streams']) >= 0) {
        $where_clause .= " AND number_of_streams >= %d";
        $params[] = intval($request['min_streams']);
    }
    
    if (isset($request['max_streams']) && intval($request['max_streams']) >= 0) {
        $where_clause .= " AND number_of_streams <= %d";
        $params[] = intval($request['max_streams']);
    }

    // Count total
    $sql_count = "SELECT COUNT(*) FROM {$this->table_name} $where_clause";
    $total_items = $wpdb->get_var($wpdb->prepare($sql_count, $params));

    // Query tributes
    $sql_data = "SELECT * FROM {$this->table_name} $where_clause ORDER BY $sort_by $sort_order LIMIT %d, %d";
    $params_data = array_merge($params, array($offset, $per_page));
    $results = $wpdb->get_results($wpdb->prepare($sql_data, $params_data), ARRAY_A);

    $total_pages = ceil($total_items / $per_page);

    return array(
        'tributes'      => $results ? $results : array(),
        'total_pages'   => $total_pages,
        'total_items'   => (int) $total_items,
        'current_page'  => (int) $page,
        'per_page'      => (int) $per_page
    );
}
```

### Step 4: Implement Create Admin Tribute

Create a method to handle the POST request for creating a new tribute:

```php
/**
 * POST /admin/tributes - Create a new tribute as administrator
 * 
 * @param WP_REST_Request $request The request object
 * @return array|WP_Error Response data or error
 */
public function create_admin_tribute($request) {
    global $wpdb;
    $body = json_decode($request->get_body(), true);

    // Required fields
    $required_fields = array('user_id', 'loved_one_name', 'phone_number');
    foreach ($required_fields as $field) {
        if (!isset($body[$field]) || empty($body[$field])) {
            return new WP_Error(
                'missing_fields', 
                sprintf(__('Missing required field: %s', 'tributestream-complete'), $field), 
                array('status' => 400)
            );
        }
    }

    // Prepare data
    $user_id = intval($body['user_id']);
    $loved_one_name = sanitize_text_field($body['loved_one_name']);

    $slug = isset($body['slug']) && !empty($body['slug'])
        ? sanitize_title($body['slug'])
        : sanitize_title($loved_one_name);

    $custom_html = isset($body['custom_html']) ? wp_kses_post($body['custom_html']) : '';
    $phone_number = sanitize_text_field($body['phone_number']);
    $number_of_streams = isset($body['number_of_streams']) ? intval($body['number_of_streams']) : 0;

    // Insert tribute
    $inserted = $wpdb->insert($this->table_name, array(
        'user_id' => $user_id,
        'loved_one_name' => $loved_one_name,
        'slug' => $slug,
        'custom_html' => $custom_html,
        'phone_number' => $phone_number,
        'number_of_streams' => $number_of_streams,
        'created_at' => current_time('mysql'),
        'updated_at' => current_time('mysql'),
    ));

    if ($inserted === false) {
        return new WP_Error(
            'db_insert_error', 
            __('Failed to insert tribute.', 'tributestream-complete'), 
            array('status' => 500)
        );
    }

    $tribute_id = $wpdb->insert_id;

    // If extended_data is provided, store in user meta
    if (isset($body['extended_data'])) {
        $meta_key = 'tributestream_extended_data_' . $tribute_id;
        update_user_meta($user_id, $meta_key, $body['extended_data']);
    }

    return array(
        'success' => true,
        'id'      => $tribute_id,
        'slug'    => $slug
    );
}
```

### Step 5: Implement Get Admin Tribute by ID

Create a method to handle the GET request for retrieving a specific tribute:

```php
/**
 * GET /admin/tributes/{id} - Get a specific tribute by ID
 * 
 * @param WP_REST_Request $request The request object
 * @return array|WP_Error Tribute data or error
 */
public function get_admin_tribute_by_id($request) {
    $id = intval($request['id']);
    $tribute = $this->fetch_tribute_by_id($id);
    
    if (!$tribute) {
        return new WP_Error(
            'not_found', 
            __('Tribute not found.', 'tributestream-complete'), 
            array('status' => 404)
        );
    }
    
    return $tribute;
}
```

### Step 6: Implement Update Admin Tribute

Create a method to handle the PUT request for updating a tribute:

```php
/**
 * PUT /admin/tributes/{id} - Update a specific tribute
 * 
 * @param WP_REST_Request $request The request object
 * @return array|WP_Error Response data or error
 */
public function update_admin_tribute($request) {
    global $wpdb;
    $id = intval($request['id']);
    $body = json_decode($request->get_body(), true);

    // Check if tribute exists
    $tribute = $this->fetch_tribute_by_id($id);
    if (!$tribute) {
        return new WP_Error(
            'not_found', 
            __('Tribute not found.', 'tributestream-complete'), 
            array('status' => 404)
        );
    }

    // Filter updatable fields
    $fields = array('loved_one_name', 'slug', 'custom_html', 'phone_number', 'number_of_streams', 'user_id');
    $data = array();
    
    foreach ($fields as $f) {
        if (isset($body[$f])) {
            switch ($f) {
                case 'loved_one_name':
                    $data[$f] = sanitize_text_field($body[$f]);
                    break;
                case 'slug':
                    $data[$f] = sanitize_title($body[$f]);
                    break;
                case 'custom_html':
                    $data[$f] = wp_kses_post($body[$f]);
                    break;
                case 'phone_number':
                    $data[$f] = sanitize_text_field($body[$f]);
                    break;
                case 'number_of_streams':
                    $data[$f] = intval($body[$f]);
                    break;
                case 'user_id':
                    $data[$f] = intval($body[$f]);
                    break;
            }
        }
    }

    if (empty($data)) {
        return new WP_Error(
            'no_update', 
            __('No valid fields to update.', 'tributestream-complete'), 
            array('status' => 400)
        );
    }

    $data['updated_at'] = current_time('mysql');

    $updated = $wpdb->update($this->table_name, $data, array('id' => $id));
    
    if ($updated === false) {
        return new WP_Error(
            'db_update_error', 
            __('Failed to update tribute.', 'tributestream-complete'), 
            array('status' => 500)
        );
    }

    // If extended_data is provided, update in user meta
    if (isset($body['extended_data'])) {
        $user_id = isset($data['user_id']) ? $data['user_id'] : $tribute['user_id'];
        $meta_key = 'tributestream_extended_data_' . $id;
        update_user_meta($user_id, $meta_key, $body['extended_data']);
    }

    return array(
        'success' => true, 
        'updated_rows' => $updated
    );
}
```

### Step 7: Implement Delete Admin Tribute

Create a method to handle the DELETE request for removing a tribute:

```php
/**
 * DELETE /admin/tributes/{id} - Delete a specific tribute
 * 
 * @param WP_REST_Request $request The request object
 * @return array|WP_Error Response data or error
 */
public function delete_admin_tribute($request) {
    global $wpdb;
    $id = intval($request['id']);

    // Check if tribute exists
    $tribute = $this->fetch_tribute_by_id($id);
    if (!$tribute) {
        return new WP_Error(
            'not_found', 
            __('Tribute not found.', 'tributestream-complete'), 
            array('status' => 404)
        );
    }

    // Delete the tribute
    $deleted = $wpdb->delete($this->table_name, array('id' => $id));
    
    if ($deleted === false) {
        return new WP_Error(
            'db_delete_error', 
            __('Failed to delete tribute.', 'tributestream-complete'), 
            array('status' => 500)
        );
    }

    // Also delete associated extended data
    $user_id = $tribute['user_id'];
    $meta_key = 'tributestream_extended_data_' . $id;
    delete_user_meta($user_id, $meta_key);

    return array(
        'success' => true, 
        'deleted_rows' => $deleted
    );
}
```

### Step 8: Implement Bulk Operations

Create a method to handle bulk operations on multiple tributes:

```php
/**
 * POST /admin/tributes/bulk - Perform bulk operations on tributes
 * 
 * @param WP_REST_Request $request The request object
 * @return array|WP_Error Response data or error
 */
public function bulk_admin_tribute_operations($request) {
    global $wpdb;
    $body = json_decode($request->get_body(), true);
    
    if (!isset($body['operation']) || !isset($body['tribute_ids']) || !is_array($body['tribute_ids'])) {
        return new WP_Error(
            'missing_fields', 
            __('Missing required fields: operation and tribute_ids array', 'tributestream-complete'), 
            array('status' => 400)
        );
    }
    
    $operation = sanitize_text_field($body['operation']);
    $tribute_ids = array_map('intval', $body['tribute_ids']);
    
    if (empty($tribute_ids)) {
        return new WP_Error(
            'empty_ids', 
            __('No tribute IDs provided', 'tributestream-complete'), 
            array('status' => 400)
        );
    }
    
    // Prepare placeholders for the IN clause
    $placeholders = implode(',', array_fill(0, count($tribute_ids), '%d'));
    
    switch ($operation) {
        case 'delete':
            // First, get all tributes to delete their extended data later
            $tributes = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT id, user_id FROM {$this->table_name} WHERE id IN ($placeholders)",
                    $tribute_ids
                ),
                ARRAY_A
            );
            
            // Delete tributes
            $result = $wpdb->query(
                $wpdb->prepare(
                    "DELETE FROM {$this->table_name} WHERE id IN ($placeholders)",
                    $tribute_ids
                )
            );
            
            if ($result === false) {
                return new WP_Error(
                    'db_error', 
                    __('Database error while deleting tributes', 'tributestream-complete'), 
                    array('status' => 500)
                );
            }
            
            // Delete associated extended data
            if (!empty($tributes)) {
                foreach ($tributes as $tribute) {
                    $meta_key = 'tributestream_extended_data_' . $tribute['id'];
                    delete_user_meta($tribute['user_id'], $meta_key);
                }
            }
            
            return array(
                'success' => true,
                'message' => sprintf(__('%d tributes deleted successfully', 'tributestream-complete'), $result),
                'affected_rows' => $result
            );
            
        case 'update':
            if (!isset($body['data']) || !is_array($body['data'])) {
                return new WP_Error(
                    'missing_data', 
                    __('Missing data for update operation', 'tributestream-complete'), 
                    array('status' => 400)
                );
            }
            
            // Filter updatable fields
            $fields = array('loved_one_name', 'slug', 'custom_html', 'phone_number', 'number_of_streams', 'user_id');
            $data = array();
            
            foreach ($fields as $f) {
                if (isset($body['data'][$f])) {
                    switch ($f) {
                        case 'loved_one_name':
                            $data[$f] = sanitize_text_field($body['data'][$f]);
                            break;
                        case 'slug':
                            $data[$f] = sanitize_title($body['data'][$f]);
                            break;
                        case 'custom_html':
                            $data[$f] = wp_kses_post($body['data'][$f]);
                            break;
                        case 'phone_number':
                            $data[$f] = sanitize_text_field($body['data'][$f]);
                            break;
                        case 'number_of_streams':
                            $data[$f] = intval($body['data'][$f]);
                            break;
                        case 'user_id':
                            $data[$f] = intval($body['data'][$f]);
                            break;
                    }
                }
            }
            
            if (empty($data)) {
                return new WP_Error(
                    'no_update', 
                    __('No valid fields to update', 'tributestream-complete'), 
                    array('status' => 400)
                );
            }
            
            $data['updated_at'] = current_time('mysql');
            
            // Update all tributes
            $affected_rows = 0;
            foreach ($tribute_ids as $id) {
                $updated = $wpdb->update($this->table_name, $data, array('id' => $id));
                if ($updated !== false) {
                    $affected_rows += $updated;
                }
                
                // If extended_data is provided, update for each tribute
                if (isset($body['data']['extended_data'])) {
                    // Get the tribute to find its user_id
                    $tribute = $this->fetch_tribute_by_id($id);
                    if ($tribute) {
                        $user_id = isset($data['user_id']) ? $data['user_id'] : $tribute['user_id'];
                        $meta_key = 'tributestream_extended_data_' . $id;
                        update_user_meta($user_id, $meta_key, $body['data']['extended_data']);
                    }
                }
            }
            
            return array(
                'success' => true,
                'message' => sprintf(__('%d tributes updated successfully', 'tributestream-complete'), $affected_rows),
                'affected_rows' => $affected_rows
            );
            
        default:
            return new WP_Error(
                'invalid_operation', 
                __('Invalid operation. Supported operations: delete, update', 'tributestream-complete'), 
                array('status' => 400)
            );
    }
}
```

## API Documentation

### GET /tributestream/v1/admin/tributes

Lists all tributes with advanced filtering and pagination.

**Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)
- `search`: Search term for loved_one_name or slug
- `user_id`: Filter by user ID
- `sort_by`: Field to sort by (default: created_at)
- `sort_order`: asc or desc (default: desc)
- `date_from`: Filter by created_at date (from)
- `date_to`: Filter by created_at date (to)
- `min_streams`: Minimum number of streams
- `max_streams`: Maximum number of streams

**Response:**
```json
{
  "tributes": [
    {
      "id": 1,
      "user_id": 5,
      "loved_one_name": "John Doe",
      "slug": "john-doe",
      "created_at": "2023-01-01 12:00:00",
      "updated_at": "2023-01-02 14:30:00",
      "custom_html": "<p>Custom tribute content</p>",
      "phone_number": "555-123-4567",
      "number_of_streams": 42
    }
  ],
  "total_pages": 5,
  "total_items": 48,
  "current_page": 1,
  "per_page": 10
}
```

### POST /tributestream/v1/admin/tributes

Creates a new tribute.

**Request Body:**
```json
{
  "user_id": 5,
  "loved_one_name": "Jane Smith",
  "slug": "jane-smith",
  "custom_html": "<p>Custom tribute content</p>",
  "phone_number": "555-987-6543",
  "number_of_streams": 0,
  "extended_data": {
    "birth_date": "1950-05-15",
    "death_date": "2023-02-20",
    "biography": "Jane was a beloved mother and grandmother..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "id": 49,
  "slug": "jane-smith"
}
```

### GET /tributestream/v1/admin/tributes/{id}

Gets a specific tribute by ID.

**Response:**
```json
{
  "id": 49,
  "user_id": 5,
  "loved_one_name": "Jane Smith",
  "slug": "jane-smith",
  "created_at": "2023-04-20 10:15:00",
  "updated_at": "2023-04-20 10:15:00",
  "custom_html": "<p>Custom tribute content</p>",
  "phone_number": "555-987-6543",
  "number_of_streams": 0
}
```

### PUT /tributestream/v1/admin/tributes/{id}

Updates a specific tribute.

**Request Body:**
```json
{
  "loved_one_name": "Jane Smith-Johnson",
  "number_of_streams": 5,
  "extended_data": {
    "biography": "Jane was a beloved mother, grandmother, and community leader..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "updated_rows": 1
}
```

### DELETE /tributestream/v1/admin/tributes/{id}

Deletes a specific tribute.

**Response:**
```json
{
  "success": true,
  "deleted_rows": 1
}
```

### POST /tributestream/v1/admin/tributes/bulk

Performs bulk operations on multiple tributes.

**Request Body (Delete):**
```json
{
  "operation": "delete",
  "tribute_ids": [45, 46, 47]
}
```

**Request Body (Update):**
```json
{
  "operation": "update",
  "tribute_ids": [48, 49, 50],
  "data": {
    "custom_html": "<p>Updated tribute content</p>",
    "number_of_streams": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 tributes updated successfully",
  "affected_rows": 3
}
```

## Testing Plan

1. Test administrator authentication and authorization
   - Verify only administrators can access the endpoints
   - Verify non-administrators receive appropriate error responses

2. Test each CRUD operation individually
   - Create: Test creating tributes with valid and invalid data
   - Read: Test retrieving individual tributes and lists with various filters
   - Update: Test updating tributes with valid and invalid data
   - Delete: Test deleting tributes and verify they're removed

3. Test filtering and pagination
   - Verify all filter parameters work correctly
   - Test pagination with different page sizes
   - Test sorting with different columns and directions

4. Test bulk operations
   - Test bulk delete with various ID combinations
   - Test bulk update with different fields
   - Test error handling for invalid operations

5. Verify error handling
   - Test with missing required fields
   - Test with invalid data types
   - Test with non-existent tribute IDs