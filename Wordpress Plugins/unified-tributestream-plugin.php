<?php
/*
Plugin Name: Unified Tributestream Plugin
*/
// **************************************************************
// ::Set Wordpress Database Connection via wpdb class.
// **************************************************************
// An instantiated wpdb class can talk to any number of tables, 
// but only to one database at a time. 
// Ref: https://developer.wordpress.org/reference/classes/wpdb/
// **************************************************************
global $wpdb;
// **************************************************************
// ::Beginning of the plugin, initalize the rest api.
// **************************************************************
// To make this available via the API, we need to register a
// route. This tells the API to respond to a given request with our
// function. We do this through a function called register_rest_route, 
// which should be called in a callback on rest_api_init to avoid doing 
// extra work when the API isn’t loaded.
// https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/
// **************************************************************
add_action ('rest_api_init', function() {

    register_rest_route('tributestream/v1', '/tribute', [
        'methods' => 'POST',
        'callback' => 'create_tribute',
        'permission_callback' => 'is_user_logged_in',
    ]);

    //Need to add GET route for this soon.

    // Register user registration route
    register_rest_route('tributestream/v1', '/register', [
        'methods' => ['POST', 'GET'],
        'callback' => 'handle_tributestream_registration',
        'permission_callback' => '__return_true'
    ]);

    register_rest_route('tributestream/v1', '/saveCart', [
        'methods' => ['POST', 'GET'],
        'callback' => 'handle_livestream_cart',
        'permission_callback' => 'is_user_logged_in'
    ]);

    register_rest_route('tributestream/v1', '/family_poc_profile', [
        'methods' => ['POST', 'GET'],
        'callback' => 'handle_family_poc_profile',
        'permission_callback' => 'is_user_logged_in'
    ]);

    // User role management endpoints
    register_rest_route('tributestream/v1', '/users/(?P<id>\d+)/role', [
        'methods' => 'GET',
        'callback' => 'get_user_role',
        'permission_callback' => 'is_user_logged_in'
    ]);

    register_rest_route('tributestream/v1', '/users/(?P<id>\d+)/role', [
        'methods' => 'PUT',
        'callback' => 'update_user_role',
        'permission_callback' => 'check_admin_permission'
    ]);

// **************************************************************
// ::End of registering rest routes
// **************************************************************
});

// **************************************************************
// ::Start of custom functions, which routes will be calling.
// **************************************************************

// **************************************************************
// ::Start of rough functions
// **************************************************************
// Establish family_poc_profile
function handle_family_poc_profile($request) {
    global $wpdb;
    $params = $request->get_json_params();
    $user_id = $params['user_id'];
    
    // Get phone from tributes if available
    $phone = isset($params['phone']) ? sanitize_text_field($params['phone']) : '';
    
    // Set timestamps
    $created_at = current_time('mysql');
    $updated_at = current_time('mysql');
    
    // Handle cart data if provided
    $incomplete_cart = isset($params['cart_data']) ? json_encode($params['cart_data']) : '';
    
    // TODO: Implement database operations here
    
    return new WP_REST_Response([
        'success' => true,
        'user_id' => $user_id,
        'message' => 'Profile data processed'
    ], 200);
}

// handle livestream cart from calculator page
function handle_livestream_cart($request) {
    global $wpdb;
    $params = $request->get_json_params();
    $user_id = $params['user_id'];
    $cart_items = $params['cart_items'];
    
    // TODO: Implement database operations for cart items
    // For now, just return a success response
    
    return new WP_REST_Response([
        'success' => true,
        'user_id' => $user_id,
        'message' => 'Cart saved successfully',
        'items_count' => count($cart_items)
    ], 200);
}

// **************************************************************
// ::End rough functions
// **************************************************************
// Create tribute
function create_tribute($request) {
    global $wpdb;
   $params = $request->get_json_params();
   $user_id = $params['user_id'];
   $loved_one_name = sanitize_text_field($params['loved_one_name']);
   $slug = sanitize_text_field($params['slug']);
   
    $result = $wpdb->insert(
       'wpa2_tributes',
       array(
           'user_id' => $user_id,
           'loved_one_name' => $loved_one_name,
           'slug' => $slug
       ),
       array('%d', '%s', '%s')
   );
     if ($result === false) {
       return new WP_Error('db_insert_error', 'Failed to insert tribute', array('status' => 500));
   }
   
       return new WP_REST_Response(array('message' => 'Tribute created successfully', 'id' => $wpdb->insert_id), 200);

}

