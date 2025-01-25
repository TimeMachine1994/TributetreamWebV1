<?php
/**
 * Plugin Name: A5 Tributestream (Refactored)
 * Description: A refactoring of "Plugin 5" to behave more like "Plugin 4," using a custom database table for tributes and the default wp_usermeta table for user meta data. We use JWT Auth for authentication.
 * Version: 1.2
 * Author: Your Name
 *
 * -------------------------------------------------------------------------
 * :: Overview
 * -------------------------------------------------------------------------
 * This plugin demonstrates how to store tribute data in a custom database table
 * called 'wp_tributes' (or '{prefix}_tributes'), rather than using a custom
 * post type. It also shows how to store user-specific data in the default
 * WordPress 'wp_usermeta' table, referencing each user by user_id. 
 *
 * As in Plugin 4, we define various REST API endpoints under the 'tributestream/v1'
 * namespace. We also integrate with a JWT-based authentication plugin (which must
 * be installed separately) to protect some routes.
 *
 * Endpoints (all under /wp-json/tributestream/v1/):
 *  1.  POST    /tribute               -> Create a new tribute in our custom table
 *  2.  GET     /tribute/<slug>        -> Retrieve a single tribute record by slug
 *  3.  POST    /user-meta             -> Create or update user meta data in wp_usermeta
 *  4.  GET     /user-meta/<user_id>   -> Retrieve all meta data for a given user
 *  5.  POST    /register              -> Register a new WordPress user (plus user meta)
 *
 * JWT Auth:
 *  - We expect a Bearer token in the Authorization header for authenticated
 *    routes. The token is validated via /jwt-auth/v1/token/validate.
 *
 * NOTE: If you want to automatically create the custom table on plugin activation,
 * you can add a register_activation_hook() that calls dbDelta. This code is
 * omitted for brevity but can be added as needed.
 */

// -------------------------------------------------------------------------
// :: Global wpdb object
// -------------------------------------------------------------------------
global $wpdb;

/*
 * -------------------------------------------------------------------------
 * :: Register Our Custom REST API Endpoints
 * -------------------------------------------------------------------------
 * We'll attach everything to the `rest_api_init` hook. Each route is under
 * the 'tributestream/v1' namespace. Some routes require JWT authentication,
 * which we verify in 'verify_jwt_cookie' or 'custom_jwt_authenticate'.
 * -------------------------------------------------------------------------
 */
