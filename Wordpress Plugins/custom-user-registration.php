<?php
/*
Plugin Name: TributeStream API
Plugin URI: https://your-domain.com
Description: REST API endpoints for TributeStream user management and tribute operations
Version: 1.0
Author: Your Name
Author URI: https://your-domain.com
License: GPL2
*/

/**
 * ------------------------------------------------------------------------
 * IMPORTANT: ALWAYS TEST IN A STAGING ENVIRONMENT BEFORE PRODUCTION
 * ------------------------------------------------------------------------
 *
 * This plugin demonstrates how to create custom WordPress REST API endpoints
 * that interact with the MySQL database using the $wpdb object. It follows
 * the recommended approach from the official WordPress REST API documentation:
 *
 *   - Use a custom namespace (e.g., 'tributestream/v1').
 *   - Separate endpoints, e.g.:
 *       /tributes
 *       /tributes/(?P<tribute_id>\d+)/custom-html
 *   - Provide callback functions for each HTTP method.
 *   - Use a permission callback for authorization checks.
 *
 * This plugin defines two main routes under 'tributestream/v1':
 *   1) GET /tributes
 *   2) PUT /tributes/{tribute_id}/custom-html
 *
 * The code:
 *   - Registers REST routes on the 'rest_api_init' action hook
 *   - Implements callback functions to query and update the wpa2_tributes table
 *   - Provides permission callbacks (demo: is_user_logged_in)
 *   - Demonstrates how to handle arguments and return WP_REST_Response objects
 *
 * NOTE: For production, consider more robust permission checks (e.g.,
 *       current_user_can('edit_posts')) and better error handling/logging.
 */


/**
 * Hook into rest_api_init to register custom routes for our plugin.
 *
 * Per WordPress REST API docs, we use a distinct namespace ("tributestream/v1"),
 * and then define endpoints such as "/tributes" or "/tributes/(?P<tribute_id>\d+)".
 */
add_action('rest_api_init', function () {

    /**
     * 1) Register the GET /tributestream/v1/tributes endpoint
     *
     *    This endpoint will retrieve all tributes from the wpa2_tributes table,
     *    sorted by creation date in descending order.
     *
     *    - namespace:  tributestream/v1
     *    - route:      /tributes
     *    - method(s):  GET (readable)
     *    - callback:   ts_get_all_tributes
     *    - permission: is_user_logged_in (demo)
     */
    register_rest_route(
        'tributestream/v1', // The custom namespace
        '/tributes',        // The endpoint path
        array(
            array(
                'methods'             => 'GET',
                'callback'            => 'ts_get_all_tributes',
                // Official docs encourage a permission_callback
                // to handle authentication/authorization logic
                'permission_callback' => 'is_user_logged_in',

                // Example of 'args' usage if you needed it:
                // 'args' => array(
                //    'some_param' => array(
                //       'default' => 'mydefault',
                //       'validate_callback' => function($param, $request, $key) {
                //           return is_string($param);
                //       },
                //       'sanitize_callback' => 'sanitize_text_field',
                //    ),
                // ),
            ),
        )
    );

    /**
     * 2) Register the PUT /tributestream/v1/tributes/(?P<tribute_id>\d+)/custom-html endpoint
     *
     *    This endpoint updates the 'custom_html' field for a tribute by ID.
     *
     *    - namespace:  tributestream/v1
     *    - route:      /tributes/(?P<tribute_id>\d+)/custom-html
     *    - method(s):  PUT (editable)
     *    - callback:   ts_update_tribute_custom_html
     *    - permission: is_user_logged_in (demo)
     *
     *    Note: We're demonstrating a simple usage of regex placeholders:
     *          (?P<tribute_id>\d+) means "capture a numeric ID"
     *
     *    The official docs recommend validating your arguments. Here, we
     *    validate that 'tribute_id' is numeric.
     */
    register_rest_route(
        'tributestream/v1', // The namespace
        '/tributes/(?P<tribute_id>\d+)/custom-html', // The route
        array(
            array(
                'methods'             => 'PUT',
                'callback'            => 'ts_update_tribute_custom_html',
                'permission_callback' => 'is_user_logged_in',
                'args'                => array(
                    'tribute_id' => array(
                        // We'll ensure 'tribute_id' is numeric
                        'validate_callback' => function($param, $request, $key) {
                            return is_numeric($param);
                        },
                    ),
                ),
            ),
        )
    );
});


