<?php
/*
Plugin Name: TributeStream API
Plugin URI:  https://your-domain.com
Description: REST API endpoints for TributeStream user management and tribute operations
Version:     1.0.1
Author:      Your Name
Author URI:  https://your-domain.com
License:     GPL2
*/

/**
 * ------------------------------------------------------------------------
 * IMPORTANT: ALWAYS TEST IN A STAGING ENVIRONMENT BEFORE PRODUCTION
 * ------------------------------------------------------------------------
 *
 * This plugin demonstrates how to create custom WordPress REST API endpoints
 * that interact with the MySQL database using the $wpdb object. It follows
 * WordPress REST API best practices:
 *
 *   - Use a custom namespace (e.g., 'tributestream/v1').
 *   - Separate endpoints, e.g.:
 *       /tributes
 *       /tributes/(?P<tribute_id>\d+)/custom-html
 *   - Provide callback functions for each HTTP method (GET, POST, PUT, DELETE).
 *   - Use a permission callback for authorization checks.
 *   - Sanitize and validate data via 'sanitize_callback', 'validate_callback',
 *     and $wpdb->prepare().
 *
 * This plugin defines two main routes under 'tributestream/v1':
 *   1) GET  /tributestream/v1/tributes
 *   2) PUT  /tributestream/v1/tributes/(?P<tribute_id>\d+)/custom-html
 *
 * The code:
 *   - Registers REST routes on the 'rest_api_init' action hook
 *   - Implements callback functions to query and update the tributes table
 *   - Uses permission callbacks (demo: is_user_logged_in) 
 *   - Demonstrates how to handle arguments and return WP_REST_Response objects
 *
 * For production, consider more robust permission checks:
 *    current_user_can('edit_posts'), or other capabilities relevant to your needs.
 * Also, ensure thorough error handling/logging and data sanitization.
 */

// Prevent direct access to this file for security
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Register custom routes for TributeStream under the 'rest_api_init' hook.
 */
