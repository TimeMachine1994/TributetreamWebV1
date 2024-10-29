<?php

/**

 * Plugin Name: Custom JWT and Nonce User and Page Creator

 * Description: Custom routes for user registration and page creation using JWT authentication and nonces

 * Version: 1.3

 * Author: Your Name

 */









// Register routes

add_action('rest_api_init', function () {

    error_log('Registering custom routes');

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



    register_rest_route('my-custom-plugin/v1', '/send-email', array(

        'methods' => 'POST',

        'callback' => 'custom_send_registration_email',

        'permission_callback' => '__return_true',  // Adjust for security

    ));

    error_log('Custom routes registered successfully');



    register_rest_route('my-custom-plugin/v1', '/send-registration-email', array(

        'methods' => 'POST',

        'callback' => 'custom_send_registration_email',

        'permission_callback' => function () {

            return true; // Adjust this based on your security requirements

        }

    ));



    register_rest_route('my-custom-plugin/v1', '/get-user-data', array(

        'methods' => 'GET',

        'callback' => 'custom_get_user_data',

        'permission_callback' => 'custom_jwt_authenticate'

    ));

    

});



 // Add this function to your plugin file

function custom_get_user_data($request) {

    $user = wp_get_current_user();

    

    if (!$user->ID) {

        return new WP_Error('no_user', 'User not found', array('status' => 404));

    }



    $user_data = array(

        'id' => $user->ID,

        'name' => $user->display_name,

        'email' => $user->user_email,

        'preferences' => get_user_meta($user->ID, 'user_preferences', true) ?: array()

    );



    return new WP_REST_Response($user_data, 200);

}



// User registration function

function custom_register_user($request) {

    error_log('Attempting user registration');

    

    $username = sanitize_user($request['username']);

    $email = sanitize_email($request['email']);

    $password = $request['password'];



    // Validate input

    if (empty($username) || empty($email) || empty($password)) {

        error_log('Registration failed: Missing fields');

        return new WP_Error('missing_fields', 'Please provide all required fields', array('status' => 400));

    }



    // Check if username or email already exists

    if (username_exists($username)) {

        error_log('Registration failed: Username already exists');

        return new WP_Error('username_exists', 'This username is already taken', array('status' => 400));

    }

    if (email_exists($email)) {

        error_log('Registration failed: Email already exists');

        return new WP_Error('email_exists', 'This email is already registered', array('status' => 400));

    }



    // Create user

    $user_id = wp_create_user($username, $password, $email);



    if (is_wp_error($user_id)) {

        error_log('Registration failed: ' . $user_id->get_error_message());

        return new WP_Error('registration_failed', $user_id->get_error_message(), array('status' => 500));

    }



    error_log('User registered successfully. User ID: ' . $user_id);

    return new WP_REST_Response(array('user_id' => $user_id), 201);

}



// Page creation function

function custom_create_page($request) {

    error_log('Attempting page creation');

    // Verify nonce

    $nonce = $request->get_header('X-WP-Nonce');

    if (!wp_verify_nonce($nonce, 'wp_rest')) {

        error_log('Page creation failed: Invalid nonce');

        return new WP_Error('invalid_nonce', 'Invalid nonce', array('status' => 403));

    }



    $title = sanitize_text_field($request['title']);

    $content = wp_kses_post($request['content']);



    if (empty($title)) {

        error_log('Page creation failed: Missing title');

        return new WP_Error('missing_title', 'Page title is required', array('status' => 400));

    }



    $page_id = wp_insert_post(array(

        'post_type' => 'page',

        'post_title' => $title,

        'post_content' => $content,

        'post_status' => 'publish',

        'post_name' => sanitize_title('celebration-of-life-for-' . $title),



        'meta_input'   => array(

            '_wp_page_template' => 'template-celebration.php',

            'hide_nav_bar' => true,

        ),

    ));



    if (is_wp_error($page_id)) {

        error_log('Page creation failed: ' . $page_id->get_error_message());

        return new WP_Error('page_creation_failed', $page_id->get_error_message(), array('status' => 500));

    }



    error_log('Page created successfully. Page ID: ' . $page_id);

    return new WP_REST_Response(array('page_id' => $page_id), 201);

}



// JWT authentication function

function custom_jwt_authenticate($request) {

    error_log('Attempting JWT authentication');

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

    error_log('Nonce generated: ' . $nonce);

    return new WP_REST_Response(array('nonce' => $nonce), 200);

}



// Add CORS headers

function add_cors_headers() {

    // Add CORS headers to REST API requests

    add_action('rest_api_init', function() {

        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');

        add_filter('rest_pre_serve_request', function($value) {

            header("Access-Control-Allow-Origin: http://localhost:5173");

            header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");

            header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, X-WP-Nonce");

            header("Access-Control-Allow-Credentials: true");



            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

                status_header(200);

                exit();

            }



            return $value;

        });

    }, 15);



    // Add CORS headers to non-REST API requests

    add_action('init', function() {

        header("Access-Control-Allow-Origin: *");

        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");

        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, X-WP-Nonce");

        header("Access-Control-Allow-Credentials: true");



        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

            status_header(200);

            exit();

        }

    });

}



add_action('rest_api_init', 'add_cors_headers', 9999);



// ADD EMAIL ACCOUNT FUNCTIONALITY

// Email sending function

function custom_send_registration_email($request) {

    error_log('Sending registration email');



    // Get the POST data from the request

    $params = $request->get_json_params();

    $username = sanitize_text_field($params['username']);

    $email = sanitize_email($params['email']);

    $generatedPassword = sanitize_text_field($params['password']);



    // Prepare the email content

    $subject = 'Welcome to Your Site';

    $message = "Hello $username,\n\n";

    $message .= "Thank you for registering on our site. Here are your login details:\n\n";

    $message .= "Username: $username\n";

    $message .= "Password: $generatedPassword\n\n";

    $message .= "You can log in here: " . wp_login_url() . "\n\n";

    $message .= "We recommend changing your password after your first login.\n\n";

    $message .= "If you have any issues, feel free to contact support.\n\n";

    $message .= "Best regards,\nYour Site Team";



    // Set email headers

    $headers = array('Content-Type: text/plain; charset=UTF-8');



    // Send the email

    $sent = wp_mail($email, $subject, $message, $headers);

    

    if ($sent) {

        error_log('Email sent successfully to: ' . $email);

        return new WP_REST_Response(array('message' => 'Email sent successfully'), 200);

    } else {

        error_log('Failed to send email to: ' . $email);

        return new WP_REST_Response(array('message' => 'Failed to send email'), 500);

    }

}