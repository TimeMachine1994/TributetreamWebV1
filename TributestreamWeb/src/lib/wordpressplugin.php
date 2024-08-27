<?php
/**
 * Plugin Name: Custom JWT and Nonce User and Page Creator
 * Description: Custom routes for user registration and page creation using JWT authentication and nonces
 * Version: 1.3
 * Author: Your Name
 */

// Enqueue necessary scripts
wp_enqueue_script('wp-api');

// Register routes
add_action('rest_api_init', function () {
    // User registration route
    register_rest_route('my-custom-plugin/v1', '/register', array(
        'methods' => 'POST',
        'callback' => 'custom_register_user',
        'permission_callback' => '__return_true'
    ));

    // Page creation route
    register_rest_route('my-custom-plugin/v1', '/create-page', array(
        'methods' => 'POST',
        'callback' => 'custom_create_page',
        'permission_callback' => 'custom_jwt_authenticate'
    ));

    // Nonce retrieval route
    register_rest_route('my-custom-plugin/v1', '/get-nonce', array(
        'methods' => 'GET',
        'callback' => 'custom_get_nonce',
        'permission_callback' => 'custom_jwt_authenticate'
    ));
});

// User registration function
function custom_register_user($request) {
    $username = sanitize_user($request['username']);
    $email = sanitize_email($request['email']);
    $password = $request['password'];

    // Validate input
    if (empty($username) || empty($email) || empty($password)) {
        return new WP_Error('missing_fields', 'Please provide all required fields', array('status' => 400));
    }

    // Check if username or email already exists
    if (username_exists($username)) {
        return new WP_Error('username_exists', 'This username is already taken', array('status' => 400));
    }
    if (email_exists($email)) {
        return new WP_Error('email_exists', 'This email is already registered', array('status' => 400));
    }

    // Create user
    $user_id = wp_create_user($username, $password, $email);

    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', $user_id->get_error_message(), array('status' => 500));
    }

    return new WP_REST_Response(array('user_id' => $user_id), 201);
}

// Page creation function
function custom_create_page($request) {
    // Verify nonce
    $nonce = $request->get_header('X-WP-Nonce');
    if (!wp_verify_nonce($nonce, 'wp_rest')) {
        return new WP_Error('invalid_nonce', 'Invalid nonce', array('status' => 403));
    }

    $title = sanitize_text_field($request['title']);
    $content = wp_kses_post($request['content']);

    if (empty($title)) {
        return new WP_Error('missing_title', 'Page title is required', array('status' => 400));
    }

    $page_id = wp_insert_post(array(
        'post_type' => 'page',
        'post_title' => $title,
        'post_content' => $content,
        'post_status' => 'publish',
        'meta_input'   => array(
            '_wp_page_template' => 'template-celebration.php', // Assigns this custom template
        ),
    ));

    if (is_wp_error($page_id)) {
        return new WP_Error('page_creation_failed', $page_id->get_error_message(), array('status' => 500));
    }

    return new WP_REST_Response(array('page_id' => $page_id), 201);
}

// JWT authentication function
function custom_jwt_authenticate($request) {
    $auth_header = $request->get_header('Authorization');

    if (!$auth_header || strpos($auth_header, 'Bearer') === false) {
        error_log('JWT Auth: No valid Authorization header found');
        return new WP_Error('jwt_auth_no_auth_header', 'Authorization header not found or invalid.', array('status' => 403));
    }

    $token = trim(str_replace('Bearer', '', $auth_header));
    error_log('JWT Auth: Attempting to validate token: ' . substr($token, 0, 10) . '...');

    // Use the JWT Auth plugin's validation
    $validate_request = new WP_REST_Request('POST', '/jwt-auth/v1/token/validate');
    $validate_request->set_header('Authorization', 'Bearer ' . $token);
    $response = rest_do_request($validate_request);

    if (is_wp_error($response)) {
        error_log('JWT Auth: WP_Error in validation response: ' . $response->get_error_message());
        return new WP_Error('jwt_auth_invalid_token', 'Token validation failed: ' . $response->get_error_message(), array('status' => 403));
    }

    if ($response->get_status() !== 200) {
        $body = $response->get_data();
        $error_message = isset($body['message']) ? $body['message'] : 'Unknown error';
        error_log('JWT Auth: Non-200 status in validation response. Status: ' . $response->get_status() . ', Message: ' . $error_message);
        return new WP_Error('jwt_auth_invalid_token', 'Token validation failed: ' . $error_message, array('status' => 403));
    }

    error_log('JWT Auth: Token validated successfully');
    return true;
}

// Nonce retrieval function
function custom_get_nonce($request) {
    error_log('custom_get_nonce endpoint reached');
    
    $nonce = wp_create_nonce('wp_rest');
    return new WP_REST_Response(array('nonce' => $nonce), 200);
}

// Add CORS headers
function add_cors_headers() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, X-WP-Nonce");
    if ('OPTIONS' == $_SERVER['REQUEST_METHOD']) {
        status_header(200);
        exit();
    }
}
add_action('init', 'add_cors_headers');