add_action('rest_api_init', function () {
    
    register_rest_route(
        'tributestream/v1',
        '/tributes',
        [
            'methods' => 'GET',
            'callback' => 'get_paginated_tributes',
            'permission_callback' => '__return_true', // Public route, no auth required
            'args' => [
                'page' => [
                    'required' => false,
                    'default' => 1,
                    'validate_callback' => function ($param) {
                        return is_numeric($param);
                    },
                ],
                'per_page' => [
                    'required' => false,
                    'default' => 10,
                    'validate_callback' => function ($param) {
                        return is_numeric($param);
                    },
                ],
                'search' => [
                    'required' => false,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]
    );
    /**
     * POST /tributestream/v1/tribute
     * Creates a new tribute in the custom '{prefix}_tributes' table.
     * Protected by JWT, so the user must provide a valid Authorization header.
     */
    register_rest_route(
        'tributestream/v1',
        '/tribute',
        [
            'methods'             => 'POST',
            'callback'            => 'handle_tributes_entry',
            'permission_callback' => 'verify_jwt_cookie',
        ]
    );

    /**
     * GET /tributestream/v1/tribute/<slug>
     * Retrieves a single tribute record from '{prefix}_tributes' by its slug.
     * Public route, so no authentication is required.
     */
    register_rest_route(
        'tributestream/v1',
        '/tribute/(?P<slug>[a-zA-Z0-9-_]+)',
        [
            'methods'             => 'GET',
            'callback'            => 'get_tribute_by_slug',
            'permission_callback' => '__return_true', // no auth required
        ]
    );

    /**
     * POST /tributestream/v1/user-meta
     * Creates/updates user meta data in the default 'wp_usermeta' table.
     * Requires valid JWT token.
     */
    register_rest_route(
        'tributestream/v1',
        '/user-meta',
        [
            [
                'methods'             => WP_REST_Server::CREATABLE, // 'POST'
                'callback'            => 'ts_store_user_meta',
                'permission_callback' => 'custom_jwt_authenticate',
                'args'                => [
                    'meta_key'   => [
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                    'meta_value' => [
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                ],
            ],
        ]
    );

    /**
     * GET /tributestream/v1/user-meta/<user_id>
     * Retrieves all meta keys/values for a user from wp_usermeta.
     * Requires valid JWT token.
     */
    register_rest_route(
        'tributestream/v1',
        '/user-meta/(?P<user_id>\d+)',
        [
            [
                'methods'             => WP_REST_Server::READABLE, // 'GET'
                'callback'            => 'ts_get_all_user_meta',
                'permission_callback' => 'custom_jwt_authenticate',
                'args'                => [
                    'user_id' => [
                        'required'          => true,
                        'validate_callback' => function ($param) {
                            return is_numeric($param);
                        },
                    ],
                ],
            ],
        ]
    );

    /**
     * POST /tributestream/v1/register
     * Creates a new WordPress user, sets optional user meta fields, and sends
     * a welcome email. Public endpoint (no auth required).
     */
    register_rest_route(
        'tributestream/v1',
        '/register',
        [
            'methods'             => 'POST',
            'callback'            => 'handle_tributestream_registration',
            'permission_callback' => '__return_true',
        ]
    );
});

function get_paginated_tributes($request)
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributes';

    $page = $request->get_param('page');
    $per_page = $request->get_param('per_page');
    $search = $request->get_param('search');

    $offset = ($page - 1) * $per_page;

    $query = "SELECT * FROM $table_name WHERE 1=1";

    if (!empty($search)) {
        $query .= $wpdb->prepare(" AND loved_one_name LIKE %s", '%' . $wpdb->esc_like($search) . '%');
    }

    $query .= $wpdb->prepare(" LIMIT %d OFFSET %d", $per_page, $offset);

    $results = $wpdb->get_results($query, ARRAY_A);

    if ($results === false) {
        return new WP_Error(
            'db_query_failed',
            'An error occurred while querying the database.',
            ['status' => 500]
        );
    }

    return new WP_REST_Response($results, 200);
}
/*
 * -------------------------------------------------------------------------
 * :: JWT Authentication Callbacks
 * -------------------------------------------------------------------------
 * These functions verify the JWT token (if required) by hitting the
 * /jwt-auth/v1/token/validate endpoint. If a token is invalid or missing,
 * we return a WP_Error object with a 403 status code.
 * -------------------------------------------------------------------------
 */

/**
 * verify_jwt_cookie
 *
 * This permission callback looks for "Bearer <token>" in the Authorization
 * header. It then calls rest_do_request('/jwt-auth/v1/token/validate') to
 * confirm the token is valid.
 *
 * If valid, returns true. If invalid, returns WP_Error with status 403.
 *
 * @param WP_REST_Request $request The REST API request instance.
 * @return bool|WP_Error
 */
function verify_jwt_cookie($request)
{
    error_log('Attempting JWT authentication');

    $auth_header = $request->get_header('Authorization');
    if (!$auth_header || strpos($auth_header, 'Bearer') === false) {
        error_log('JWT Auth: No valid Authorization header found');
        return new WP_Error(
            'jwt_auth_no_auth_header',
            'Authorization header not found or invalid.',
            ['status' => 403]
        );
    }

    // Extract the token
    $token = trim(str_replace('Bearer', '', $auth_header));
    error_log('JWT Auth: Attempting to validate token: ' . substr($token, 0, 10) . '...');

    // Use the JWT Auth plugin's validation
    $validate_request = new WP_REST_Request('POST', '/jwt-auth/v1/token/validate');
    $validate_request->set_header('Authorization', 'Bearer ' . $token);
    $response = rest_do_request($validate_request);

    // Check if a WP_Error was returned
    if (is_wp_error($response)) {
        error_log('JWT Auth: WP_Error in validation response: ' . $response->get_error_message());
        return new WP_Error(
            'jwt_auth_invalid_token',
            'Token validation failed: ' . $response->get_error_message(),
            ['status' => 403]
        );
    }

    // Check the HTTP status code
    if ($response->get_status() !== 200) {
        $body          = $response->get_data();
        $error_message = isset($body['message']) ? $body['message'] : 'Unknown error';
        error_log('JWT Auth: Non-200 status. Status: ' . $response->get_status() . ', Message: ' . $error_message);
        return new WP_Error(
            'jwt_auth_invalid_token',
            'Token validation failed: ' . $error_message,
            ['status' => 403]
        );
    }

    error_log('JWT Auth: Token validated successfully');
    return true;
}

/**
 * custom_jwt_authenticate
 *
 * Same general logic as verify_jwt_cookie, but used on specific endpoints.
 * You could unify these functions if desired.
 *
 * @param WP_REST_Request $request
 * @return bool|WP_Error
 */
function custom_jwt_authenticate($request)
{
    error_log('Attempting JWT authentication (custom callback)');

    $auth_header = $request->get_header('Authorization');
    if (!$auth_header || strpos($auth_header, 'Bearer') === false) {
        return new WP_Error(
            'jwt_auth_no_auth_header',
            'Authorization header not found or invalid.',
            ['status' => 403]
        );
    }

    $token = trim(str_replace('Bearer', '', $auth_header));
    $validate_request = new WP_REST_Request('POST', '/jwt-auth/v1/token/validate');
    $validate_request->set_header('Authorization', 'Bearer ' . $token);

    $response = rest_do_request($validate_request);
    if (is_wp_error($response)) {
        return new WP_Error(
            'jwt_auth_invalid_token',
            'Token validation failed: ' . $response->get_error_message(),
            ['status' => 403]
        );
    }
    if ($response->get_status() !== 200) {
        $body          = $response->get_data();
        $error_message = isset($body['message']) ? $body['message'] : 'Unknown error';
        return new WP_Error(
            'jwt_auth_invalid_token',
            'Token validation failed: ' . $error_message,
            ['status' => 403]
        );
    }

    return true;
}

/*
 * -------------------------------------------------------------------------
 * :: Tribute Endpoints (Custom Table)
 * -------------------------------------------------------------------------
 * We store tributes in a custom table called '{prefix}_tributes'. That table
 * would typically have columns like: id, user_id, loved_one_name, slug,
 * created_at, updated_at, etc.
 * -------------------------------------------------------------------------
 */

/**
 * handle_tributes_entry (POST /tributestream/v1/tribute)
 *
 * Inserts a new row in the {prefix}_tributes table.
 *
 * Expects JSON data including at least:
 *  - user_id
 *  - loved_one_name
 *  - slug (optional; if omitted, you might generate one)
 *
 * Permission: Must have a valid JWT token
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function handle_tributes_entry($request)
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributes';

    // Retrieve POSTed JSON params
    $params = $request->get_json_params();
    error_log('Received tribute payload: ' . json_encode($params));

    $data = [
        'user_id'        => isset($params['user_id'])        ? intval($params['user_id']) : null,
        'loved_one_name' => isset($params['loved_one_name']) ? sanitize_text_field($params['loved_one_name']) : null,
        'slug'           => isset($params['slug'])           ? sanitize_title($params['slug'])                 : null,
        'created_at'     => current_time('mysql', 1),
        'updated_at'     => current_time('mysql', 1),
    ];

    // Remove nulls so as not to insert them incorrectly
    $data = array_filter($data, function ($v) {
        return !is_null($v);
    });

    // Basic validation
    if (
        empty($data['user_id']) ||
        empty($data['loved_one_name']) ||
        empty($data['slug'])
    ) {
        return new WP_Error(
            'missing_fields',
            'Required fields (user_id, loved_one_name, slug) are missing or empty.',
            ['status' => 400]
        );
    }

    // Insert into custom table
    $result = $wpdb->insert($table_name, $data);

    if ($result === false) {
        // Grab the last DB error if any
        $wpdb_error = $wpdb->last_error;
        error_log('Database insert error: ' . $wpdb_error);
        return new WP_Error(
            'db_insert_error',
            'Failed to insert tribute entry: ' . $wpdb_error,
            ['status' => 500]
        );
    }

    // Return the newly created record's ID
    return new WP_REST_Response(
        [
            'message' => 'Tribute created successfully',
            'id'      => $wpdb->insert_id,
        ],
        201
    );
}

/**
 * get_tribute_by_slug (GET /tributestream/v1/tribute/<slug>)
 *
 * Reads a single tribute record from the {prefix}_tributes table by its slug.
 * This route is public, so no JWT auth required.
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function get_tribute_by_slug($request)
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributes';

    $slug = sanitize_title($request['slug']);
    error_log('Looking up tribute by slug: ' . $slug);

    $query  = $wpdb->prepare("SELECT * FROM $table_name WHERE slug = %s", $slug);
    $result = $wpdb->get_row($query, ARRAY_A);

    if (!$result) {
        return new WP_REST_Response(['message' => 'Tribute not found'], 404);
    }

    // Return the tribute data
    return new WP_REST_Response($result, 200);
}

/*
 * -------------------------------------------------------------------------
 * :: User Meta Endpoints
 * -------------------------------------------------------------------------
 * We store user meta data in the default 'wp_usermeta' table. The routes
 * let us insert or retrieve arbitrary key-value pairs for a given user.
 * -------------------------------------------------------------------------
 */

/**
 * ts_store_user_meta (POST /tributestream/v1/user-meta)
 *
 * Creates or updates a single user meta key-value pair for a specific user_id.
 * Expects JSON containing:
 *   - user_id
 *   - meta_key
 *   - meta_value
 *
 * Permission: Must have a valid JWT token.
 *
 * @param WP_REST_Request $request
 * @return WP_Error|WP_REST_Response
 */
function ts_store_user_meta($request)
{
    $params     = $request->get_json_params();
    $user_id    = isset($params['user_id'])    ? intval($params['user_id']) : 0;
    $meta_key   = isset($params['meta_key'])   ? sanitize_text_field($params['meta_key']) : '';
    $meta_value = isset($params['meta_value']) ? sanitize_text_field($params['meta_value']) : '';

    if (!$user_id || !$meta_key) {
        return new WP_Error(
            'missing_params',
            'user_id and meta_key are required',
            ['status' => 400]
        );
    }

    // Attempt to update or add the meta
    $result = update_user_meta($user_id, $meta_key, $meta_value);
    if (false === $result) {
        return new WP_Error(
            'meta_update_failed',
            'Failed to update user meta data. Please check the data and try again.',
            ['status' => 500]
        );
    }

    return new WP_REST_Response(
        [
            'success'    => true,
            'message'    => 'User meta updated successfully.',
            'user_id'    => $user_id,
            'meta_key'   => $meta_key,
            'meta_value' => $meta_value,
        ],
        200
    );
}

/**
 * ts_get_all_user_meta (GET /tributestream/v1/user-meta/<user_id>)
 *
 * Retrieves all meta keys and values for the specified user from the
 * wp_usermeta table.
 *
 * Permission: Must have a valid JWT token.
 *
 * @param WP_REST_Request $request
 * @return WP_Error|WP_REST_Response
 */
function ts_get_all_user_meta($request)
{
    global $wpdb;
    $user_id = $request->get_param('user_id');

    // Confirm that user actually exists
    if (!get_userdata($user_id)) {
        return new WP_Error(
            'user_not_found',
            'The specified user ID does not exist.',
            ['status' => 404]
        );
    }

    // Query usermeta table directly or use get_user_meta
    // We'll do a direct query for completeness:
    $table_name = $wpdb->usermeta;

    try {
        $query   = $wpdb->prepare("SELECT meta_key, meta_value FROM $table_name WHERE user_id = %d", $user_id);
        $results = $wpdb->get_results($query, ARRAY_A);

        if ($results === false) {
            return new WP_Error(
                'db_query_failed',
                'An error occurred while querying the database.',
                ['status' => 500]
            );
        }

        if (empty($results)) {
            return new WP_Error(
                'no_meta_found',
                'No meta data found for the specified user.',
                ['status' => 404]
            );
        }

        return new WP_REST_Response(
            [
                'success' => true,
                'user_id' => $user_id,
                'meta'    => $results,
            ],
            200
        );
    } catch (Exception $e) {
        return new WP_Error(
            'unexpected_error',
            'An unexpected error occurred: ' . $e->getMessage(),
            ['status' => 500]
        );
    }
}

/*
 * -------------------------------------------------------------------------
 * :: User Registration Endpoint
 * -------------------------------------------------------------------------
 * Creates a new WordPress user, sets custom user meta, and sends a welcome email.
 * -------------------------------------------------------------------------
 */

/**
 * handle_tributestream_registration (POST /tributestream/v1/register)
 *
 * Public endpoint (no auth required) to create a new WordPress user. Expects
 * JSON fields:
 *  - username
 *  - email
 *  - password
 *  - meta (an array of custom fields, e.g. full_name, phone, etc.)
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function handle_tributestream_registration($request)
{
    error_log('Registration attempt started');
    $params = $request->get_json_params();
    error_log('Request data: ' . json_encode($params));

    // Basic required fields
    $username = sanitize_user($params['username']);
    $email    = sanitize_email($params['email']);
    $password = $params['password'] ?? '';

    // Additional custom meta array
    $meta = $params['meta'] ?? [];

    // Create the new user in WordPress
    $user_id = wp_create_user($username, $password, $email);
    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', $user_id->get_error_message(), ['status' => 400]);
    }

    // Optionally add meta fields
    // Example: full_name, phone, loved_one_name, etc.
    if (!empty($meta)) {
        foreach ($meta as $key => $value) {
            // Use sanitize_text_field or other sanitizers as needed
            update_user_meta($user_id, sanitize_key($key), sanitize_text_field($value));
        }
    }

    // Send welcome email
    wp_mail(
        $email,
        'Welcome to TributeStream',
        "Your account has been created.\nUsername: $username\nPassword: $password"
    );

    return new WP_REST_Response(['user_id' => $user_id], 201);
}
