<?php
/**
 * Plugin Name:     01A0101 New Tributestream Plugin
 * Plugin URI:      https://example.com/tributestream-plugin
 * Description:     A comprehensive WordPress plugin with CRUD operations for managing data related to funeral homes, schedules, tribute pages, locations, and events.
 * Version:         1.0.0
 * Author:          Roo
 * Author URI:      https://example.com/
 * License:         GPL-2.0+
 * License URI:     http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:     tributestream-plugin
 * Domain Path:     /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

/**
 * Currently plugin version.
 */
define( 'TRIBUTESTREAM_PLUGIN_VERSION', '1.0.0' );

/**
 * The code that runs during plugin activation.
 */
function activate_tributestream_plugin() {
    global $wpdb;

    $charset_collate = $wpdb->get_charset_collate();

    $table_name_funeral_homes   = $wpdb->prefix . 'tributestream_funeral_homes';
    $table_name_tribute_pages   = $wpdb->prefix . 'tributestream_tribute_pages';
    $table_name_locations       = $wpdb->prefix . 'tributestream_locations';
    $table_name_events          = $wpdb->prefix . 'tributestream_events';
    $table_name_schedules       = $wpdb->prefix . 'tributestream_schedules';

    // Create the funeral_homes table
    $sql_funeral_homes = "CREATE TABLE `{$table_name_funeral_homes}` (
        funeral_home_id INT(11) NOT NULL AUTO_INCREMENT,
        created_by_user_id BIGINT(20) UNSIGNED NOT NULL,
        fh_name VARCHAR(255) NOT NULL,
        fh_address VARCHAR(255) NOT NULL,
        fh_phone_number VARCHAR(20) NOT NULL,
        PRIMARY KEY (funeral_home_id),
        FOREIGN KEY (created_by_user_id) REFERENCES `{$wpdb->users}`(ID) ON DELETE CASCADE
    ) $charset_collate;";

    // Create the tribute_pages table
    $sql_tribute_pages = "CREATE TABLE `{$table_name_tribute_pages}` (
        tribute_id INT(11) NOT NULL AUTO_INCREMENT,
        created_by_user_id BIGINT(20) UNSIGNED NOT NULL,
        point_of_contact_user_id BIGINT(20) UNSIGNED NOT NULL,
        loved_ones_name VARCHAR(255) NOT NULL,
        slugified_name VARCHAR(255) NOT NULL,
        page_html LONGTEXT NOT NULL,
        loved_ones_dob DATE NULL,
        loved_ones_dod DATE NULL,
        PRIMARY KEY (tribute_id),
        FOREIGN KEY (created_by_user_id) REFERENCES `{$wpdb->users}`(ID) ON DELETE CASCADE,
        FOREIGN KEY (point_of_contact_user_id) REFERENCES `{$wpdb->users}`(ID) ON DELETE CASCADE
    ) $charset_collate;";

    // Create the locations table
    $sql_locations = "CREATE TABLE `{$table_name_locations}` (
        location_id INT(11) NOT NULL AUTO_INCREMENT,
        tribute_id INT(11) NOT NULL,
        location_name VARCHAR(255) NOT NULL,
        sort_order INT(11) NOT NULL,
        location_address VARCHAR(255) NOT NULL,
        PRIMARY KEY (location_id),
        FOREIGN KEY (tribute_id) REFERENCES `{$table_name_tribute_pages}`(tribute_id) ON DELETE CASCADE
    ) $charset_collate;";

    // Create the events table
    $sql_events = "CREATE TABLE `{$table_name_events}` (
        event_id INT(11) NOT NULL AUTO_INCREMENT,
        location_id INT(11) NOT NULL,
        stream_html LONGTEXT NOT NULL,
        start_time DATETIME NULL,
        end_time DATETIME NULL,
        PRIMARY KEY (event_id),
        FOREIGN KEY (location_id) REFERENCES `{$table_name_locations}`(location_id) ON DELETE CASCADE
    ) $charset_collate;";

    // Create the schedules table
    $sql_schedules = "CREATE TABLE `{$table_name_schedules}` (
        schedule_id INT(11) NOT NULL AUTO_INCREMENT,
        funeral_director_user_id BIGINT(20) UNSIGNED NOT NULL,
        funeral_home_id INT(11) NOT NULL,
        number_of_days INT(11) NOT NULL,
        tribute_id INT(11) NOT NULL,
        PRIMARY KEY (schedule_id),
        FOREIGN KEY (funeral_director_user_id) REFERENCES `{$wpdb->users}`(ID) ON DELETE CASCADE,
        FOREIGN KEY (funeral_home_id) REFERENCES `{$table_name_funeral_homes}`(funeral_home_id) ON DELETE CASCADE,
        FOREIGN KEY (tribute_id) REFERENCES `{$table_name_tribute_pages}`(tribute_id) ON DELETE CASCADE
    ) $charset_collate;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql_funeral_homes );
    dbDelta( $sql_tribute_pages );
    dbDelta( $sql_locations );
    dbDelta( $sql_events );
    dbDelta( $sql_schedules );
}