/**
 * ts_get_all_tributes
 *
 * Callback function for:
 *   GET /tributestream/v1/tributes
 *
 * Queries the wpa2_tributes table and returns all records as a JSON response.
 *
 * @return WP_REST_Response
 */
function ts_get_all_tributes($request) {
    global $wpdb;

    error_log('Executing ts_get_all_tributes'); // Just a debug log example

    // Query to retrieve all tributes
    $tributes = $wpdb->get_results(
        "
        SELECT 
            id, 
            user_id, 
            loved_one_name, 
            slug, 
            created_at, 
            updated_at, 
            custom_html, 
            phone_number, 
            number_of_streams
        FROM wpa2_tributes
        ORDER BY created_at DESC
        ",
        ARRAY_A
    );

    // Debugging logs
    error_log('Last Query: ' . $wpdb->last_query);
    error_log('Results: ' . print_r($tributes, true));

    // Check for any database errors
    if ($wpdb->last_error) {
        error_log('Database Error: ' . $wpdb->last_error);

        // Return an error as a WP_REST_Response
        return new WP_REST_Response(
            array(
                'error'   => true,
                'message' => 'Database error: ' . $wpdb->last_error,
            ),
            500
        );
    }

    // Return data as JSON with a 200 OK status
    return new WP_REST_Response($tributes, 200);
}


/**
 * ts_update_tribute_custom_html
 *
 * Callback function for:
 *   PUT /tributestream/v1/tributes/{tribute_id}/custom-html
 *
 * Updates the custom_html field for the given tribute ID in the wpa2_tributes table.
 *
 * Sample JSON body: { "custom_html": "<div>New HTML content</div>" }
 *
 * @param WP_REST_Request $request The request object containing the route parameters and body.
 * @return WP_REST_Response
 */
function ts_update_tribute_custom_html($request) {
    global $wpdb;

    // Retrieve the {tribute_id} matched via the route (?P<tribute_id>\d+)
    $tribute_id = $request->get_param('tribute_id');

    // Retrieve JSON body parameters
    $params      = $request->get_json_params();
    $custom_html = isset($params['custom_html']) ? $params['custom_html'] : '';

    // Use $wpdb->update to modify the custom_html column for the correct tribute
    $result = $wpdb->update(
        'wpa2_tributes',                          // Table name
        array('custom_html' => $custom_html),     // SET custom_html = ...
        array('id' => (int) $tribute_id),         // WHERE id = ...
        array('%s'),                              // Data format for custom_html
        array('%d')                               // Data format for id
    );

    // If $result === false, an error occurred
    if ($result === false) {
        error_log('Database update failed: ' . $wpdb->last_error);

        // Return error response
        return new WP_REST_Response(
            array(
                'error'   => true,
                'message' => 'Unable to update tribute in the database.'
            ),
            500
        );
    }

    // If $result === 0, no rows were updated.
    // Possibly the ID doesn't exist or no changes were needed.
    if ($result === 0) {
        return new WP_REST_Response(
            array(
                'message'    => 'No rows updated. Possibly invalid tribute_id or no changes provided.',
                'tribute_id' => $tribute_id,
            ),
            200
        );
    }

    // If $result > 0, success
    return new WP_REST_Response(
        array(
            'message'    => 'Custom HTML updated successfully.',
            'tribute_id' => $tribute_id,
        ),
        200
    );
}

/* End of plugin file */