// Function to handle user registration
function handle_tributestream_registration($request) {
    error_log('Registration attempt started');
    
    $params = $request->get_json_params();
    
    $username = sanitize_user($params['username']);
    $email = sanitize_email($params['email']);
    $password = $params['password'];
    $meta = $params['meta'];
    
    $user_id = wp_create_user($username, $password, $email);
    
    if (is_wp_error($user_id)) {
        error_log('Registration failed: ' . $user_id->get_error_message());
        return new WP_Error('registration_failed', $user_id->get_error_message(), ['status' => 400]);
    }
    
    update_user_meta($user_id, 'full_name', sanitize_text_field($meta['full_name']));
    update_user_meta($user_id, 'loved_one_name', sanitize_text_field($meta['loved_one_name']));
    update_user_meta($user_id, 'phone', sanitize_text_field($meta['phone']));
    
    return new WP_REST_Response(['user_id' => $user_id, 'message' => 'User registered successfully'], 201);
}

// Function to check if user has admin permission
function check_admin_permission() {
    if (!is_user_logged_in()) {
        return false;
    }
    
    $user = wp_get_current_user();
    return in_array('administrator', (array) $user->roles);
}

// Function to get user role
function get_user_role($request) {
    $user_id = $request['id'];
    $user = get_user_by('ID', $user_id);
    
    if (!$user) {
        return new WP_Error('user_not_found', 'User not found', ['status' => 404]);
    }
    
    // Get user roles
    $roles = $user->roles;
    
    // Get user capabilities
    $capabilities = [];
    if (isset($user->allcaps)) {
        $capabilities = $user->allcaps;
    }
    
    // Get user type from meta
    $user_type = get_user_meta($user_id, 'user_type', true);
    
    return new WP_REST_Response([
        'user_id' => $user_id,
        'roles' => $roles,
        'capabilities' => $capabilities,
        'user_type' => $user_type
    ], 200);
}

// Function to update user role
function update_user_role($request) {
    $user_id = $request['id'];
    $user = get_user_by('ID', $user_id);
    
    if (!$user) {
        return new WP_Error('user_not_found', 'User not found', ['status' => 404]);
    }
    
    $params = $request->get_json_params();
    
    if (empty($params['role'])) {
        return new WP_Error('missing_role', 'Role is required', ['status' => 400]);
    }
    
    $role = sanitize_text_field($params['role']);
    
    // Validate role
    $valid_roles = ['administrator', 'editor', 'author', 'subscriber'];
    // Map user_type to WordPress roles
    $role_mapping = [
        'admin' => 'administrator',
        'funeral_director' => 'editor',
        'family_member' => 'author',
        'guest' => 'subscriber'
    ];
    
    // If a user_type was provided, map it to the corresponding WordPress role
    if (isset($role_mapping[$role])) {
        $role = $role_mapping[$role];
    }
    
    if (!in_array($role, $valid_roles)) {
        return new WP_Error(
            'invalid_role',
            'Invalid role. Must be one of: ' . implode(', ', $valid_roles),
            ['status' => 400]
        );
    }
    
    // Update user role
    $user->set_role($role);
    
    // Update user_type meta if provided
    if (isset($params['user_type'])) {
        $user_type = sanitize_text_field($params['user_type']);
        update_user_meta($user_id, 'user_type', $user_type);
    } else {
        // Derive user_type from role if not provided
        $reverse_mapping = array_flip($role_mapping);
        if (isset($reverse_mapping[$role])) {
            update_user_meta($user_id, 'user_type', $reverse_mapping[$role]);
        }
    }
    
    // Log the role change
    error_log(sprintf('User role updated: User ID %d, New role: %s', $user_id, $role));
    
    return new WP_REST_Response([
        'user_id' => $user_id,
        'role' => $role,
        'message' => 'User role updated successfully'
    ], 200);
}
