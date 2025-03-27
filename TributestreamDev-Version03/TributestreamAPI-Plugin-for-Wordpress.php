<?php
/**
 * Plugin Name: Funeral CRUD (v2)
 * Description: Provides CRUD endpoints (v2) for a custom funeral database with JWT authentication.
 * Version: 1.0.0
 * Author: Your Name
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

class FuneralCRUDPluginV2 {

    /**
     * Constructor - hooks into WordPress.
     */
    public function __construct() {
        // Hook into REST API initialization
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    /**
     * Register all custom REST API routes under the "funeral/v2" namespace.
     */
    public function register_routes() {

        // --------------------------------------------------------------------
        //  1. TRIBUTE PAGE by SLUG (UNAUTHENTICATED)
        // --------------------------------------------------------------------
        register_rest_route( 
            'funeral/v2', 
            '/tribute-page/(?P<slug>[a-zA-Z0-9-]+)/', 
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_tribute_by_slug' ],
                // No authentication required
                'permission_callback' => '__return_true',
            ]
        );

        // --------------------------------------------------------------------
        //  2. FUNERAL HOMES CRUD
        // --------------------------------------------------------------------
        // GET ALL funeral homes
        register_rest_route(
            'funeral/v2',
            '/funeral-homes',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_funeral_homes' ],
                // We allow GET to be public or protected—up to you.
                'permission_callback' => [ $this, 'permission_check_public' ],
            ]
        );

        // GET SINGLE funeral home by ID
        register_rest_route(
            'funeral/v2',
            '/funeral-homes/(?P<id>\d+)',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_funeral_home' ],
                'permission_callback' => [ $this, 'permission_check_public' ],
            ]
        );

        // CREATE funeral home (POST)
        register_rest_route(
            'funeral/v2',
            '/funeral-homes',
            [
                'methods'  => 'POST',
                'callback' => [ $this, 'create_funeral_home' ],
                // Require JWT auth
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // UPDATE funeral home (PUT/PATCH)
        register_rest_route(
            'funeral/v2',
            '/funeral-homes/(?P<id>\d+)',
            [
                'methods'  => [ 'PUT', 'PATCH' ],
                'callback' => [ $this, 'update_funeral_home' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // DELETE funeral home (DELETE)
        register_rest_route(
            'funeral/v2',
            '/funeral-homes/(?P<id>\d+)',
            [
                'methods'  => 'DELETE',
                'callback' => [ $this, 'delete_funeral_home' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // --------------------------------------------------------------------
        //  3. SCHEDULE CRUD
        //  (Add similarly for each table: schedule, tribute_page, locations, events, users)
        // --------------------------------------------------------------------
        // For brevity, we'll show just one more set (Schedule).
        // Replicate for 'tribute_page', 'locations', 'events', 'users', etc.
        
        // GET ALL schedules
        register_rest_route(
            'funeral/v2',
            '/schedules',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_schedules' ],
                'permission_callback' => [ $this, 'permission_check_public' ],
            ]
        );

        // GET SINGLE schedule by ID
        register_rest_route(
            'funeral/v2',
            '/schedules/(?P<id>\d+)',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_schedule' ],
                'permission_callback' => [ $this, 'permission_check_public' ],
            ]
        );

        // CREATE schedule
        register_rest_route(
            'funeral/v2',
            '/schedules',
            [
                'methods'  => 'POST',
                'callback' => [ $this, 'create_schedule' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // UPDATE schedule
        register_rest_route(
            'funeral/v2',
            '/schedules/(?P<id>\d+)',
            [
                'methods'  => [ 'PUT', 'PATCH' ],
                'callback' => [ $this, 'update_schedule' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // DELETE schedule
        register_rest_route(
            'funeral/v2',
            '/schedules/(?P<id>\d+)',
            [
                'methods'  => 'DELETE',
                'callback' => [ $this, 'delete_schedule' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // --------------------------------------------------------------------
        // ADD SIMILAR CRUD ROUTES FOR: tribute_page, locations, events, users
        // --------------------------------------------------------------------
    }

    // ------------------------------------------------------------------------
    // PERMISSION CHECKS (using JWT plugin, it sets current user if token is valid)
    // ------------------------------------------------------------------------
    public function permission_check_public() {
        // For endpoints that you want publicly accessible (GET only)
        return true;
    }

    public function permission_check_protected() {
        // This requires the request to have a valid JWT token
        // i.e., the user must be logged in via JWT
        // Example check: 
        return is_user_logged_in();
    }

    // ------------------------------------------------------------------------
    // 1. TRIBUTE PAGE by SLUG (UNAUTHENTICATED)
    // ------------------------------------------------------------------------
    public function get_tribute_by_slug( $request ) {
        global $wpdb;

        $slug = sanitize_text_field( $request['slug'] );

        // Adjust table name if needed (prefix, etc.)
        $table = 'tribute_page'; 

        // Prepare the query safely
        $sql = $wpdb->prepare( "SELECT * FROM `$table` WHERE `slugified_name` = %s LIMIT 1", $slug );
        $row = $wpdb->get_row( $sql );

        if ( ! $row ) {
            return new WP_Error( 'no_tribute_found', 'No tribute found with that slug.', [ 'status' => 404 ] );
        }

        return [
            'success' => true,
            'data'    => $row,
        ];
    }

    // ------------------------------------------------------------------------
    // 2. FUNERAL HOMES CRUD
    // ------------------------------------------------------------------------
    // GET ALL
    public function get_funeral_homes( $request ) {
        global $wpdb;
        $table = 'funeral_home';
        $results = $wpdb->get_results( "SELECT * FROM `$table`" );
        return [
            'success' => true,
            'data'    => $results,
        ];
    }

    // GET SINGLE
    public function get_funeral_home( $request ) {
        global $wpdb;
        $table = 'funeral_home';
        $id    = absint( $request['id'] );

        $sql = $wpdb->prepare( "SELECT * FROM `$table` WHERE funeral_home_id = %d", $id );
        $row = $wpdb->get_row( $sql );

        if ( ! $row ) {
            return new WP_Error( 'not_found', 'Funeral home not found.', [ 'status' => 404 ] );
        }

        return [
            'success' => true,
            'data'    => $row,
        ];
    }

    // CREATE (POST)
    public function create_funeral_home( $request ) {
        global $wpdb;
        $table = 'funeral_home';

        // Extract and sanitize fields from request body
        $created_by_user_id = isset( $request['created_by_user_id'] ) ? absint( $request['created_by_user_id'] ) : 0;
        $fh_address         = isset( $request['fh_address'] ) ? sanitize_text_field( $request['fh_address'] ) : '';
        $fh_phone_number    = isset( $request['fh_phone_number'] ) ? sanitize_text_field( $request['fh_phone_number'] ) : '';

        // Insert data
        $inserted = $wpdb->insert(
            $table,
            [
                'created_by_user_id' => $created_by_user_id,
                'fh_address'         => $fh_address,
                'fh_phone_number'    => $fh_phone_number,
            ],
            [ '%d', '%s', '%s' ]
        );

        if ( false === $inserted ) {
            return new WP_Error( 'db_insert_error', 'Could not create funeral home.', [ 'status' => 500 ] );
        }

        return [
            'success' => true,
            'data'    => [
                'funeral_home_id' => $wpdb->insert_id,
            ],
        ];
    }

    // UPDATE (PUT/PATCH)
    public function update_funeral_home( $request ) {
        global $wpdb;
        $table = 'funeral_home';
        $id    = absint( $request['id'] );

        // Make sure the row exists first
        $existing = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM `$table` WHERE funeral_home_id = %d", $id ) );
        if ( ! $existing ) {
            return new WP_Error( 'not_found', 'Funeral home not found.', [ 'status' => 404 ] );
        }

        // Extract and sanitize fields
        $fields_to_update = [];
        $formats          = [];

        if ( isset( $request['created_by_user_id'] ) ) {
            $fields_to_update['created_by_user_id'] = absint( $request['created_by_user_id'] );
            $formats[] = '%d';
        }
        if ( isset( $request['fh_address'] ) ) {
            $fields_to_update['fh_address'] = sanitize_text_field( $request['fh_address'] );
            $formats[] = '%s';
        }
        if ( isset( $request['fh_phone_number'] ) ) {
            $fields_to_update['fh_phone_number'] = sanitize_text_field( $request['fh_phone_number'] );
            $formats[] = '%s';
        }

        if ( empty( $fields_to_update ) ) {
            return new WP_Error( 'no_update', 'No valid fields provided for update.', [ 'status' => 400 ] );
        }

        $updated = $wpdb->update(
            $table,
            $fields_to_update,
            [ 'funeral_home_id' => $id ],
            $formats,
            [ '%d' ]
        );

        if ( false === $updated ) {
            return new WP_Error( 'db_update_error', 'Could not update funeral home.', [ 'status' => 500 ] );
        }

        return [
            'success' => true,
            'data'    => [
                'funeral_home_id' => $id,
            ],
        ];
    }

    // DELETE
    public function delete_funeral_home( $request ) {
        global $wpdb;
        $table = 'funeral_home';
        $id    = absint( $request['id'] );

        // Make sure the row exists first
        $existing = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM `$table` WHERE funeral_home_id = %d", $id ) );
        if ( ! $existing ) {
            return new WP_Error( 'not_found', 'Funeral home not found.', [ 'status' => 404 ] );
        }

        $deleted = $wpdb->delete(
            $table,
            [ 'funeral_home_id' => $id ],
            [ '%d' ]
        );

        if ( false === $deleted ) {
            return new WP_Error( 'db_delete_error', 'Could not delete funeral home.', [ 'status' => 500 ] );
        }

        return [
            'success' => true,
            'data'    => [
                'deleted_id' => $id,
            ],
        ];
    }

    // ------------------------------------------------------------------------
    // 3. SCHEDULE CRUD (SIMILAR PATTERN)
    // ------------------------------------------------------------------------
    public function get_schedules( $request ) {
        global $wpdb;
        $table = 'schedule';
        $results = $wpdb->get_results( "SELECT * FROM `$table`" );
        return [
            'success' => true,
            'data'    => $results,
        ];
    }

    public function get_schedule( $request ) {
        global $wpdb;
        $table = 'schedule';
        $id    = absint( $request['id'] );

        $sql = $wpdb->prepare( "SELECT * FROM `$table` WHERE schedule_id = %d", $id );
        $row = $wpdb->get_row( $sql );

        if ( ! $row ) {
            return new WP_Error( 'not_found', 'Schedule not found.', [ 'status' => 404 ] );
        }

        return [
            'success' => true,
            'data'    => $row,
        ];
    }

    public function create_schedule( $request ) {
        global $wpdb;
        $table = 'schedule';

        $funeral_director_user_id = isset( $request['funeral_director_user_id'] ) ? absint( $request['funeral_director_user_id'] ) : 0;
        $tribute_id               = isset( $request['tribute_id'] ) ? absint( $request['tribute_id'] ) : 0;
        $number_of_days           = isset( $request['number_of_days'] ) ? absint( $request['number_of_days'] ) : 0;

        $inserted = $wpdb->insert(
            $table,
            [
                'funeral_director_user_id' => $funeral_director_user_id,
                'tribute_id'               => $tribute_id,
                'number_of_days'           => $number_of_days,
            ],
            [ '%d', '%d', '%d' ]
        );

        if ( false === $inserted ) {
            return new WP_Error( 'db_insert_error', 'Could not create schedule.', [ 'status' => 500 ] );
        }

        return [
            'success' => true,
            'data'    => [
                'schedule_id' => $wpdb->insert_id,
            ],
        ];
    }

    public function update_schedule( $request ) {
        global $wpdb;
        $table = 'schedule';
        $id    = absint( $request['id'] );

        $existing = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM `$table` WHERE schedule_id = %d", $id ) );
        if ( ! $existing ) {
            return new WP_Error( 'not_found', 'Schedule not found.', [ 'status' => 404 ] );
        }

        $fields_to_update = [];
        $formats          = [];

        if ( isset( $request['funeral_director_user_id'] ) ) {
            $fields_to_update['funeral_director_user_id'] = absint( $request['funeral_director_user_id'] );
            $formats[] = '%d';
        }
        if ( isset( $request['tribute_id'] ) ) {
            $fields_to_update['tribute_id'] = absint( $request['tribute_id'] );
            $formats[] = '%d';
        }
        if ( isset( $request['number_of_days'] ) ) {
            $fields_to_update['number_of_days'] = absint( $request['number_of_days'] );
            $formats[] = '%d';
        }

        if ( empty( $fields_to_update ) ) {
            return new WP_Error( 'no_update', 'No valid fields provided for update.', [ 'status' => 400 ] );
        }

        $updated = $wpdb->update(
            $table,
            $fields_to_update,
            [ 'schedule_id' => $id ],
            $formats,
            [ '%d' ]
        );

        if ( false === $updated ) {
            return new WP_Error( 'db_update_error', 'Could not update schedule.', [ 'status' => 500 ] );
        }

        return [
            'success' => true,
            'data'    => [
                'schedule_id' => $id,
            ],
        ];
    }

    public function delete_schedule( $request ) {
        global $wpdb;
        $table = 'schedule';
        $id    = absint( $request['id'] );

        $existing = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM `$table` WHERE schedule_id = %d", $id ) );
        if ( ! $existing ) {
            return new WP_Error( 'not_found', 'Schedule not found.', [ 'status' => 404 ] );
        }

        $deleted = $wpdb->delete(
            $table,
            [ 'schedule_id' => $id ],
            [ '%d' ]
        );

        if ( false === $deleted ) {
            return new WP_Error( 'db_delete_error', 'Could not delete schedule.', [ 'status' => 500 ] );
        }

        return [
            'success' => true,
            'data'    => [
                'deleted_id' => $id,
            ],
        ];
    }

    // ------------------------------------------------------------------------
    // REPEAT THE SAME PATTERN FOR THE OTHER TABLES (tribute_page, locations, events, users)
    // ------------------------------------------------------------------------

} // end class FuneralCRUDPluginV2

// Instantiate the plugin
new FuneralCRUDPluginV2();
