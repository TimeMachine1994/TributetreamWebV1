<?php
/*
/**
 * Plugin Name: Tributestream API
 * Description: Adds REST API endpoints for managing data. We use JWT Auth for authentication.
 * Version: 1.1
 * Author: Your Name
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
//Begin Endpoint Registration 
add_action('rest_api_init', function () {
//add_action('rest_api_init', function () {  is needed before re start registering the routes. 

//START: Endpoints for /tribute and /tribute/<slug>

    register_rest_route('tributestream/v1', '/tribute', [
        'methods' => 'POST',
        'callback' => 'handle_tributes_entry',
        'permission_callback' => 'verify_jwt_cookie',
    ]);
    
      register_rest_route('tributestream/v1', '/tribute/(?P<slug>[a-zA-Z0-9-_]+)', [
        'methods' => 'GET',
        'callback' => 'get_tribute_by_slug',
        'permission_callback' => '__return_true', // No auth required for this example
    ]);

//END: Endpoints for /tribute and /tribute/<slug>
//START: Endpoints for /user-meta and /user-meta/<user_id>

    register_rest_route(
        'tributestream/v1',
        '/user-meta',
        array(
            array(
                'methods'             => WP_REST_Server::CREATABLE, // 'POST'
                'callback'            => 'ts_store_user_meta',
                'permission_callback' => 'custom_jwt_authenticate',
                'args'                => array(
                    'meta_key'   => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'meta_value' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            ),
        )
    );

    // New route for retrieving all user meta
    register_rest_route(
        'tributestream/v1',
        '/user-meta/(?P<user_id>\d+)',
        array(
            array(
                'methods'             => WP_REST_Server::READABLE, // 'GET'
                'callback'            => 'ts_get_all_user_meta',
                'permission_callback' => 'custom_jwt_authenticate',
                'args'                => array(
                    'user_id' => array(
                        'required'          => true,
                        'validate_callback' => function( $param, $request, $key ) {
                            return is_numeric( $param );
                        },
                    ),
                ),
            ),
        )
);

//END: Endpoints for /user-meta and /tribute/<user_id>

//START: Endpoints for /register

register_rest_route('tributestream/v1', '/register', [
    'methods' => 'POST',
    'callback' => 'handle_tributestream_registration',
    'permission_callback' => '__return_true'
]);
//END: Endpoints for /register






//END OF ENDPOINTS
});
































//START OF FUNCTIONS FOR ENDPOINTS
// These directories refer to a /src/routes/api/ as the root to which they are called within our SvelteKit app. 
// The SvelteKit app is the reason we have these endpoints in the first place, so hopefully this will make keeping track 
// of what endpoints are created and available easier. 
//START: Functions for /tribute and /tributge/<slug>

// JWT authentication function
function get_tribute_by_slug($request) {
    global $wpdb;

    // Table name
    $table_name = $wpdb->prefix . 'tributes';

    // Get slug from the URL parameter
    $slug = sanitize_title($request['slug']);

    // Query the database
    $query = $wpdb->prepare("SELECT * FROM $table_name WHERE slug = %s", $slug);
    $result = $wpdb->get_row($query, ARRAY_A);

    if (!$result) {
        return new WP_REST_Response(['message' => 'Tribute not found'], 404);
    }

    return new WP_REST_Response($result, 200);
}

function verify_jwt_cookie($request) {

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

/**
 * Handles creating or updating entries in the `wpa2_tributes` table.
 *
 * @param WP_REST_Request $request The REST API request object.
 * @return WP_REST_Response The response object.
 */function handle_tributes_entry($request) {
    global $wpdb;

    // Table name
    $table_name = $wpdb->prefix . 'tributes';

    // Get request parameters
    $params = $request->get_json_params();

    error_log('Received tribute payload: ' . json_encode($params));

    $data = [
        'user_id' => isset($params['user_id']) ? intval($params['user_id']) : null,
        'loved_one_name' => isset($params['loved_one_name']) ? sanitize_text_field($params['loved_one_name']) : null,
        'slug' => isset($params['slug']) ? sanitize_title($params['slug']) : null,
        'created_at' => current_time('mysql', 1),
        'updated_at' => current_time('mysql', 1)
    ];

    // Remove null values
    $data = array_filter($data, function ($value) {
        return !is_null($value);
    });

    error_log('Prepared data for insertion: ' . json_encode($data));

    if (count($data) < 3) { // Expecting at least user_id, loved_one_name, and slug
        return new WP_Error('missing_fields', 'Required fields are missing.', ['status' => 400]);
    }

    // Insert logic
    $result = $wpdb->insert($table_name, $data);

    if ($result === false) {
        $wpdb_error = $wpdb->last_error;
        error_log('Database insert error: ' . $wpdb_error);
        return new WP_Error('db_insert_error', 'Failed to insert entry. ' . $wpdb_error, ['status' => 500]);
    }

    return new WP_REST_Response(['message' => 'Entry created successfully', 'id' => $wpdb->insert_id], 201);
}

