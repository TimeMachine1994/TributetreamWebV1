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
// Register tribute custom post type
add_action('init', 'register_tribute_post_type');
function register_tribute_post_type() {
    $labels = array(
        'name'               => 'Tributes',
        'singular_name'      => 'Tribute',
        'menu_name'          => 'Tributes',
        'add_new'           => 'Add New',
        'add_new_item'      => 'Add New Tribute',
        'edit_item'         => 'Edit Tribute',
        'new_item'          => 'New Tribute',
        'view_item'         => 'View Tribute',
        'search_items'      => 'Search Tributes',
        'not_found'         => 'No tributes found',
        'not_found_in_trash'=> 'No tributes found in Trash'
    );

    $args = array(
        'labels'              => $labels,
        'public'              => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_nav_menus'   => true,
        'show_in_admin_bar'   => true,
        'show_in_rest'        => true, // Enable REST API support
        'rest_base'           => 'tributes',
        'menu_position'       => 5,
        'menu_icon'           => 'dashicons-heart',
        'hierarchical'        => false,
        'supports'            => array(
            'title',
            'editor',
            'author',
            'thumbnail',
            'excerpt',
            'custom-fields'
        ),
        'has_archive'         => true,
        'rewrite'            => array(
            'slug' => 'tributes',
            'with_front' => true
        ),
        'capability_type'    => 'post',
        'rest_controller_class' => 'WP_REST_Posts_Controller'
    );

    register_post_type('tribute', $args);

    // Register custom fields for the tribute post type
    register_rest_field('tribute', 'custom_html', array(
        'get_callback' => function($post) {
            return get_post_meta($post['id'], 'custom_html', true);
        },
        'update_callback' => function($value, $post) {
            update_post_meta($post->ID, 'custom_html', wp_kses_post($value));
        },
        'schema' => array(
            'description' => 'Custom HTML content for the tribute',
            'type'        => 'string'
        )
    ));

    register_rest_field('tribute', 'loved_one_name', array(
        'get_callback' => function($post) {
            return get_post_meta($post['id'], 'loved_one_name', true);
        },
        'update_callback' => function($value, $post) {
            update_post_meta($post->ID, 'loved_one_name', sanitize_text_field($value));
        },
        'schema' => array(
            'description' => 'Name of the loved one',
            'type'        => 'string'
        )
    ));
}

// **************************************************************
// ::Beginning of the plugin, initialize the rest api.
// **************************************************************
// To make this available via the API, we need to register a
// route. This tells the API to respond to a given request with our
// function. We do this through a function called register_rest_route, 
// which should be called in a callback on rest_api_init to avoid doing 
// extra work when the API isn't loaded.
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
    error_log('Attempting to fetch tribute by slug');
    
    // Get slug from the URL parameter
    $slug = sanitize_title($request['slug']);
    error_log('Looking for tribute with slug: ' . $slug);

    // Query for post by slug
    $args = array(
        'name' => $slug,
        'post_type' => 'tribute',
        'post_status' => 'publish',
        'posts_per_page' => 1
    );
    
    $posts = get_posts($args);
    
    if (empty($posts)) {
        error_log('No tribute found with slug: ' . $slug);
        return new WP_REST_Response(['message' => 'Tribute not found'], 404);
    }

    $post = $posts[0];
    $loved_one_name = get_post_meta($post->ID, 'loved_one_name', true);

    error_log('Found tribute post: ' . json_encode([
        'id' => $post->ID,
        'title' => $post->post_title,
        'loved_one_name' => $loved_one_name
    ]));

    return new WP_REST_Response([
        'id' => $post->ID,
        'loved_one_name' => $loved_one_name ?: $post->post_title,
        'slug' => $post->post_name,
        'created_at' => $post->post_date,
        'user_id' => $post->post_author
    ], 200);
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
 * Handles creating a new tribute post.
 *
 * @param WP_REST_Request $request The REST API request object.
 * @return WP_REST_Response The response object.
 */