/**
 * The code that runs during plugin deactivation.
 */
function deactivate_tributestream_plugin() {
    // We won't drop tables on deactivation to prevent data loss
}

/**
 * The code that runs during plugin uninstallation.
 */
function uninstall_tributestream_plugin() {
    global $wpdb;

    $table_name_events          = $wpdb->prefix . 'tributestream_events';
    $table_name_locations       = $wpdb->prefix . 'tributestream_locations';
    $table_name_schedules       = $wpdb->prefix . 'tributestream_schedules';
    $table_name_tribute_pages   = $wpdb->prefix . 'tributestream_tribute_pages';
    $table_name_funeral_homes   = $wpdb->prefix . 'tributestream_funeral_homes';

    // Drop tables in the correct order to respect foreign key constraints
    $wpdb->query( "DROP TABLE IF EXISTS `{$table_name_events}`" );
    $wpdb->query( "DROP TABLE IF EXISTS `{$table_name_schedules}`" );
    $wpdb->query( "DROP TABLE IF EXISTS `{$table_name_locations}`" );
    $wpdb->query( "DROP TABLE IF EXISTS `{$table_name_tribute_pages}`" );
    $wpdb->query( "DROP TABLE IF EXISTS `{$table_name_funeral_homes}`" );
}

register_activation_hook( __FILE__, 'activate_tributestream_plugin' );
register_deactivation_hook( __FILE__, 'deactivate_tributestream_plugin' );
register_uninstall_hook( __FILE__, 'uninstall_tributestream_plugin' );

/**
 * Add REST API endpoints
 */