//END: Functions for /tribute and /tribute/<slug>

//Start: Functions for /meta-write and /meta-write/<user-id>

/**
 * Verifies the JWT token from cookies.
 *
 * @return bool|WP_Error True if the user is authenticated, WP_Error otherwise.
 */
 

/**
 * Handles creating or updating entries in the `wpa2_tributes` table.
 *
 * @param WP_REST_Request $request The REST API request object.
 * @return WP_REST_Response The response object.
 */function handle_tributes_entry($request) {
    global $wpdb;

    // Table name
    $table_name = $wpdb->prefix . 'tributes';

    // Get request parameters
    $params = $request->get_json_params();

    error_log('Received tribute payload: ' . json_encode($params));

    $data = [
        'user_id' => isset($params['user_id']) ? intval($params['user_id']) : null,
        'loved_one_name' => isset($params['loved_one_name']) ? sanitize_text_field($params['loved_one_name']) : null,
        'slug' => isset($params['slug']) ? sanitize_title($params['slug']) : null,
        'created_at' => current_time('mysql', 1),
        'updated_at' => current_time('mysql', 1)
    ];

    // Remove null values
    $data = array_filter($data, function ($value) {
        return !is_null($value);
    });

    error_log('Prepared data for insertion: ' . json_encode($data));

    if (count($data) < 3) { // Expecting at least user_id, loved_one_name, and slug
        return new WP_Error('missing_fields', 'Required fields are missing.', ['status' => 400]);
    }

    // Insert logic
    $result = $wpdb->insert($table_name, $data);

    if ($result === false) {
        $wpdb_error = $wpdb->last_error;
        error_log('Database insert error: ' . $wpdb_error);
        return new WP_Error('db_insert_error', 'Failed to insert entry. ' . $wpdb_error, ['status' => 500]);
    }

    return new WP_REST_Response(['message' => 'Entry created successfully', 'id' => $wpdb->insert_id], 201);
}

/**
 * ts_get_all_user_meta
 *
 * Callback function to retrieve all meta keys and values for a given user.
 *
 * @param WP_REST_Request $request The REST request object.
 * @return WP_Error|WP_REST_Response
 */
function ts_get_all_user_meta( $request ) {
    // Retrieve and sanitize parameters from the request
    $user_id = $request->get_param( 'user_id' );

    // Validate the user ID exists
    if ( ! get_userdata( $user_id ) ) {
        return new WP_Error(
            'user_not_found',
            'The specified user ID does not exist.',
            array( 'status' => 404 )
        );
    }

    // Get all user meta for the given user ID
    global $wpdb;
    $table_name = $wpdb->usermeta;

    // Safeguard the query
    try {
        $query   = $wpdb->prepare( "SELECT meta_key, meta_value FROM $table_name WHERE user_id = %d", $user_id );
        $results = $wpdb->get_results( $query, ARRAY_A );

        if ( $results === false ) {
            // Database query failed
            return new WP_Error(
                'db_query_failed',
                'An error occurred while querying the database.',
                array( 'status' => 500 )
            );
        }

        if ( empty( $results ) ) {
            return new WP_Error(
                'no_meta_found',
                'No meta data found for the specified user.',
                array( 'status' => 404 )
            );
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'user_id' => $user_id,
                'meta'    => $results,
            ),
            200
        );
    } catch ( Exception $e ) {
        return new WP_Error(
            'unexpected_error',
            'An unexpected error occurred: ' . $e->getMessage(),
            array( 'status' => 500 )
        );
    }
}
 
/**
 * ts_store_user_meta
 *
 * Callback function to handle the creation/updating of user meta in the usermeta table.
 *
 * @param WP_REST_Request $request The REST request object.
 * @return WP_Error|WP_REST_Response
 */
function ts_store_user_meta( $request ) {
    // Retrieve and sanitize parameters from the request
    $user_id    = $request->get_param( 'user_id' );
    $meta_key   = $request->get_param( 'meta_key' );
    $meta_value = $request->get_param( 'meta_value' );

    // Update or add user meta
    $result = update_user_meta( $user_id, $meta_key, $meta_value );

    if ( false === $result ) {
        return new WP_Error(
            'meta_update_failed',
            'Failed to update user meta data. Please check the data and try again.',
            array( 'status' => 500 )
        );
    }

    return new WP_REST_Response(
        array(
            'success'      => true,
            'message'      => 'User meta updated successfully.',
            'user_id'      => $user_id,
            'meta_key'     => $meta_key,
            'meta_value'   => $meta_value
        ),
        200
    );
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


//Start: Functions for /register

function handle_tributestream_registration($request) {
    error_log('Registration attempt started');
error_log('Request data: ' . json_encode($request->get_json_params()));
$params = $request->get_json_params();

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

// Send welcome email with login credentials
wp_mail(
    $email,
    'Welcome to TributeStream',
    "Your account has been created.\nUsername: $username\nPassword: $password"
);

return new WP_REST_Response(['user_id' => $user_id], 201);
}
//End: Functions from /register