add_action( 'rest_api_init', function () {

    /**
     * 1) Register the GET /tributestream/v1/tributes endpoint
     *
     *    This endpoint will retrieve all tributes from the table,
     *    sorted by creation date in descending order.
     *
     *    - namespace:  tributestream/v1
     *    - route:      /tributes
     *    - method:     GET (READABLE)
     *    - callback:   ts_get_all_tributes
     *    - permission: is_user_logged_in (demo)
     */
    register_rest_route(
        'tributestream/v1',    // The custom namespace
        '/tributes',           // The endpoint path
        array(
            array(
                'methods'             => WP_REST_Server::READABLE,  // or 'GET'
                'callback'            => 'ts_get_all_tributes',
                'permission_callback' => 'is_user_logged_in',
                /**
                 * Example 'args' usage if you needed to handle GET parameters:
                 *
                 * 'args' => array(
                 *   'some_param' => array(
                 *       'default'           => 'mydefault',
                 *       'validate_callback' => function($param, $request, $key) {
                 *           return is_string($param);
                 *       },
                 *       'sanitize_callback' => 'sanitize_text_field',
                 *   ),
                 * ),
                 */
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
     *    - method:     PUT (EDITABLE)
     *    - callback:   ts_update_tribute_custom_html
     *    - permission: is_user_logged_in (demo)
     *
     *    We use '(?P<tribute_id>\d+)' to capture an integer ID.
     */
    register_rest_route(
        'tributestream/v1', // The namespace
        '/tributes/(?P<tribute_id>\d+)/custom-html', // The route
        array(
            array(
                'methods'             => WP_REST_Server::EDITABLE,  // or 'PUT'
                'callback'            => 'ts_update_tribute_custom_html',
                'permission_callback' => 'is_user_logged_in',

                // Validate the 'tribute_id' route parameter as an integer
                'args'                => array(
                    'tribute_id' => array(
                        'validate_callback' => function ( $param, $request, $key ) {
                            return is_numeric( $param );
                        },
                        /**
                         * We can also sanitize 'tribute_id' using absint
                         * if we want to cast it to an absolute integer:
                         * 'sanitize_callback' => 'absint'
                         */
                    ),
                    /**
                     * Optionally, define how you want to sanitize the
                     * custom_html field in the PUT body, if using request arguments:
                     * 'custom_html' => array(
                     *    'sanitize_callback' => 'wp_kses_post',
                     * ),
                     */
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
 * Queries the tributes table and returns all records as a JSON response.
 *
 * @param WP_REST_Request $request The incoming REST request object.
 * @return WP_REST_Response
 */
function ts_get_all_tributes( $request ) {
    global $wpdb;

    // Debug log (optional)
    error_log( 'Executing ts_get_all_tributes' );

    /**
     * Construct a query to retrieve all tributes from a table named "{$wpdb->prefix}tributes".
     * If your actual table name is different (e.g. wpa2_tributes), adjust accordingly.
     *
     * Note: There's no dynamic user input here, so prepare() isn't strictly required.
     *       If you incorporate user-provided parameters, always use $wpdb->prepare().
     */
    $table_name = $wpdb->prefix . 'tributes';

    // Query to retrieve all tributes, ordering by created_at descending
    $query = "
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
        FROM {$table_name}
        ORDER BY created_at DESC
    ";

    $tributes = $wpdb->get_results( $query, ARRAY_A );

    // Debugging logs
    error_log( 'Last Query: ' . $wpdb->last_query );
    error_log( 'Results: ' . print_r( $tributes, true ) );

    // Check for any database errors
    if ( $wpdb->last_error ) {
        error_log( 'Database Error: ' . $wpdb->last_error );

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
    return new WP_REST_Response( $tributes, 200 );
}

/**
 * ts_update_tribute_custom_html
 *
 * Callback function for:
 *   PUT /tributestream/v1/tributes/{tribute_id}/custom-html
 *
 * Updates the custom_html field for the given tribute ID in the tributes table.
 *
 * Example JSON body:
 * {
 *   "custom_html": "<div>Your new HTML content</div>"
 * }
 *
 * @param WP_REST_Request $request The request object containing route parameters and body.
 * @return WP_REST_Response
 */
function ts_update_tribute_custom_html( $request ) {
    global $wpdb;

    // Retrieve the {tribute_id} matched via the route '(?P<tribute_id>\d+)'
    $tribute_id = $request->get_param( 'tribute_id' );

    // Retrieve JSON body parameters
    $params      = $request->get_json_params();
    $custom_html = isset( $params['custom_html'] ) ? $params['custom_html'] : '';

    // If you want to sanitize HTML to allow certain tags, you can do:
    // $custom_html = wp_kses_post($custom_html);

    // Reference the tributes table
    $table_name = $wpdb->prefix . 'tributes';

    /**
     * For robust security, use $wpdb->update with a prepared statement.
     * $wpdb->update automatically prepares the SQL under the hood using
     * the provided format arrays.
     *
     * Provide data formats for each column to avoid SQL injection:
     *  - custom_html => %s
     *  - id => %d
     */
    $result = $wpdb->update(
        $table_name,
        array( 'custom_html' => $custom_html ),  // column => data
        array( 'id' => (int) $tribute_id ),      // where clause
        array( '%s' ),                           // data format for SET
        array( '%d' )                            // data format for WHERE
    );

    // If $result === false, a query error occurred
    if ( false === $result ) {
        error_log( 'Database update failed: ' . $wpdb->last_error );

        // Return error response
        return new WP_REST_Response(
            array(
                'error'   => true,
                'message' => 'Unable to update tribute in the database.',
            ),
            500
        );
    }

    // If $result === 0, no rows were updated (ID doesn't exist or no changes)
    if ( 0 === $result ) {
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
