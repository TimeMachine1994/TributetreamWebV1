<?php
/**
 * Plugin Name: 01AA Tributestream API
 * Description: Provides REST API endpoints for the Tributestream application with JWT authentication.
 * Version: 1.0.0
 * Author: Tributestream Development Team
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

class TributestreamAPI {

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
        //  1. TRIBUTE PAGES CRUD
        // --------------------------------------------------------------------
        
        // GET ALL tribute pages
        register_rest_route(
            'funeral/v2',
            '/tribute-pages',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_tribute_pages' ],
                'permission_callback' => [ $this, 'permission_check_public' ],
            ]
        );

        // GET SINGLE tribute page by ID
        register_rest_route(
            'funeral/v2',
            '/tribute-pages/(?P<id>\d+)',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_tribute_page' ],
                'permission_callback' => [ $this, 'permission_check_public' ],
            ]
        );

        // GET tribute page by slug (UNAUTHENTICATED)
        register_rest_route(
            'funeral/v2',
            '/tribute-pages/by-slug/(?P<slug>[a-zA-Z0-9-]+)',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_tribute_by_slug' ],
                'permission_callback' => '__return_true',
            ]
        );

        // CREATE tribute page (POST)
        register_rest_route(
            'funeral/v2',
            '/tribute-pages',
            [
                'methods'  => 'POST',
                'callback' => [ $this, 'create_tribute_page' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // UPDATE tribute page (PUT/PATCH)
        register_rest_route(
            'funeral/v2',
            '/tribute-pages/(?P<id>\d+)',
            [
                'methods'  => [ 'PUT', 'PATCH' ],
                'callback' => [ $this, 'update_tribute_page' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // DELETE tribute page (DELETE)
        register_rest_route(
            'funeral/v2',
            '/tribute-pages/(?P<id>\d+)',
            [
                'methods'  => 'DELETE',
                'callback' => [ $this, 'delete_tribute_page' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // --------------------------------------------------------------------
        //  2. LOCATIONS CRUD
        // --------------------------------------------------------------------
        
        // GET ALL locations
        register_rest_route(
            'funeral/v2',
            '/locations',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_locations' ],
                'permission_callback' => [ $this, 'permission_check_public' ],
            ]
        );

        // GET SINGLE location by ID
        register_rest_route(
            'funeral/v2',
            '/locations/(?P<id>\d+)',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_location' ],
                'permission_callback' => [ $this, 'permission_check_public' ],
            ]
        );

        // GET locations for a tribute
        register_rest_route(
            'funeral/v2',
            '/tribute-pages/(?P<id>\d+)/locations',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_locations_by_tribute' ],
                'permission_callback' => [ $this, 'permission_check_public' ],
            ]
        );

        // CREATE location (POST)
        register_rest_route(
            'funeral/v2',
            '/locations',
            [
                'methods'  => 'POST',
                'callback' => [ $this, 'create_location' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // UPDATE location (PUT/PATCH)
        register_rest_route(
            'funeral/v2',
            '/locations/(?P<id>\d+)',
            [
                'methods'  => [ 'PUT', 'PATCH' ],
                'callback' => [ $this, 'update_location' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // DELETE location (DELETE)
        register_rest_route(
            'funeral/v2',
            '/locations/(?P<id>\d+)',
            [
                'methods'  => 'DELETE',
                'callback' => [ $this, 'delete_location' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // --------------------------------------------------------------------
        //  3. EVENTS CRUD
        // --------------------------------------------------------------------
        
        // GET ALL events
        register_rest_route(
            'funeral/v2',
            '/events',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_events' ],
                'permission_callback' => [ $this, 'permission_check_public' ],
            ]
        );

        // GET SINGLE event by ID
        register_rest_route(
            'funeral/v2',
            '/events/(?P<id>\d+)',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_event' ],
                'permission_callback' => [ $this, 'permission_check_public' ],
            ]
        );

        // GET active events (not ended yet)
        register_rest_route(
            'funeral/v2',
            '/events/active',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_active_events' ],
                'permission_callback' => [ $this, 'permission_check_public' ],
            ]
        );

        // GET events for a location
        register_rest_route(
            'funeral/v2',
            '/locations/(?P<id>\d+)/events',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_events_by_location' ],
                'permission_callback' => [ $this, 'permission_check_public' ],
            ]
        );

        // GET events for a tribute
        register_rest_route(
            'funeral/v2',
            '/tribute-pages/(?P<id>\d+)/events',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_events_by_tribute' ],
                'permission_callback' => [ $this, 'permission_check_public' ],
            ]
        );

        // CREATE event (POST)
        register_rest_route(
            'funeral/v2',
            '/events',
            [
                'methods'  => 'POST',
                'callback' => [ $this, 'create_event' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // UPDATE event (PUT/PATCH)
        register_rest_route(
            'funeral/v2',
            '/events/(?P<id>\d+)',
            [
                'methods'  => [ 'PUT', 'PATCH' ],
                'callback' => [ $this, 'update_event' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // DELETE event (DELETE)
        register_rest_route(
            'funeral/v2',
            '/events/(?P<id>\d+)',
            [
                'methods'  => 'DELETE',
                'callback' => [ $this, 'delete_event' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // --------------------------------------------------------------------
        //  4. USER MANAGEMENT
        // --------------------------------------------------------------------
        
        // GET ALL users (admin only)
        register_rest_route(
            'funeral/v2',
            '/users',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_users' ],
                'permission_callback' => [ $this, 'permission_check_admin' ],
            ]
        );

        // GET SINGLE user by ID (admin or self)
        register_rest_route(
            'funeral/v2',
            '/users/(?P<id>\d+)',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_user' ],
                'permission_callback' => [ $this, 'permission_check_user_access' ],
            ]
        );

        // GET current user
        register_rest_route(
            'funeral/v2',
            '/users/me',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_current_user' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // CREATE user (POST)
        register_rest_route(
            'funeral/v2',
            '/users',
            [
                'methods'  => 'POST',
                'callback' => [ $this, 'create_user' ],
                'permission_callback' => [ $this, 'permission_check_admin' ],
            ]
        );

        // UPDATE user (PUT/PATCH)
        register_rest_route(
            'funeral/v2',
            '/users/(?P<id>\d+)',
            [
                'methods'  => [ 'PUT', 'PATCH' ],
                'callback' => [ $this, 'update_user' ],
                'permission_callback' => [ $this, 'permission_check_user_access' ],
            ]
        );

        // DELETE user (DELETE)
        register_rest_route(
            'funeral/v2',
            '/users/(?P<id>\d+)',
            [
                'methods'  => 'DELETE',
                'callback' => [ $this, 'delete_user' ],
                'permission_callback' => [ $this, 'permission_check_admin' ],
            ]
        );

        // --------------------------------------------------------------------
        //  5. FUNERAL HOMES CRUD
        // --------------------------------------------------------------------
        
        // GET ALL funeral homes
        register_rest_route(
            'funeral/v2',
            '/funeral-homes',
            [
                'methods'  => 'GET',
                'callback' => [ $this, 'get_funeral_homes' ],
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
        //  6. SCHEDULE CRUD
        // --------------------------------------------------------------------
        
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

        // CREATE schedule (POST)
        register_rest_route(
            'funeral/v2',
            '/schedules',
            [
                'methods'  => 'POST',
                'callback' => [ $this, 'create_schedule' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // UPDATE schedule (PUT/PATCH)
        register_rest_route(
            'funeral/v2',
            '/schedules/(?P<id>\d+)',
            [
                'methods'  => [ 'PUT', 'PATCH' ],
                'callback' => [ $this, 'update_schedule' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );

        // DELETE schedule (DELETE)
        register_rest_route(
            'funeral/v2',
            '/schedules/(?P<id>\d+)',
            [
                'methods'  => 'DELETE',
                'callback' => [ $this, 'delete_schedule' ],
                'permission_callback' => [ $this, 'permission_check_protected' ],
            ]
        );
    }

    // ------------------------------------------------------------------------
    // PERMISSION CHECKS
    // ------------------------------------------------------------------------
    
    /**
     * Permission check for public endpoints
     * 
     * @return bool Always returns true
     */
    public function permission_check_public() {
        // For endpoints that are publicly accessible (GET only)
        return true;
    }

    /**
     * Permission check for protected endpoints
     * 
     * @return bool True if user is logged in, false otherwise
     */
    public function permission_check_protected() {
        // This requires the request to have a valid JWT token
        // i.e., the user must be logged in via JWT
        return is_user_logged_in();
    }

    /**
     * Permission check for admin-only endpoints
     * 
     * @return bool True if user is an administrator, false otherwise
     */
    public function permission_check_admin() {
        // Check if user is logged in and has administrator role
        if (!is_user_logged_in()) {
            return false;
        }
        
        $user = wp_get_current_user();
        return in_array('administrator', (array) $user->roles);
    }

    /**
     * Permission check for user access (self or admin)
     * 
     * @param WP_REST_Request $request The request object
     * @return bool True if user is accessing their own data or is an admin
     */
    public function permission_check_user_access($request) {
        if (!is_user_logged_in()) {
            return false;
        }
        
        $user_id = absint($request['id']);
        $current_user_id = get_current_user_id();
        
        // Allow if user is accessing their own data
        if ($user_id === $current_user_id) {
            return true;
        }
        
        // Allow if user is an administrator
        $user = wp_get_current_user();
        return in_array('administrator', (array) $user->roles);
    }

    // ------------------------------------------------------------------------
    // VALIDATION FUNCTIONS
    // ------------------------------------------------------------------------
    
    /**
     * Validate tribute page data
     *
     * @param array $data The data to validate
     * @return array Validation result with 'valid' and 'errors' keys
     */
    private function validate_tribute_data($data) {
        $errors = [];
        
        // Check required fields
        if (empty($data['created_by_user_id'])) {
            $errors[] = 'created_by_user_id is required';
        }
        
        if (empty($data['loved_ones_name'])) {
            $errors[] = 'loved_ones_name is required';
        }
        
        // Validate foreign keys
        if (!empty($data['created_by_user_id'])) {
            $user_exists = get_user_by('ID', absint($data['created_by_user_id']));
            if (!$user_exists) {
                $errors[] = 'Invalid created_by_user_id: User does not exist';
            }
        }
        
        if (!empty($data['point_of_contact_user_id'])) {
            $user_exists = get_user_by('ID', absint($data['point_of_contact_user_id']));
            if (!$user_exists) {
                $errors[] = 'Invalid point_of_contact_user_id: User does not exist';
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Validate location data
     *
     * @param array $data The data to validate
     * @return array Validation result with 'valid' and 'errors' keys
     */
    private function validate_location_data($data) {
        $errors = [];
        
        // Check required fields
        if (empty($data['tribute_id'])) {
            $errors[] = 'tribute_id is required';
        }
        
        if (empty($data['location_name'])) {
            $errors[] = 'location_name is required';
        }
        
        if (empty($data['location_address'])) {
            $errors[] = 'location_address is required';
        }
        
        // Validate foreign keys
        if (!empty($data['tribute_id'])) {
            global $wpdb;
            $tribute_exists = $wpdb->get_var(
                $wpdb->prepare("SELECT COUNT(*) FROM tribute_page WHERE tribute_id = %d", absint($data['tribute_id']))
            );
            
            if (!$tribute_exists) {
                $errors[] = 'Invalid tribute_id: Tribute does not exist';
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Validate event data
     *
     * @param array $data The data to validate
     * @return array Validation result with 'valid' and 'errors' keys
     */
    private function validate_event_data($data) {
        $errors = [];
        
        // Check required fields
        if (empty($data['location_id'])) {
            $errors[] = 'location_id is required';
        }
        
        if (empty($data['start_time'])) {
            $errors[] = 'start_time is required';
        }
        
        if (empty($data['end_time'])) {
            $errors[] = 'end_time is required';
        }
        
        // Validate foreign keys
        if (!empty($data['location_id'])) {
            global $wpdb;
            $location_exists = $wpdb->get_var(
                $wpdb->prepare("SELECT COUNT(*) FROM locations WHERE location_id = %d", absint($data['location_id']))
            );
            
            if (!$location_exists) {
                $errors[] = 'Invalid location_id: Location does not exist';
            }
        }
        
        // Validate date/time format and logic
        if (!empty($data['start_time']) && !empty($data['end_time'])) {
            $start_time = strtotime($data['start_time']);
            $end_time = strtotime($data['end_time']);
            
            if ($start_time === false) {
                $errors[] = 'Invalid start_time format';
            }
            
            if ($end_time === false) {
                $errors[] = 'Invalid end_time format';
            }
            
            if ($start_time !== false && $end_time !== false && $start_time >= $end_time) {
                $errors[] = 'start_time must be before end_time';
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Validate user data
     *
     * @param array $data The data to validate
     * @param bool $is_create Whether this is for user creation
     * @return array Validation result with 'valid' and 'errors' keys
     */
    private function validate_user_data($data, $is_create = false) {
        $errors = [];
        
        // Check required fields for creation
        if ($is_create) {
            if (empty($data['email_address'])) {
                $errors[] = 'email_address is required';
            }
            
            if (empty($data['password'])) {
                $errors[] = 'password is required';
            }
            
            if (empty($data['user_type'])) {
                $errors[] = 'user_type is required';
            }
        }
        
        // Validate email format
        if (!empty($data['email_address']) && !is_email($data['email_address'])) {
            $errors[] = 'Invalid email_address format';
        }
        
        // Validate user_type
        if (!empty($data['user_type'])) {
            $valid_user_types = ['admin', 'funeral_director', 'family_member', 'guest'];
            if (!in_array($data['user_type'], $valid_user_types)) {
                $errors[] = 'Invalid user_type. Must be one of: ' . implode(', ', $valid_user_types);
            }
        }
        
        // Validate password strength if provided
        if (!empty($data['password']) && strlen($data['password']) < 8) {
            $errors[] = 'Password must be at least 8 characters long';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    // ------------------------------------------------------------------------
    // 1. TRIBUTE PAGES CRUD
    // ------------------------------------------------------------------------
    
    /**
     * Get all tribute pages with optional filtering
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_tribute_pages($request) {
        global $wpdb;
        $table = 'tributes';
        
        try {
            // Extract query parameters
            $page = isset($request['page']) ? absint($request['page']) : 1;
            $per_page = isset($request['per_page']) ? absint($request['per_page']) : 10;
            $search = isset($request['search']) ? sanitize_text_field($request['search']) : '';
            $user_id = isset($request['user_id']) ? absint($request['user_id']) : 0;
            
            // Calculate offset
            $offset = ($page - 1) * $per_page;
            
            // Build the query
            $where_clauses = [];
            $where_values = [];
            
            if (!empty($search)) {
                $where_clauses[] = 'loved_ones_name LIKE %s';
                $where_values[] = '%' . $wpdb->esc_like($search) . '%';
            }
            
            if ($user_id > 0) {
                $where_clauses[] = 'created_by_user_id = %d';
                $where_values[] = $user_id;
            }
            
            // Combine where clauses
            $where_sql = '';
            if (!empty($where_clauses)) {
                $where_sql = 'WHERE ' . implode(' AND ', $where_clauses);
            }
            
            // Get total count for pagination
            $count_query = "SELECT COUNT(*) FROM `$table` $where_sql";
            $total_items = $wpdb->get_var($wpdb->prepare($count_query, $where_values));
            
            // Get paginated results
            $query = "SELECT * FROM `$table` $where_sql ORDER BY loved_ones_name ASC LIMIT %d OFFSET %d";
            $prepared_values = array_merge($where_values, [$per_page, $offset]);
            $results = $wpdb->get_results($wpdb->prepare($query, $prepared_values));
            
            // Calculate total pages
            $total_pages = ceil($total_items / $per_page);
            
            return [
                'success' => true,
                'data' => [
                    'tributes' => $results,
                    'total_items' => (int) $total_items,
                    'total_pages' => (int) $total_pages,
                    'current_page' => (int) $page,
                ]
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Get a single tribute page by ID
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_tribute_page($request) {
        global $wpdb;
        $table = 'tributes';
        $id = absint($request['id']);
        
        try {
            // Get the tribute
            $sql = $wpdb->prepare("SELECT * FROM `$table` WHERE tribute_id = %d", $id);
            $tribute = $wpdb->get_row($sql);
            
            if (!$tribute) {
                return new WP_Error('not_found', 'Tribute page not found.', ['status' => 404]);
            }
            
            return [
                'success' => true,
                'data' => $tribute
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Get a tribute page by slug
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_tribute_by_slug($request) {
        global $wpdb;
        $table = 'tributes';
        $slug = sanitize_text_field($request['slug']);
        
        try {
            // Prepare the query safely
            $sql = $wpdb->prepare("SELECT * FROM `$table` WHERE slugified_name = %s LIMIT 1", $slug);
            $row = $wpdb->get_row($sql);
            
            if (!$row) {
                return new WP_Error('no_tribute_found', 'No tribute found with that slug.', ['status' => 404]);
            }
            
            return [
                'success' => true,
                'data' => $row,
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Create a new tribute page
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function create_tribute_page($request) {
        global $wpdb;
        $table = 'tributes';
        
        try {
            // Parse and validate request data
            $data = json_decode($request->get_body(), true);
            $validation = $this->validate_tribute_data($data);
            
            if (!$validation['valid']) {
                return new WP_Error(
                    'validation_failed',
                    'Validation failed: ' . implode(', ', $validation['errors']),
                    ['status' => 400]
                );
            }
            
            // Extract and sanitize fields
            $created_by_user_id = absint($data['created_by_user_id']);
            $point_of_contact_user_id = isset($data['point_of_contact_user_id']) ? absint($data['point_of_contact_user_id']) : $created_by_user_id;
            $loved_ones_name = sanitize_text_field($data['loved_ones_name']);
            
            // Generate slug if not provided
            $slugified_name = isset($data['slugified_name']) ? sanitize_title($data['slugified_name']) : sanitize_title($loved_ones_name);
            
            // Check if slug already exists
            $slug_exists = $wpdb->get_var(
                $wpdb->prepare("SELECT COUNT(*) FROM `$table` WHERE slugified_name = %s", $slugified_name)
            );
            
            if ($slug_exists) {
                // Append a unique identifier to make the slug unique
                $slugified_name .= '-' . uniqid();
            }
            
            // Prepare other fields
            $page_html = isset($data['page_html']) ? wp_kses_post($data['page_html']) : '';
            $loved_ones_dob = isset($data['loved_ones_dob']) ? sanitize_text_field($data['loved_ones_dob']) : null;
            $loved_ones_dod = isset($data['loved_ones_dod']) ? sanitize_text_field($data['loved_ones_dod']) : null;
            
            // Insert data
            $inserted = $wpdb->insert(
                $table,
                [
                    'created_by_user_id' => $created_by_user_id,
                    'point_of_contact_user_id' => $point_of_contact_user_id,
                    'loved_ones_name' => $loved_ones_name,
                    'slugified_name' => $slugified_name,
                    'page_html' => $page_html,
                    'loved_ones_dob' => $loved_ones_dob,
                    'loved_ones_dod' => $loved_ones_dod,
                ],
                ['%d', '%d', '%s', '%s', '%s', '%s', '%s']
            );
            
            if (false === $inserted) {
                return new WP_Error('db_insert_error', 'Could not create tribute page.', ['status' => 500]);
            }
            
            return [
                'success' => true,
                'data' => [
                    'tribute_id' => $wpdb->insert_id,
                    'slugified_name' => $slugified_name,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Update an existing tribute page
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function update_tribute_page($request) {
        global $wpdb;
        $table = 'tributes';
        $id = absint($request['id']);
        
        try {
            // Make sure the row exists first
            $existing = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `$table` WHERE tribute_id = %d", $id));
            if (!$existing) {
                return new WP_Error('not_found', 'Tribute page not found.', ['status' => 404]);
            }
            
            // Parse and validate request data
            $data = json_decode($request->get_body(), true);
            
            // Extract and sanitize fields
            $fields_to_update = [];
            $formats = [];
            
            if (isset($data['created_by_user_id'])) {
                $fields_to_update['created_by_user_id'] = absint($data['created_by_user_id']);
                $formats[] = '%d';
            }
            
            if (isset($data['point_of_contact_user_id'])) {
                $fields_to_update['point_of_contact_user_id'] = absint($data['point_of_contact_user_id']);
                $formats[] = '%d';
            }
            
            if (isset($data['loved_ones_name'])) {
                $fields_to_update['loved_ones_name'] = sanitize_text_field($data['loved_ones_name']);
                $formats[] = '%s';
            }
            
            if (isset($data['slugified_name'])) {
                $slugified_name = sanitize_title($data['slugified_name']);
                
                // Check if slug already exists and is not the current one
                $slug_exists = $wpdb->get_var(
                    $wpdb->prepare(
                        "SELECT COUNT(*) FROM `$table` WHERE slugified_name = %s AND tribute_id != %d",
                        $slugified_name,
                        $id
                    )
                );
                
                if ($slug_exists) {
                    // Append a unique identifier to make the slug unique
                    $slugified_name .= '-' . uniqid();
                }
                
                $fields_to_update['slugified_name'] = $slugified_name;
                $formats[] = '%s';
            }
            
            if (isset($data['page_html'])) {
                $fields_to_update['page_html'] = wp_kses_post($data['page_html']);
                $formats[] = '%s';
            }
            
            if (isset($data['loved_ones_dob'])) {
                $fields_to_update['loved_ones_dob'] = sanitize_text_field($data['loved_ones_dob']);
                $formats[] = '%s';
            }
            
            if (isset($data['loved_ones_dod'])) {
                $fields_to_update['loved_ones_dod'] = sanitize_text_field($data['loved_ones_dod']);
                $formats[] = '%s';
            }
            
            if (empty($fields_to_update)) {
                return new WP_Error('no_update', 'No valid fields provided for update.', ['status' => 400]);
            }
            
            // Update the tribute
            $updated = $wpdb->update(
                $table,
                $fields_to_update,
                ['tribute_id' => $id],
                $formats,
                ['%d']
            );
            
            if (false === $updated) {
                return new WP_Error('db_update_error', 'Could not update tribute page.', ['status' => 500]);
            }
            
            return [
                'success' => true,
                'data' => [
                    'tribute_id' => $id,
                    'slugified_name' => isset($slugified_name) ? $slugified_name : null,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Delete a tribute page
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function delete_tribute_page($request) {
        global $wpdb;
        $table = 'tributes';
        $id = absint($request['id']);
        
        try {
            // Make sure the row exists first
            $existing = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `$table` WHERE tribute_id = %d", $id));
            if (!$existing) {
                return new WP_Error('not_found', 'Tribute page not found.', ['status' => 404]);
            }
            
            // Check for dependencies (locations, events, schedules)
            $locations_count = $wpdb->get_var(
                $wpdb->prepare("SELECT COUNT(*) FROM locations WHERE tribute_id = %d", $id)
            );
            
            if ($locations_count > 0) {
                return new WP_Error(
                    'has_dependencies',
                    'Cannot delete tribute page with associated locations. Delete locations first.',
                    ['status' => 400]
                );
            }
            
            $schedules_count = $wpdb->get_var(
                $wpdb->prepare("SELECT COUNT(*) FROM schedule WHERE tribute_id = %d", $id)
            );
            
            if ($schedules_count > 0) {
                return new WP_Error(
                    'has_dependencies',
                    'Cannot delete tribute page with associated schedules. Delete schedules first.',
                    ['status' => 400]
                );
            }
            
            // Delete the tribute
            $deleted = $wpdb->delete(
                $table,
                ['tribute_id' => $id],
                ['%d']
            );
            
            if (false === $deleted) {
                return new WP_Error('db_delete_error', 'Could not delete tribute page.', ['status' => 500]);
            }
            
            return [
                'success' => true,
                'data' => [
                    'deleted_id' => $id,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    // ------------------------------------------------------------------------
    // 2. LOCATIONS CRUD
    // ------------------------------------------------------------------------
    
    /**
     * Get all locations with optional filtering
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_locations($request) {
        global $wpdb;
        $table = 'locations';
        
        try {
            // Extract query parameters
            $page = isset($request['page']) ? absint($request['page']) : 1;
            $per_page = isset($request['per_page']) ? absint($request['per_page']) : 10;
            $tribute_id = isset($request['tribute_id']) ? absint($request['tribute_id']) : 0;
            
            // Calculate offset
            $offset = ($page - 1) * $per_page;
            
            // Build the query
            $where_clauses = [];
            $where_values = [];
            
            if ($tribute_id > 0) {
                $where_clauses[] = 'tribute_id = %d';
                $where_values[] = $tribute_id;
            }
            
            // Combine where clauses
            $where_sql = '';
            if (!empty($where_clauses)) {
                $where_sql = 'WHERE ' . implode(' AND ', $where_clauses);
            }
            
            // Get total count for pagination
            $count_query = "SELECT COUNT(*) FROM `$table` $where_sql";
            $total_items = $wpdb->get_var($wpdb->prepare($count_query, $where_values));
            
            // Get paginated results
            $query = "SELECT * FROM `$table` $where_sql ORDER BY sort_order ASC LIMIT %d OFFSET %d";
            $prepared_values = array_merge($where_values, [$per_page, $offset]);
            $results = $wpdb->get_results($wpdb->prepare($query, $prepared_values));
            
            // Calculate total pages
            $total_pages = ceil($total_items / $per_page);
            
            return [
                'success' => true,
                'data' => [
                    'locations' => $results,
                    'total_items' => (int) $total_items,
                    'total_pages' => (int) $total_pages,
                    'current_page' => (int) $page,
                ]
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Get a single location by ID
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_location($request) {
        global $wpdb;
        $table = 'locations';
        $id = absint($request['id']);
        
        try {
            // Get the location
            $sql = $wpdb->prepare("SELECT * FROM `$table` WHERE location_id = %d", $id);
            $location = $wpdb->get_row($sql);
            
            if (!$location) {
                return new WP_Error('not_found', 'Location not found.', ['status' => 404]);
            }
            
            return [
                'success' => true,
                'data' => $location
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Get locations for a specific tribute
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_locations_by_tribute($request) {
        global $wpdb;
        $table = 'locations';
        $tribute_id = absint($request['id']);
        
        try {
            // Verify tribute exists
            $tribute_exists = $wpdb->get_var(
                $wpdb->prepare("SELECT COUNT(*) FROM tribute_page WHERE tribute_id = %d", $tribute_id)
            );
            
            if (!$tribute_exists) {
                return new WP_Error('not_found', 'Tribute not found.', ['status' => 404]);
            }
            
            // Get locations for the tribute
            $sql = $wpdb->prepare("SELECT * FROM `$table` WHERE tribute_id = %d ORDER BY sort_order ASC", $tribute_id);
            $locations = $wpdb->get_results($sql);
            
            return [
                'success' => true,
                'data' => [
                    'locations' => $locations,
                    'tribute_id' => $tribute_id
                ]
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Create a new location
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function create_location($request) {
        global $wpdb;
        $table = 'locations';
        
        try {
            // Parse and validate request data
            $data = json_decode($request->get_body(), true);
            $validation = $this->validate_location_data($data);
            
            if (!$validation['valid']) {
                return new WP_Error(
                    'validation_failed',
                    'Validation failed: ' . implode(', ', $validation['errors']),
                    ['status' => 400]
                );
            }
            
            // Extract and sanitize fields
            $tribute_id = absint($data['tribute_id']);
            $location_name = sanitize_text_field($data['location_name']);
            $location_address = sanitize_text_field($data['location_address']);
            
            // Get the highest sort_order for this tribute
            $max_sort_order = $wpdb->get_var(
                $wpdb->prepare("SELECT MAX(sort_order) FROM `$table` WHERE tribute_id = %d", $tribute_id)
            );
            
            $sort_order = isset($data['sort_order']) ? absint($data['sort_order']) : (int)$max_sort_order + 1;
            
            // Insert data
            $inserted = $wpdb->insert(
                $table,
                [
                    'tribute_id' => $tribute_id,
                    'location_name' => $location_name,
                    'location_address' => $location_address,
                    'sort_order' => $sort_order,
                ],
                ['%d', '%s', '%s', '%d']
            );
            
            if (false === $inserted) {
                return new WP_Error('db_insert_error', 'Could not create location.', ['status' => 500]);
            }
            
            return [
                'success' => true,
                'data' => [
                    'location_id' => $wpdb->insert_id,
                    'tribute_id' => $tribute_id,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Update an existing location
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function update_location($request) {
        global $wpdb;
        $table = 'locations';
        $id = absint($request['id']);
        
        try {
            // Make sure the row exists first
            $existing = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `$table` WHERE location_id = %d", $id));
            if (!$existing) {
                return new WP_Error('not_found', 'Location not found.', ['status' => 404]);
            }
            
            // Parse and validate request data
            $data = json_decode($request->get_body(), true);
            
            // Extract and sanitize fields
            $fields_to_update = [];
            $formats = [];
            
            if (isset($data['tribute_id'])) {
                $tribute_id = absint($data['tribute_id']);
                
                // Verify tribute exists
                $tribute_exists = $wpdb->get_var(
                    $wpdb->prepare("SELECT COUNT(*) FROM tribute_page WHERE tribute_id = %d", $tribute_id)
                );
                
                if (!$tribute_exists) {
                    return new WP_Error('invalid_tribute', 'Invalid tribute_id: Tribute does not exist.', ['status' => 400]);
                }
                
                $fields_to_update['tribute_id'] = $tribute_id;
                $formats[] = '%d';
            }
            
            if (isset($data['location_name'])) {
                $fields_to_update['location_name'] = sanitize_text_field($data['location_name']);
                $formats[] = '%s';
            }
            
            if (isset($data['location_address'])) {
                $fields_to_update['location_address'] = sanitize_text_field($data['location_address']);
                $formats[] = '%s';
            }
            
            if (isset($data['sort_order'])) {
                $fields_to_update['sort_order'] = absint($data['sort_order']);
                $formats[] = '%d';
            }
            
            if (empty($fields_to_update)) {
                return new WP_Error('no_update', 'No valid fields provided for update.', ['status' => 400]);
            }
            
            // Update the location
            $updated = $wpdb->update(
                $table,
                $fields_to_update,
                ['location_id' => $id],
                $formats,
                ['%d']
            );
            
            if (false === $updated) {
                return new WP_Error('db_update_error', 'Could not update location.', ['status' => 500]);
            }
            
            return [
                'success' => true,
                'data' => [
                    'location_id' => $id,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Delete a location
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function delete_location($request) {
        global $wpdb;
        $table = 'locations';
        $id = absint($request['id']);
        
        try {
            // Make sure the row exists first
            $existing = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `$table` WHERE location_id = %d", $id));
            if (!$existing) {
                return new WP_Error('not_found', 'Location not found.', ['status' => 404]);
            }
            
            // Check for dependencies (events)
            $events_count = $wpdb->get_var(
                $wpdb->prepare("SELECT COUNT(*) FROM events WHERE location_id = %d", $id)
            );
            
            if ($events_count > 0) {
                return new WP_Error(
                    'has_dependencies',
                    'Cannot delete location with associated events. Delete events first.',
                    ['status' => 400]
                );
            }
            
            // Delete the location
            $deleted = $wpdb->delete(
                $table,
                ['location_id' => $id],
                ['%d']
            );
            
            if (false === $deleted) {
                return new WP_Error('db_delete_error', 'Could not delete location.', ['status' => 500]);
            }
            
            return [
                'success' => true,
                'data' => [
                    'deleted_id' => $id,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    // ------------------------------------------------------------------------
    // 3. EVENTS CRUD
    // ------------------------------------------------------------------------
    
    /**
     * Get all events with optional filtering
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_events($request) {
        global $wpdb;
        $table = 'events';
        
        try {
            // Extract query parameters
            $page = isset($request['page']) ? absint($request['page']) : 1;
            $per_page = isset($request['per_page']) ? absint($request['per_page']) : 10;
            $location_id = isset($request['location_id']) ? absint($request['location_id']) : 0;
            
            // Calculate offset
            $offset = ($page - 1) * $per_page;
            
            // Build the query
            $where_clauses = [];
            $where_values = [];
            
            if ($location_id > 0) {
                $where_clauses[] = 'location_id = %d';
                $where_values[] = $location_id;
            }
            
            // Combine where clauses
            $where_sql = '';
            if (!empty($where_clauses)) {
                $where_sql = 'WHERE ' . implode(' AND ', $where_clauses);
            }
            
            // Get total count for pagination
            $count_query = "SELECT COUNT(*) FROM `$table` $where_sql";
            $total_items = $wpdb->get_var($wpdb->prepare($count_query, $where_values));
            
            // Get paginated results
            $query = "SELECT * FROM `$table` $where_sql ORDER BY start_time ASC LIMIT %d OFFSET %d";
            $prepared_values = array_merge($where_values, [$per_page, $offset]);
            $results = $wpdb->get_results($wpdb->prepare($query, $prepared_values));
            
            // Calculate total pages
            $total_pages = ceil($total_items / $per_page);
            
            return [
                'success' => true,
                'data' => [
                    'events' => $results,
                    'total_items' => (int) $total_items,
                    'total_pages' => (int) $total_pages,
                    'current_page' => (int) $page,
                ]
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Get active events (not ended yet)
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_active_events($request) {
        global $wpdb;
        $table = 'events';
        
        try {
            // Extract query parameters
            $page = isset($request['page']) ? absint($request['page']) : 1;
            $per_page = isset($request['per_page']) ? absint($request['per_page']) : 10;
            
            // Calculate offset
            $offset = ($page - 1) * $per_page;
            
            // Current time in MySQL format
            $now = current_time('mysql');
            
            // Get active events (end_time > now)
            $where_sql = "WHERE end_time > %s";
            $where_values = [$now];
            
            // Get total count for pagination
            $count_query = "SELECT COUNT(*) FROM `$table` $where_sql";
            $total_items = $wpdb->get_var($wpdb->prepare($count_query, $where_values));
            
            // Get paginated results
            $query = "SELECT * FROM `$table` $where_sql ORDER BY start_time ASC LIMIT %d OFFSET %d";
            $prepared_values = array_merge($where_values, [$per_page, $offset]);
            $results = $wpdb->get_results($wpdb->prepare($query, $prepared_values));
            
            // Calculate total pages
            $total_pages = ceil($total_items / $per_page);
            
            return [
                'success' => true,
                'data' => [
                    'events' => $results,
                    'total_items' => (int) $total_items,
                    'total_pages' => (int) $total_pages,
                    'current_page' => (int) $page,
                ]
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Get a single event by ID
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_event($request) {
        global $wpdb;
        $table = 'events';
        $id = absint($request['id']);
        
        try {
            // Get the event
            $sql = $wpdb->prepare("SELECT * FROM `$table` WHERE event_id = %d", $id);
            $event = $wpdb->get_row($sql);
            
            if (!$event) {
                return new WP_Error('not_found', 'Event not found.', ['status' => 404]);
            }
            
            return [
                'success' => true,
                'data' => $event
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Get events for a specific location
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_events_by_location($request) {
        global $wpdb;
        $table = 'events';
        $location_id = absint($request['id']);
        
        try {
            // Verify location exists
            $location_exists = $wpdb->get_var(
                $wpdb->prepare("SELECT COUNT(*) FROM locations WHERE location_id = %d", $location_id)
            );
            
            if (!$location_exists) {
                return new WP_Error('not_found', 'Location not found.', ['status' => 404]);
            }
            
            // Get events for the location
            $sql = $wpdb->prepare("SELECT * FROM `$table` WHERE location_id = %d ORDER BY start_time ASC", $location_id);
            $events = $wpdb->get_results($sql);
            
            return [
                'success' => true,
                'data' => [
                    'events' => $events,
                    'location_id' => $location_id
                ]
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Get events for a specific tribute
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_events_by_tribute($request) {
        global $wpdb;
        $tribute_id = absint($request['id']);
        
        try {
            // Verify tribute exists
            $tribute_exists = $wpdb->get_var(
                $wpdb->prepare("SELECT COUNT(*) FROM tribute_page WHERE tribute_id = %d", $tribute_id)
            );
            
            if (!$tribute_exists) {
                return new WP_Error('not_found', 'Tribute not found.', ['status' => 404]);
            }
            
            // Get events for the tribute (via locations)
            $sql = $wpdb->prepare(
                "SELECT e.* FROM events e
                JOIN locations l ON e.location_id = l.location_id
                WHERE l.tribute_id = %d
                ORDER BY e.start_time ASC",
                $tribute_id
            );
            
            $events = $wpdb->get_results($sql);
            
            return [
                'success' => true,
                'data' => [
                    'events' => $events,
                    'tribute_id' => $tribute_id
                ]
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Create a new event
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function create_event($request) {
        global $wpdb;
        $table = 'events';
        
        try {
            // Parse and validate request data
            $data = json_decode($request->get_body(), true);
            $validation = $this->validate_event_data($data);
            
            if (!$validation['valid']) {
                return new WP_Error(
                    'validation_failed',
                    'Validation failed: ' . implode(', ', $validation['errors']),
                    ['status' => 400]
                );
            }
            
            // Extract and sanitize fields
            $location_id = absint($data['location_id']);
            $stream_html = isset($data['stream_html']) ? wp_kses_post($data['stream_html']) : '';
            $start_time = sanitize_text_field($data['start_time']);
            $end_time = sanitize_text_field($data['end_time']);
            
            // Insert data
            $inserted = $wpdb->insert(
                $table,
                [
                    'location_id' => $location_id,
                    'stream_html' => $stream_html,
                    'start_time' => $start_time,
                    'end_time' => $end_time,
                ],
                ['%d', '%s', '%s', '%s']
            );
            
            if (false === $inserted) {
                return new WP_Error('db_insert_error', 'Could not create event.', ['status' => 500]);
            }
            
            return [
                'success' => true,
                'data' => [
                    'event_id' => $wpdb->insert_id,
                    'location_id' => $location_id,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Update an existing event
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function update_event($request) {
        global $wpdb;
        $table = 'events';
        $id = absint($request['id']);
        
        try {
            // Make sure the row exists first
            $existing = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `$table` WHERE event_id = %d", $id));
            if (!$existing) {
                return new WP_Error('not_found', 'Event not found.', ['status' => 404]);
            }
            
            // Parse and validate request data
            $data = json_decode($request->get_body(), true);
            
            // Extract and sanitize fields
            $fields_to_update = [];
            $formats = [];
            
            if (isset($data['location_id'])) {
                $location_id = absint($data['location_id']);
                
                // Verify location exists
                $location_exists = $wpdb->get_var(
                    $wpdb->prepare("SELECT COUNT(*) FROM locations WHERE location_id = %d", $location_id)
                );
                
                if (!$location_exists) {
                    return new WP_Error('invalid_location', 'Invalid location_id: Location does not exist.', ['status' => 400]);
                }
                
                $fields_to_update['location_id'] = $location_id;
                $formats[] = '%d';
            }
            
            if (isset($data['stream_html'])) {
                $fields_to_update['stream_html'] = wp_kses_post($data['stream_html']);
                $formats[] = '%s';
            }
            
            if (isset($data['start_time'])) {
                $fields_to_update['start_time'] = sanitize_text_field($data['start_time']);
                $formats[] = '%s';
            }
            
            if (isset($data['end_time'])) {
                $fields_to_update['end_time'] = sanitize_text_field($data['end_time']);
                $formats[] = '%s';
            }
            
            // Validate start_time and end_time if both are provided
            if (isset($data['start_time']) && isset($data['end_time'])) {
                $start_time = strtotime($data['start_time']);
                $end_time = strtotime($data['end_time']);
                
                if ($start_time !== false && $end_time !== false && $start_time >= $end_time) {
                    return new WP_Error('invalid_time', 'start_time must be before end_time.', ['status' => 400]);
                }
            }
            
            if (empty($fields_to_update)) {
                return new WP_Error('no_update', 'No valid fields provided for update.', ['status' => 400]);
            }
            
            // Update the event
            $updated = $wpdb->update(
                $table,
                $fields_to_update,
                ['event_id' => $id],
                $formats,
                ['%d']
            );
            
            if (false === $updated) {
                return new WP_Error('db_update_error', 'Could not update event.', ['status' => 500]);
            }
            
            return [
                'success' => true,
                'data' => [
                    'event_id' => $id,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Delete an event
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function delete_event($request) {
        global $wpdb;
        $table = 'events';
        $id = absint($request['id']);
        
        try {
            // Make sure the row exists first
            $existing = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `$table` WHERE event_id = %d", $id));
            if (!$existing) {
                return new WP_Error('not_found', 'Event not found.', ['status' => 404]);
            }
            
            // Delete the event
            $deleted = $wpdb->delete(
                $table,
                ['event_id' => $id],
                ['%d']
            );
            
            if (false === $deleted) {
                return new WP_Error('db_delete_error', 'Could not delete event.', ['status' => 500]);
            }
            
            return [
                'success' => true,
                'data' => [
                    'deleted_id' => $id,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    // ------------------------------------------------------------------------
    // 4. USER MANAGEMENT
    // ------------------------------------------------------------------------
    
    /**
     * Get all users (admin only)
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_users($request) {
        try {
            // Extract query parameters
            $page = isset($request['page']) ? absint($request['page']) : 1;
            $per_page = isset($request['per_page']) ? absint($request['per_page']) : 10;
            $search = isset($request['search']) ? sanitize_text_field($request['search']) : '';
            $role = isset($request['role']) ? sanitize_text_field($request['role']) : '';
            
            // Calculate offset
            $offset = ($page - 1) * $per_page;
            
            // Build query args
            $args = [
                'number' => $per_page,
                'offset' => $offset,
                'fields' => 'all_with_meta',
                'orderby' => 'registered',
                'order' => 'DESC',
            ];
            
            if (!empty($search)) {
                $args['search'] = '*' . $search . '*';
            }
            
            if (!empty($role)) {
                $args['role'] = $role;
            }
            
            // Get users
            $user_query = new WP_User_Query($args);
            $users = $user_query->get_results();
            $total_users = $user_query->get_total();
            
            // Format user data
            $formatted_users = [];
            foreach ($users as $user) {
                $formatted_users[] = [
                    'id' => $user->ID,
                    'username' => $user->user_login,
                    'email' => $user->user_email,
                    'display_name' => $user->display_name,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'roles' => $user->roles,
                    'registered' => $user->user_registered,
                    'user_type' => get_user_meta($user->ID, 'user_type', true),
                ];
            }
            
            // Calculate total pages
            $total_pages = ceil($total_users / $per_page);
            
            return [
                'success' => true,
                'data' => [
                    'users' => $formatted_users,
                    'total_items' => (int) $total_users,
                    'total_pages' => (int) $total_pages,
                    'current_page' => (int) $page,
                ]
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Get a single user by ID (admin or self)
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_user($request) {
        try {
            $user_id = absint($request['id']);
            $user = get_user_by('ID', $user_id);
            
            if (!$user) {
                return new WP_Error('not_found', 'User not found.', ['status' => 404]);
            }
            
            // Format user data
            $user_data = [
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'display_name' => $user->display_name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'roles' => $user->roles,
                'registered' => $user->user_registered,
                'user_type' => get_user_meta($user->ID, 'user_type', true),
            ];
            
            return [
                'success' => true,
                'data' => $user_data
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Get current user
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_current_user($request) {
        try {
            $user_id = get_current_user_id();
            $user = get_user_by('ID', $user_id);
            
            if (!$user) {
                return new WP_Error('not_found', 'User not found.', ['status' => 404]);
            }
            
            // Format user data
            $user_data = [
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'display_name' => $user->display_name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'roles' => $user->roles,
                'registered' => $user->user_registered,
                'user_type' => get_user_meta($user->ID, 'user_type', true),
            ];
            
            return [
                'success' => true,
                'data' => $user_data
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Create a new user
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function create_user($request) {
        try {
            // Parse and validate request data
            $data = json_decode($request->get_body(), true);
            $validation = $this->validate_user_data($data, true);
            
            if (!$validation['valid']) {
                return new WP_Error(
                    'validation_failed',
                    'Validation failed: ' . implode(', ', $validation['errors']),
                    ['status' => 400]
                );
            }
            
            // Extract and sanitize fields
            $email = sanitize_email($data['email_address']);
            $password = $data['password'];
            $username = isset($data['username']) ? sanitize_user($data['username']) : sanitize_user($email);
            $first_name = isset($data['first_name']) ? sanitize_text_field($data['first_name']) : '';
            $last_name = isset($data['last_name']) ? sanitize_text_field($data['last_name']) : '';
            $display_name = isset($data['display_name']) ? sanitize_text_field($data['display_name']) : $first_name . ' ' . $last_name;
            $user_type = sanitize_text_field($data['user_type']);
            
            // Create user
            $user_id = wp_create_user($username, $password, $email);
            
            if (is_wp_error($user_id)) {
                return new WP_Error(
                    'user_creation_failed',
                    $user_id->get_error_message(),
                    ['status' => 400]
                );
            }
            
            // Update user meta
            wp_update_user([
                'ID' => $user_id,
                'first_name' => $first_name,
                'last_name' => $last_name,
                'display_name' => $display_name,
            ]);
            
            // Set user type
            update_user_meta($user_id, 'user_type', $user_type);
            
            // Set role based on user_type
            $user = new WP_User($user_id);
            
            switch ($user_type) {
                case 'admin':
                    $user->set_role('administrator');
                    break;
                case 'funeral_director':
                    $user->set_role('editor');
                    break;
                case 'family_member':
                    $user->set_role('author');
                    break;
                case 'guest':
                    $user->set_role('subscriber');
                    break;
                default:
                    $user->set_role('subscriber');
            }
            
            return [
                'success' => true,
                'data' => [
                    'user_id' => $user_id,
                    'email' => $email,
                    'user_type' => $user_type,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Update an existing user
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function update_user($request) {
        try {
            $user_id = absint($request['id']);
            $user = get_user_by('ID', $user_id);
            
            if (!$user) {
                return new WP_Error('not_found', 'User not found.', ['status' => 404]);
            }
            
            // Parse and validate request data
            $data = json_decode($request->get_body(), true);
            $validation = $this->validate_user_data($data, false);
            
            if (!$validation['valid']) {
                return new WP_Error(
                    'validation_failed',
                    'Validation failed: ' . implode(', ', $validation['errors']),
                    ['status' => 400]
                );
            }
            
            // Prepare user data for update
            $user_data = [
                'ID' => $user_id,
            ];
            
            if (isset($data['email_address'])) {
                $user_data['user_email'] = sanitize_email($data['email_address']);
            }
            
            if (isset($data['first_name'])) {
                $user_data['first_name'] = sanitize_text_field($data['first_name']);
            }
            
            if (isset($data['last_name'])) {
                $user_data['last_name'] = sanitize_text_field($data['last_name']);
            }
            
            if (isset($data['display_name'])) {
                $user_data['display_name'] = sanitize_text_field($data['display_name']);
            }
            
            if (isset($data['password'])) {
                $user_data['user_pass'] = $data['password'];
            }
            
            // Update user
            $updated = wp_update_user($user_data);
            
            if (is_wp_error($updated)) {
                return new WP_Error(
                    'user_update_failed',
                    $updated->get_error_message(),
                    ['status' => 400]
                );
            }
            
            // Update user type if provided
            if (isset($data['user_type'])) {
                $user_type = sanitize_text_field($data['user_type']);
                update_user_meta($user_id, 'user_type', $user_type);
                
                // Update role based on user_type
                $user = new WP_User($user_id);
                
                switch ($user_type) {
                    case 'admin':
                        $user->set_role('administrator');
                        break;
                    case 'funeral_director':
                        $user->set_role('editor');
                        break;
                    case 'family_member':
                        $user->set_role('author');
                        break;
                    case 'guest':
                        $user->set_role('subscriber');
                        break;
                }
            }
            
            return [
                'success' => true,
                'data' => [
                    'user_id' => $user_id,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Delete a user
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function delete_user($request) {
        try {
            $user_id = absint($request['id']);
            $user = get_user_by('ID', $user_id);
            
            if (!$user) {
                return new WP_Error('not_found', 'User not found.', ['status' => 404]);
            }
            
            // Check if user has tributes
            global $wpdb;
            $tributes_count = $wpdb->get_var(
                $wpdb->prepare("SELECT COUNT(*) FROM tribute_page WHERE created_by_user_id = %d", $user_id)
            );
            
            if ($tributes_count > 0) {
                return new WP_Error(
                    'has_dependencies',
                    'Cannot delete user with associated tributes. Delete tributes first or reassign them.',
                    ['status' => 400]
                );
            }
            
            // Delete user
            $deleted = wp_delete_user($user_id);
            
            if (!$deleted) {
                return new WP_Error('db_delete_error', 'Could not delete user.', ['status' => 500]);
            }
            
            return [
                'success' => true,
                'data' => [
                    'deleted_id' => $user_id,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    // ------------------------------------------------------------------------
    // 5. SCHEDULE CRUD
    // ------------------------------------------------------------------------
    
    /**
     * Get all schedules
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_schedules($request) {
        global $wpdb;
        $table = 'schedule';
        
        try {
            // Extract query parameters
            $page = isset($request['page']) ? absint($request['page']) : 1;
            $per_page = isset($request['per_page']) ? absint($request['per_page']) : 10;
            $tribute_id = isset($request['tribute_id']) ? absint($request['tribute_id']) : 0;
            
            // Calculate offset
            $offset = ($page - 1) * $per_page;
            
            // Build the query
            $where_clauses = [];
            $where_values = [];
            
            if ($tribute_id > 0) {
                $where_clauses[] = 'tribute_id = %d';
                $where_values[] = $tribute_id;
            }
            
            // Combine where clauses
            $where_sql = '';
            if (!empty($where_clauses)) {
                $where_sql = 'WHERE ' . implode(' AND ', $where_clauses);
            }
            
            // Get total count for pagination
            $count_query = "SELECT COUNT(*) FROM `$table` $where_sql";
            $total_items = $wpdb->get_var($wpdb->prepare($count_query, $where_values));
            
            // Get paginated results
            $query = "SELECT * FROM `$table` $where_sql ORDER BY schedule_id DESC LIMIT %d OFFSET %d";
            $prepared_values = array_merge($where_values, [$per_page, $offset]);
            $results = $wpdb->get_results($wpdb->prepare($query, $prepared_values));
            
            // Calculate total pages
            $total_pages = ceil($total_items / $per_page);
            
            return [
                'success' => true,
                'data' => [
                    'schedules' => $results,
                    'total_items' => (int) $total_items,
                    'total_pages' => (int) $total_pages,
                    'current_page' => (int) $page,
                ]
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Get a single schedule by ID
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function get_schedule($request) {
        global $wpdb;
        $table = 'schedule';
        $id = absint($request['id']);
        
        try {
            // Get the schedule
            $sql = $wpdb->prepare("SELECT * FROM `$table` WHERE schedule_id = %d", $id);
            $schedule = $wpdb->get_row($sql);
            
            if (!$schedule) {
                return new WP_Error('not_found', 'Schedule not found.', ['status' => 404]);
            }
            
            return [
                'success' => true,
                'data' => $schedule
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Create a new schedule
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function create_schedule($request) {
        global $wpdb;
        $table = 'schedule';
        
        try {
            // Parse request data
            $data = json_decode($request->get_body(), true);
            
            // Extract and sanitize fields
            $funeral_director_user_id = isset($data['funeral_director_user_id']) ? absint($data['funeral_director_user_id']) : 0;
            $tribute_id = isset($data['tribute_id']) ? absint($data['tribute_id']) : 0;
            $number_of_days = isset($data['number_of_days']) ? absint($data['number_of_days']) : 0;
            
            // Validate tribute_id
            if ($tribute_id <= 0) {
                return new WP_Error('invalid_tribute', 'Invalid tribute_id: tribute_id is required.', ['status' => 400]);
            }
            
            $tribute_exists = $wpdb->get_var(
                $wpdb->prepare("SELECT COUNT(*) FROM tribute_page WHERE tribute_id = %d", $tribute_id)
            );
            
            if (!$tribute_exists) {
                return new WP_Error('invalid_tribute', 'Invalid tribute_id: Tribute does not exist.', ['status' => 400]);
            }
            
            // Validate funeral_director_user_id if provided
            if ($funeral_director_user_id > 0) {
                $user_exists = get_user_by('ID', $funeral_director_user_id);
                if (!$user_exists) {
                    return new WP_Error('invalid_user', 'Invalid funeral_director_user_id: User does not exist.', ['status' => 400]);
                }
            }
            
            // Insert data
            $inserted = $wpdb->insert(
                $table,
                [
                    'funeral_director_user_id' => $funeral_director_user_id,
                    'tribute_id' => $tribute_id,
                    'number_of_days' => $number_of_days,
                ],
                ['%d', '%d', '%d']
            );
            
            if (false === $inserted) {
                return new WP_Error('db_insert_error', 'Could not create schedule.', ['status' => 500]);
            }
            
            return [
                'success' => true,
                'data' => [
                    'schedule_id' => $wpdb->insert_id,
                    'tribute_id' => $tribute_id,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Update an existing schedule
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function update_schedule($request) {
        global $wpdb;
        $table = 'schedule';
        $id = absint($request['id']);
        
        try {
            // Make sure the row exists first
            $existing = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `$table` WHERE schedule_id = %d", $id));
            if (!$existing) {
                return new WP_Error('not_found', 'Schedule not found.', ['status' => 404]);
            }
            
            // Parse request data
            $data = json_decode($request->get_body(), true);
            
            // Extract and sanitize fields
            $fields_to_update = [];
            $formats = [];
            
            if (isset($data['funeral_director_user_id'])) {
                $funeral_director_user_id = absint($data['funeral_director_user_id']);
                
                // Validate user if provided
                if ($funeral_director_user_id > 0) {
                    $user_exists = get_user_by('ID', $funeral_director_user_id);
                    if (!$user_exists) {
                        return new WP_Error('invalid_user', 'Invalid funeral_director_user_id: User does not exist.', ['status' => 400]);
                    }
                }
                
                $fields_to_update['funeral_director_user_id'] = $funeral_director_user_id;
                $formats[] = '%d';
            }
            
            if (isset($data['tribute_id'])) {
                $tribute_id = absint($data['tribute_id']);
                
                // Validate tribute
                $tribute_exists = $wpdb->get_var(
                    $wpdb->prepare("SELECT COUNT(*) FROM tribute_page WHERE tribute_id = %d", $tribute_id)
                );
                
                if (!$tribute_exists) {
                    return new WP_Error('invalid_tribute', 'Invalid tribute_id: Tribute does not exist.', ['status' => 400]);
                }
                
                $fields_to_update['tribute_id'] = $tribute_id;
                $formats[] = '%d';
            }
            
            if (isset($data['number_of_days'])) {
                $fields_to_update['number_of_days'] = absint($data['number_of_days']);
                $formats[] = '%d';
            }
            
            if (empty($fields_to_update)) {
                return new WP_Error('no_update', 'No valid fields provided for update.', ['status' => 400]);
            }
            
            // Update the schedule
            $updated = $wpdb->update(
                $table,
                $fields_to_update,
                ['schedule_id' => $id],
                $formats,
                ['%d']
            );
            
            if (false === $updated) {
                return new WP_Error('db_update_error', 'Could not update schedule.', ['status' => 500]);
            }
            
            return [
                'success' => true,
                'data' => [
                    'schedule_id' => $id,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Delete a schedule
     *
     * @param WP_REST_Request $request The request object
     * @return array Response data
     */
    public function delete_schedule($request) {
        global $wpdb;
        $table = 'schedule';
        $id = absint($request['id']);
        
        try {
            // Make sure the row exists first
            $existing = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `$table` WHERE schedule_id = %d", $id));
            if (!$existing) {
                return new WP_Error('not_found', 'Schedule not found.', ['status' => 404]);
            }
            
            // Delete the schedule
            $deleted = $wpdb->delete(
                $table,
                ['schedule_id' => $id],
                ['%d']
            );
            
            if (false === $deleted) {
                return new WP_Error('db_delete_error', 'Could not delete schedule.', ['status' => 500]);
            }
            
            return [
                'success' => true,
                'data' => [
                    'deleted_id' => $id,
                ],
            ];
        } catch (Exception $e) {
            return $this->handle_api_error($e->getMessage(), 500);
        }
    }
    
    // ------------------------------------------------------------------------
    // ERROR HANDLING
    // ------------------------------------------------------------------------
    
    /**
     * Handle API errors consistently
     *
     * @param string|WP_Error $error The error message or WP_Error object
     * @param int $status_code HTTP status code
     * @return array Formatted error response
     */
    private function handle_api_error($error, $status_code = 500) {
        // Log the error for debugging
        error_log('Tributestream API Error: ' . print_r($error, true));
        
        // Format the error message
        $message = is_wp_error($error) ? $error->get_error_message() : $error;
        
        return [
            'success' => false,
            'error' => true,
            'message' => $message,
            'status' => $status_code
        ];
    }
}

// Instantiate the plugin
new TributestreamAPI();

// In your WordPress theme's functions.php or in your plugin
function enqueue_wp_api() {
    wp_enqueue_script('wp-api');
}
add_action('wp_enqueue_scripts', 'enqueue_wp_api');