add_action( 'rest_api_init', function () {
    // Funeral Homes endpoints
    register_rest_route( 'tributestream/v1', '/funeral-homes', array(
        'methods'             => 'GET',
        'callback'            => 'get_funeral_homes',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/funeral-homes/(?P<id>\d+)', array(
        'methods'             => 'GET',
        'callback'            => 'get_funeral_home',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/funeral-homes', array(
        'methods'             => 'POST',
        'callback'            => 'create_funeral_home',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/funeral-homes/(?P<id>\d+)', array(
        'methods'             => 'PUT',
        'callback'            => 'update_funeral_home',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/funeral-homes/(?P<id>\d+)', array(
        'methods'             => 'DELETE',
        'callback'            => 'delete_funeral_home',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    // Schedules endpoints
    register_rest_route( 'tributestream/v1', '/schedules', array(
        'methods'             => 'GET',
        'callback'            => 'get_schedules',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/schedules/(?P<id>\d+)', array(
        'methods'             => 'GET',
        'callback'            => 'get_schedule',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/schedules', array(
        'methods'             => 'POST',
        'callback'            => 'create_schedule',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/schedules/(?P<id>\d+)', array(
        'methods'             => 'PUT',
        'callback'            => 'update_schedule',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/schedules/(?P<id>\d+)', array(
        'methods'             => 'DELETE',
        'callback'            => 'delete_schedule',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    // Tribute Pages endpoints
    register_rest_route( 'tributestream/v1', '/tribute-pages', array(
        'methods'             => 'GET',
        'callback'            => 'get_tribute_pages',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/tribute-pages/(?P<id>\d+)', array(
        'methods'             => 'GET',
        'callback'            => 'get_tribute_page',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/tribute-pages', array(
        'methods'             => 'POST',
        'callback'            => 'create_tribute_page',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/tribute-pages/(?P<id>\d+)', array(
        'methods'             => 'PUT',
        'callback'            => 'update_tribute_page',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/tribute-pages/(?P<id>\d+)', array(
        'methods'             => 'DELETE',
        'callback'            => 'delete_tribute_page',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    // Locations endpoints
    register_rest_route( 'tributestream/v1', '/locations', array(
        'methods'             => 'GET',
        'callback'            => 'get_locations',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/locations/(?P<id>\d+)', array(
        'methods'             => 'GET',
        'callback'            => 'get_location',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/locations', array(
        'methods'             => 'POST',
        'callback'            => 'create_location',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/locations/(?P<id>\d+)', array(
        'methods'             => 'PUT',
        'callback'            => 'update_location',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/locations/(?P<id>\d+)', array(
        'methods'             => 'DELETE',
        'callback'            => 'delete_location',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    // Events endpoints
    register_rest_route( 'tributestream/v1', '/events', array(
        'methods'             => 'GET',
        'callback'            => 'get_events',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/events/(?P<id>\d+)', array(
        'methods'             => 'GET',
        'callback'            => 'get_event',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/events', array(
        'methods'             => 'POST',
        'callback'            => 'create_event',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/events/(?P<id>\d+)', array(
        'methods'             => 'PUT',
        'callback'            => 'update_event',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));

    register_rest_route( 'tributestream/v1', '/events/(?P<id>\d+)', array(
        'methods'             => 'DELETE',
        'callback'            => 'delete_event',
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        }
    ));
});

/**
 * CRUD operations for Funeral Homes
 */
function get_funeral_homes() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_funeral_homes';
    $results = $wpdb->get_results( "SELECT * FROM `{$table_name}`", ARRAY_A );
    return $results;
}

function get_funeral_home( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_funeral_homes';
    $id = absint( $request['id'] );
    $result = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM `{$table_name}` WHERE funeral_home_id = %d", $id ), ARRAY_A );
    
    if ( ! $result ) {
        return new WP_Error( 'not_found', 'Funeral home not found', array( 'status' => 404 ) );
    }
    
    return $result;
}

function create_funeral_home( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_funeral_homes';
    
    $params = $request->get_params();

    // Validate required parameters
    if ( empty( $params['created_by_user_id'] ) || empty( $params['fh_name'] ) || empty( $params['fh_address'] ) || empty( $params['fh_phone_number'] ) ) {
        return new WP_Error( 'missing_params', 'Missing required parameters', array( 'status' => 400 ) );
    }
    
    $result = $wpdb->insert(
        $table_name,
        array(
            'created_by_user_id' => absint( $params['created_by_user_id'] ),
            'fh_name'            => sanitize_text_field( $params['fh_name'] ),
            'fh_address'         => sanitize_text_field( $params['fh_address'] ),
            'fh_phone_number'    => sanitize_text_field( $params['fh_phone_number'] )
        ),
        array(
            '%d',
            '%s',
            '%s',
            '%s'
        )
    );
    
    if ( ! $result ) {
        return new WP_Error( 'db_error', 'Error creating funeral home', array( 'status' => 500 ) );
    }
    
    $id = $wpdb->insert_id;
    
    return get_funeral_home( array( 'id' => $id ) );
}

function update_funeral_home( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_funeral_homes';
    $id = absint( $request['id'] );
    
    $params = $request->get_params();
    
    $existing = get_funeral_home( array( 'id' => $id ) );
    if ( is_wp_error( $existing ) ) {
        return $existing;
    }
    
    $result = $wpdb->update(
        $table_name,
        array(
            'created_by_user_id' => isset( $params['created_by_user_id'] ) ? absint( $params['created_by_user_id'] ) : $existing['created_by_user_id'],
            'fh_name'            => isset( $params['fh_name'] ) ? sanitize_text_field( $params['fh_name'] ) : $existing['fh_name'],
            'fh_address'         => isset( $params['fh_address'] ) ? sanitize_text_field( $params['fh_address'] ) : $existing['fh_address'],
            'fh_phone_number'    => isset( $params['fh_phone_number'] ) ? sanitize_text_field( $params['fh_phone_number'] ) : $existing['fh_phone_number']
        ),
        array( 'funeral_home_id' => $id ),
        array(
            '%d',
            '%s',
            '%s',
            '%s'
        ),
        array( '%d' )
    );
    
    if ( $result === false ) {
        return new WP_Error( 'db_error', 'Error updating funeral home', array( 'status' => 500 ) );
    }
    
    return get_funeral_home( array( 'id' => $id ) );
}

function delete_funeral_home( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_funeral_homes';
    $id = absint( $request['id'] );
    
    $existing = get_funeral_home( array( 'id' => $id ) );
    if ( is_wp_error( $existing ) ) {
        return $existing;
    }
    
    $result = $wpdb->delete(
        $table_name,
        array( 'funeral_home_id' => $id ),
        array( '%d' )
    );
    
    if ( ! $result ) {
        return new WP_Error( 'db_error', 'Error deleting funeral home', array( 'status' => 500 ) );
    }
    
    return array( 'success' => true, 'message' => 'Funeral home deleted successfully' );
}

/**
 * CRUD operations for Schedules
 */
function get_schedules() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_schedules';
    $results = $wpdb->get_results( "SELECT * FROM `{$table_name}`", ARRAY_A );
    return $results;
}

function get_schedule( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_schedules';
    $id = absint( $request['id'] );
    $result = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM `{$table_name}` WHERE schedule_id = %d", $id ), ARRAY_A );
    
    if ( ! $result ) {
        return new WP_Error( 'not_found', 'Schedule not found', array( 'status' => 404 ) );
    }
    
    return $result;
}

function create_schedule( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_schedules';
    
    $params = $request->get_params();
    
    if ( empty( $params['funeral_director_user_id'] ) || empty( $params['funeral_home_id'] ) || empty( $params['number_of_days'] ) || empty( $params['tribute_id'] ) ) {
        return new WP_Error( 'missing_params', 'Missing required parameters', array( 'status' => 400 ) );
    }
    
    $result = $wpdb->insert(
        $table_name,
        array(
            'funeral_director_user_id' => absint( $params['funeral_director_user_id'] ),
            'funeral_home_id'          => absint( $params['funeral_home_id'] ),
            'number_of_days'           => absint( $params['number_of_days'] ),
            'tribute_id'               => absint( $params['tribute_id'] )
        ),
        array(
            '%d',
            '%d',
            '%d',
            '%d'
        )
    );
    
    if ( ! $result ) {
        return new WP_Error( 'db_error', 'Error creating schedule', array( 'status' => 500 ) );
    }
    
    $id = $wpdb->insert_id;
    
    return get_schedule( array( 'id' => $id ) );
}

function update_schedule( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_schedules';
    $id = absint( $request['id'] );
    
    $params = $request->get_params();
    
    $existing = get_schedule( array( 'id' => $id ) );
    if ( is_wp_error( $existing ) ) {
        return $existing;
    }
    
    $result = $wpdb->update(
        $table_name,
        array(
            'funeral_director_user_id' => isset( $params['funeral_director_user_id'] ) ? absint( $params['funeral_director_user_id'] ) : $existing['funeral_director_user_id'],
            'funeral_home_id'          => isset( $params['funeral_home_id'] ) ? absint( $params['funeral_home_id'] ) : $existing['funeral_home_id'],
            'number_of_days'           => isset( $params['number_of_days'] ) ? absint( $params['number_of_days'] ) : $existing['number_of_days'],
            'tribute_id'               => isset( $params['tribute_id'] ) ? absint( $params['tribute_id'] ) : $existing['tribute_id']
        ),
        array( 'schedule_id' => $id ),
        array(
            '%d',
            '%d',
            '%d',
            '%d'
        ),
        array( '%d' )
    );
    
    if ( $result === false ) {
        return new WP_Error( 'db_error', 'Error updating schedule', array( 'status' => 500 ) );
    }
    
    return get_schedule( array( 'id' => $id ) );
}

function delete_schedule( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_schedules';
    $id = absint( $request['id'] );
    
    $existing = get_schedule( array( 'id' => $id ) );
    if ( is_wp_error( $existing ) ) {
        return $existing;
    }
    
    $result = $wpdb->delete(
        $table_name,
        array( 'schedule_id' => $id ),
        array( '%d' )
    );
    
    if ( ! $result ) {
        return new WP_Error( 'db_error', 'Error deleting schedule', array( 'status' => 500 ) );
    }
    
    return array( 'success' => true, 'message' => 'Schedule deleted successfully' );
}

/**
 * CRUD operations for Tribute Pages
 */
function get_tribute_pages() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_tribute_pages';
    $results = $wpdb->get_results( "SELECT * FROM `{$table_name}`", ARRAY_A );
    return $results;
}

function get_tribute_page( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_tribute_pages';
    $id = absint( $request['id'] );
    $result = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM `{$table_name}` WHERE tribute_id = %d", $id ), ARRAY_A );
    
    if ( ! $result ) {
        return new WP_Error( 'not_found', 'Tribute page not found', array( 'status' => 404 ) );
    }
    
    return $result;
}

function create_tribute_page( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_tribute_pages';
    
    $params = $request->get_params();
    
    if ( empty( $params['created_by_user_id'] ) || empty( $params['point_of_contact_user_id'] ) || empty( $params['loved_ones_name'] ) || empty( $params['page_html'] ) ) {
        return new WP_Error( 'missing_params', 'Missing required parameters', array( 'status' => 400 ) );
    }
    
    $loved_ones_name = sanitize_text_field( $params['loved_ones_name'] );
    
    $result = $wpdb->insert(
        $table_name,
        array(
            'created_by_user_id'      => absint( $params['created_by_user_id'] ),
            'point_of_contact_user_id'=> absint( $params['point_of_contact_user_id'] ),
            'loved_ones_name'         => $loved_ones_name,
            'slugified_name'          => sanitize_title( $loved_ones_name ),
            'page_html'               => wp_kses_post( $params['page_html'] ),
            'loved_ones_dob'          => isset( $params['loved_ones_dob'] ) ? sanitize_text_field( $params['loved_ones_dob'] ) : null,
            'loved_ones_dod'          => isset( $params['loved_ones_dod'] ) ? sanitize_text_field( $params['loved_ones_dod'] ) : null
        ),
        array(
            '%d',
            '%d',
            '%s',
            '%s',
            '%s',
            '%s',
            '%s'
        )
    );
    
    if ( ! $result ) {
        return new WP_Error( 'db_error', 'Error creating tribute page', array( 'status' => 500 ) );
    }
    
    $id = $wpdb->insert_id;
    
    return get_tribute_page( array( 'id' => $id ) );
}

function update_tribute_page( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_tribute_pages';
    $id = absint( $request['id'] );
    
    $params = $request->get_params();
    
    $existing = get_tribute_page( array( 'id' => $id ) );
    if ( is_wp_error( $existing ) ) {
        return $existing;
    }
    
    $update_data = array();
    $update_format = array();
    
    if ( isset( $params['created_by_user_id'] ) ) {
        $update_data['created_by_user_id'] = absint( $params['created_by_user_id'] );
        $update_format[] = '%d';
    }
    
    if ( isset( $params['point_of_contact_user_id'] ) ) {
        $update_data['point_of_contact_user_id'] = absint( $params['point_of_contact_user_id'] );
        $update_format[] = '%d';
    }
    
    if ( isset( $params['loved_ones_name'] ) ) {
        $loved_ones_name = sanitize_text_field( $params['loved_ones_name'] );
        $update_data['loved_ones_name'] = $loved_ones_name;
        $update_data['slugified_name'] = sanitize_title( $loved_ones_name );
        $update_format[] = '%s';
        $update_format[] = '%s';
    }
    
    if ( isset( $params['page_html'] ) ) {
        $update_data['page_html'] = wp_kses_post( $params['page_html'] );
        $update_format[] = '%s';
    }
    
    if ( isset( $params['loved_ones_dob'] ) ) {
        $update_data['loved_ones_dob'] = sanitize_text_field( $params['loved_ones_dob'] );
        $update_format[] = '%s';
    }
    
    if ( isset( $params['loved_ones_dod'] ) ) {
        $update_data['loved_ones_dod'] = sanitize_text_field( $params['loved_ones_dod'] );
        $update_format[] = '%s';
    }
    
    if ( empty( $update_data ) ) {
        return $existing;
    }
    
    $result = $wpdb->update(
        $table_name,
        $update_data,
        array( 'tribute_id' => $id ),
        $update_format,
        array( '%d' )
    );
    
    if ( $result === false ) {
        return new WP_Error( 'db_error', 'Error updating tribute page', array( 'status' => 500 ) );
    }
    
    return get_tribute_page( array( 'id' => $id ) );
}

function delete_tribute_page( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_tribute_pages';
    $id = absint( $request['id'] );
    
    $existing = get_tribute_page( array( 'id' => $id ) );
    if ( is_wp_error( $existing ) ) {
        return $existing;
    }
    
    $result = $wpdb->delete(
        $table_name,
        array( 'tribute_id' => $id ),
        array( '%d' )
    );
    
    if ( ! $result ) {
        return new WP_Error( 'db_error', 'Error deleting tribute page', array( 'status' => 500 ) );
    }
    
    return array( 'success' => true, 'message' => 'Tribute page deleted successfully' );
}

/**
 * CRUD operations for Locations
 */
function get_locations() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_locations';
    $results = $wpdb->get_results( "SELECT * FROM `{$table_name}`", ARRAY_A );
    return $results;
}

function get_location( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_locations';
    $id = absint( $request['id'] );
    $result = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM `{$table_name}` WHERE location_id = %d", $id ), ARRAY_A );
    
    if ( ! $result ) {
        return new WP_Error( 'not_found', 'Location not found', array( 'status' => 404 ) );
    }
    
    return $result;
}

function create_location( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_locations';
    
    $params = $request->get_params();
    
    if ( empty( $params['tribute_id'] ) || empty( $params['location_name'] ) || !isset( $params['sort_order'] ) || empty( $params['location_address'] ) ) {
        return new WP_Error( 'missing_params', 'Missing required parameters', array( 'status' => 400 ) );
    }
    
    $result = $wpdb->insert(
        $table_name,
        array(
            'tribute_id'       => absint( $params['tribute_id'] ),
            'location_name'    => sanitize_text_field( $params['location_name'] ),
            'sort_order'       => absint( $params['sort_order'] ),
            'location_address' => sanitize_text_field( $params['location_address'] )
        ),
        array(
            '%d',
            '%s',
            '%d',
            '%s'
        )
    );
    
    if ( ! $result ) {
        return new WP_Error( 'db_error', 'Error creating location', array( 'status' => 500 ) );
    }
    
    $id = $wpdb->insert_id;
    
    return get_location( array( 'id' => $id ) );
}

function update_location( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_locations';
    $id = absint( $request['id'] );
    
    $params = $request->get_params();
    
    $existing = get_location( array( 'id' => $id ) );
    if ( is_wp_error( $existing ) ) {
        return $existing;
    }
    
    $update_data = array();
    $update_format = array();
    
    if ( isset( $params['tribute_id'] ) ) {
        $update_data['tribute_id'] = absint( $params['tribute_id'] );
        $update_format[] = '%d';
    }
    
    if ( isset( $params['location_name'] ) ) {
        $update_data['location_name'] = sanitize_text_field( $params['location_name'] );
        $update_format[] = '%s';
    }
    
    if ( isset( $params['sort_order'] ) ) {
        $update_data['sort_order'] = absint( $params['sort_order'] );
        $update_format[] = '%d';
    }
    
    if ( isset( $params['location_address'] ) ) {
        $update_data['location_address'] = sanitize_text_field( $params['location_address'] );
        $update_format[] = '%s';
    }
    
    if ( empty( $update_data ) ) {
        return $existing;
    }
    
    $result = $wpdb->update(
        $table_name,
        $update_data,
        array( 'location_id' => $id ),
        $update_format,
        array( '%d' )
    );
    
    if ( $result === false ) {
        return new WP_Error( 'db_error', 'Error updating location', array( 'status' => 500 ) );
    }
    
    return get_location( array( 'id' => $id ) );
}

function delete_location( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_locations';
    $id = absint( $request['id'] );
    
    $existing = get_location( array( 'id' => $id ) );
    if ( is_wp_error( $existing ) ) {
        return $existing;
    }
    
    $result = $wpdb->delete(
        $table_name,
        array( 'location_id' => $id ),
        array( '%d' )
    );
    
    if ( ! $result ) {
        return new WP_Error( 'db_error', 'Error deleting location', array( 'status' => 500 ) );
    }
    
    return array( 'success' => true, 'message' => 'Location deleted successfully' );
}

/**
 * CRUD operations for Events
 */
function get_events() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_events';
    $results = $wpdb->get_results( "SELECT * FROM `{$table_name}`", ARRAY_A );
    return $results;
}

function get_event( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_events';
    $id = absint( $request['id'] );
    $result = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM `{$table_name}` WHERE event_id = %d", $id ), ARRAY_A );
    
    if ( ! $result ) {
        return new WP_Error( 'not_found', 'Event not found', array( 'status' => 404 ) );
    }
    
    return $result;
}

function create_event( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_events';
    
    $params = $request->get_params();
    
    if ( empty( $params['location_id'] ) || empty( $params['stream_html'] ) ) {
        return new WP_Error( 'missing_params', 'Missing required parameters', array( 'status' => 400 ) );
    }
    
    $result = $wpdb->insert(
        $table_name,
        array(
            'location_id' => absint( $params['location_id'] ),
            'stream_html' => wp_kses_post( $params['stream_html'] ),
            'start_time'  => isset( $params['start_time'] ) ? sanitize_text_field( $params['start_time'] ) : null,
            'end_time'    => isset( $params['end_time'] ) ? sanitize_text_field( $params['end_time'] ) : null,
        ),
        array(
            '%d',
            '%s',
            '%s',
            '%s'
        )
    );
    
    if ( ! $result ) {
        return new WP_Error( 'db_error', 'Error creating event', array( 'status' => 500 ) );
    }
    
    $id = $wpdb->insert_id;
    
    return get_event( array( 'id' => $id ) );
}

function update_event( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_events';
    $id = absint( $request['id'] );
    
    $params = $request->get_params();
    
    $existing = get_event( array( 'id' => $id ) );
    if ( is_wp_error( $existing ) ) {
        return $existing;
    }
    
    $update_data = array();
    $update_format = array();
    
    if ( isset( $params['location_id'] ) ) {
        $update_data['location_id'] = absint( $params['location_id'] );
        $update_format[] = '%d';
    }
    
    if ( isset( $params['stream_html'] ) ) {
        $update_data['stream_html'] = wp_kses_post( $params['stream_html'] );
        $update_format[] = '%s';
    }
    
    if ( isset( $params['start_time'] ) ) {
        $update_data['start_time'] = sanitize_text_field( $params['start_time'] );
        $update_format[] = '%s';
    }
    
    if ( isset( $params['end_time'] ) ) {
        $update_data['end_time'] = sanitize_text_field( $params['end_time'] );
        $update_format[] = '%s';
    }
    
    if ( empty( $update_data ) ) {
        return $existing;
    }
    
    $result = $wpdb->update(
        $table_name,
        $update_data,
        array( 'event_id' => $id ),
        $update_format,
        array( '%d' )
    );
    
    if ( $result === false ) {
        return new WP_Error( 'db_error', 'Error updating event', array( 'status' => 500 ) );
    }
    
    return get_event( array( 'id' => $id ) );
}

function delete_event( $request ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributestream_events';
    $id = absint( $request['id'] );
    
    $existing = get_event( array( 'id' => $id ) );
    if ( is_wp_error( $existing ) ) {
        return $existing;
    }
    
    $result = $wpdb->delete(
        $table_name,
        array( 'event_id' => $id ),
        array( '%d' )
    );
    
    if ( ! $result ) {
        return new WP_Error( 'db_error', 'Error deleting event', array( 'status' => 500 ) );
    }
    
    return array( 'success' => true, 'message' => 'Event deleted successfully' );
}
