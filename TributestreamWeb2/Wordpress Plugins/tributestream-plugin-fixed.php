<?php
/*
/**
 * Plugin Name: Tributestream API
 * Description: Adds REST API endpoints for managing data. We use JWT Auth for authentication.
 * Version: 1.2
 * Author: Your Name
 */

// Register activation hook for database setup
register_activation_hook(__FILE__, 'tributestream_activate');

function tributestream_activate() {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'tributes';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        loved_one_name varchar(255) NOT NULL,
        slug varchar(255) NOT NULL,
        created_at datetime NOT NULL,
        updated_at datetime NOT NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY slug (slug)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}

// Register REST API endpoints
add_action('rest_api_init', function () {
    // Tribute endpoints
    register_rest_route('tributestream/v1', '/tribute', [
        'methods' => 'POST',
        'callback' => 'handle_tributes_entry',
        'permission_callback' => 'verify_jwt_cookie',
    ]);
    
    register_rest_route('tributestream/v1', '/tribute/(?P<slug>[a-zA-Z0-9-_]+)', [
        'methods' => 'GET',
        'callback' => 'get_tribute_by_slug',
        'permission_callback' => '__return_true',
    ]);

    // User meta endpoints
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
                        'validate_callback' => function($param) {
                            return is_numeric($param);
                        },
                    ),
                ),
            ),
        )
    );

    // Registration endpoint
    register_rest_route('tributestream/v1', '/register', [
        'methods' => 'POST',
        'callback' => 'handle_tributestream_registration',
        'permission_callback' => '__return_true'
    ]);
});

// Tribute functions
function get_tribute_by_slug($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributes';
    $slug = sanitize_title($request['slug']);

    $query = $wpdb->prepare("SELECT * FROM $table_name WHERE slug = %s", $slug);
    $result = $wpdb->get_row($query, ARRAY_A);

    if (!$result) {
        return new WP_REST_Response(['message' => 'Tribute not found'], 404);
    }

    return new WP_REST_Response($result, 200);
}

function handle_tributes_entry($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributes';
    
    // Get and validate request parameters
    $params = $request->get_json_params();
    error_log('Received tribute payload: ' . json_encode($params));

    if (!isset($params['user_id']) || !isset($params['loved_one_name']) || !isset($params['slug'])) {
        return new WP_Error('missing_fields', 'Required fields are missing.', ['status' => 400]);
    }

    $data = [
        'user_id' => intval($params['user_id']),
        'loved_one_name' => sanitize_text_field($params['loved_one_name']),
        'slug' => sanitize_title($params['slug']),
        'created_at' => current_time('mysql', 1),
        'updated_at' => current_time('mysql', 1)
    ];

    error_log('Prepared data for insertion: ' . json_encode($data));

    // Check if slug already exists
    $existing = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE slug = %s", $data['slug']));
    if ($existing > 0) {
        return new WP_Error('duplicate_slug', 'A tribute with this slug already exists.', ['status' => 409]);
    }

    // Insert the tribute
    $result = $wpdb->insert($table_name, $data);
    if ($result === false) {
        $wpdb_error = $wpdb->last_error;
        error_log('Database insert error: ' . $wpdb_error);
        return new WP_Error('db_insert_error', 'Failed to insert entry: ' . $wpdb_error, ['status' => 500]);
    }

    return new WP_REST_Response([
        'message' => 'Entry created successfully',
        'id' => $wpdb->insert_id,
        'slug' => $data['slug']
    ], 201);
}