function handle_tributes_entry($request) {
    error_log('Received tribute creation request');
    
    // Get request parameters
    $params = $request->get_json_params();
    error_log('Received tribute payload: ' . json_encode($params));

    // Validate required fields
    if (!isset($params['loved_one_name']) || !isset($params['user_id'])) {
        error_log('Missing required fields for tribute creation');
        return new WP_Error('missing_fields', 'Required fields are missing.', ['status' => 400]);
    }

    // Create post data
    $post_data = array(
        'post_title'    => sanitize_text_field($params['loved_one_name']),
        'post_status'   => 'publish',
        'post_author'   => intval($params['user_id']),
        'post_type'     => 'tribute',
        'post_name'     => isset($params['slug']) ? sanitize_title($params['slug']) : sanitize_title($params['loved_one_name'])
    );

    error_log('Attempting to create tribute post with data: ' . json_encode($post_data));

    // Insert the post
    $post_id = wp_insert_post($post_data, true);

    if (is_wp_error($post_id)) {
        error_log('Failed to create tribute post: ' . $post_id->get_error_message());
        return new WP_Error('post_creation_failed', $post_id->get_error_message(), ['status' => 500]);
    }

    // Add the loved_one_name as post meta
    update_post_meta($post_id, 'loved_one_name', sanitize_text_field($params['loved_one_name']));

    error_log('Successfully created tribute post with ID: ' . $post_id);
    return new WP_REST_Response([
        'message' => 'Tribute created successfully',
        'id' => $post_id,
        'slug' => get_post_field('post_name', $post_id)
    ], 201);
}

/**
 * ts_get_all_user_meta
 *
 * Callback function to retrieve all meta keys and values for a given user.
 *
 * @param WP_REST_Request $request The REST request object.
 * @return WP_Error|WP_REST_Response
 */
function ts_get_all_user_meta($request) {
    // Retrieve and sanitize parameters from the request
    $user_id = $request->get_param('user_id');

    // Validate the user ID exists
    if (!get_userdata($user_id)) {
        return new WP_Error(
            'user_not_found',
            'The specified user ID does not exist.',
            array('status' => 404)
        );
    }

    // Get all user meta for the given user ID
    global $wpdb;
    $table_name = $wpdb->usermeta;

    // Safeguard the query
    try {
        $query = $wpdb->prepare("SELECT meta_key, meta_value FROM $table_name WHERE user_id = %d", $user_id);
        $results = $wpdb->get_results($query, ARRAY_A);

        if ($results === false) {
            // Database query failed
            return new WP_Error(
                'db_query_failed',
                'An error occurred while querying the database.',
                array('status' => 500)
            );
        }

        if (empty($results)) {
            return new WP_Error(
                'no_meta_found',
                'No meta data found for the specified user.',
                array('status' => 404)
            );
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'user_id' => $user_id,
                'meta' => $results,
            ),
            200
        );
    } catch (Exception $e) {
        return new WP_Error(
            'unexpected_error',
            'An unexpected error occurred: ' . $e->getMessage(),
            array('status' => 500)
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
function ts_store_user_meta($request) {
    // Retrieve and sanitize parameters from the request
    $user_id = $request->get_param('user_id');
    $meta_key = $request->get_param('meta_key');
    $meta_value = $request->get_param('meta_value');

    // Update or add user meta
    $result = update_user_meta($user_id, $meta_key, $meta_value);

    if (false === $result) {
        return new WP_Error(
            'meta_update_failed',
            'Failed to update user meta data. Please check the data and try again.',
            array('status' => 500)
        );
    }

    return new WP_REST_Response(
        array(
            'success' => true,
            'message' => 'User meta updated successfully.',
            'user_id' => $user_id,
            'meta_key' => $meta_key,
            'meta_value' => $meta_value
        ),
        200
    );
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