// Authentication functions
function verify_jwt_cookie($request) {
    error_log('Attempting JWT authentication');
    $auth_header = $request->get_header('Authorization');

    if (!$auth_header || strpos($auth_header, 'Bearer') === false) {
        error_log('JWT Auth: No valid Authorization header found');
        return new WP_Error('jwt_auth_no_auth_header', 'Authorization header not found or invalid.', ['status' => 403]);
    }

    $token = trim(str_replace('Bearer', '', $auth_header));
    error_log('JWT Auth: Attempting to validate token: ' . substr($token, 0, 10) . '...');

    $validate_request = new WP_REST_Request('POST', '/jwt-auth/v1/token/validate');
    $validate_request->set_header('Authorization', 'Bearer ' . $token);
    $response = rest_do_request($validate_request);

    if (is_wp_error($response)) {
        error_log('JWT Auth: WP_Error in validation response: ' . $response->get_error_message());
        return new WP_Error('jwt_auth_invalid_token', 'Token validation failed: ' . $response->get_error_message(), ['status' => 403]);
    }

    if ($response->get_status() !== 200) {
        $body = $response->get_data();
        $error_message = isset($body['message']) ? $body['message'] : 'Unknown error';
        error_log('JWT Auth: Non-200 status in validation response. Status: ' . $response->get_status() . ', Message: ' . $error_message);
        return new WP_Error('jwt_auth_invalid_token', 'Token validation failed: ' . $error_message, ['status' => 403]);
    }

    error_log('JWT Auth: Token validated successfully');
    return true;
}

function custom_jwt_authenticate($request) {
    return verify_jwt_cookie($request); // Reuse the same JWT validation logic
}

// User meta functions
function ts_get_all_user_meta($request) {
    $user_id = $request->get_param('user_id');

    if (!get_userdata($user_id)) {
        return new WP_Error('user_not_found', 'The specified user ID does not exist.', ['status' => 404]);
    }

    global $wpdb;
    $table_name = $wpdb->usermeta;

    try {
        $query = $wpdb->prepare("SELECT meta_key, meta_value FROM $table_name WHERE user_id = %d", $user_id);
        $results = $wpdb->get_results($query, ARRAY_A);

        if ($results === false) {
            return new WP_Error('db_query_failed', 'An error occurred while querying the database.', ['status' => 500]);
        }

        if (empty($results)) {
            return new WP_Error('no_meta_found', 'No meta data found for the specified user.', ['status' => 404]);
        }

        return new WP_REST_Response([
            'success' => true,
            'user_id' => $user_id,
            'meta' => $results,
        ], 200);
    } catch (Exception $e) {
        return new WP_Error('unexpected_error', 'An unexpected error occurred: ' . $e->getMessage(), ['status' => 500]);
    }
}

function ts_store_user_meta($request) {
    $user_id = $request->get_param('user_id');
    $meta_key = $request->get_param('meta_key');
    $meta_value = $request->get_param('meta_value');

    $result = update_user_meta($user_id, $meta_key, $meta_value);

    if (false === $result) {
        return new WP_Error('meta_update_failed', 'Failed to update user meta data.', ['status' => 500]);
    }

    return new WP_REST_Response([
        'success' => true,
        'message' => 'User meta updated successfully.',
        'user_id' => $user_id,
        'meta_key' => $meta_key,
        'meta_value' => $meta_value
    ], 200);
}

// Registration function
function handle_tributestream_registration($request) {
    error_log('Registration attempt started');
    error_log('Request data: ' . json_encode($request->get_json_params()));
    
    $params = $request->get_json_params();
    
    if (!isset($params['username']) || !isset($params['email']) || !isset($params['password']) || !isset($params['meta'])) {
        return new WP_Error('missing_fields', 'Required fields are missing.', ['status' => 400]);
    }

    $username = sanitize_user($params['username']);
    $email = sanitize_email($params['email']);
    $password = $params['password'];
    $meta = $params['meta'];

    $user_id = wp_create_user($username, $password, $email);

    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', $user_id->get_error_message(), ['status' => 400]);
    }

    // Add custom user meta
    update_user_meta($user_id, 'full_name', sanitize_text_field($meta['full_name']));
    update_user_meta($user_id, 'loved_one_name', sanitize_text_field($meta['loved_one_name']));
    update_user_meta($user_id, 'phone', sanitize_text_field($meta['phone']));

    // Send welcome email
    wp_mail(
        $email,
        'Welcome to TributeStream',
        "Your account has been created.\nUsername: $username\nPassword: $password"
    );

    return new WP_REST_Response(['user_id' => $user_id], 201);
}
