<?php
/**
 * Plugin Name: 01A9 TributeStream Complete (Enhanced)
 * Plugin URI:  https://tributestream.com
 * Description: A comprehensive plugin providing custom REST endpoints for tributes, extended data, user registration, and user meta management with enhanced persistence layer.
 * Version:     2.0.0
 * Author:      TributeStream Team
 * Author URI:  https://tributestream.com
 * Text Domain: tributestream-complete
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Main plugin class with enhanced persistence layer
 */
class TributeStreamComplete {

    /** @var string The tributes table name */
    private $table_name;

    /** @var array Allowed origins for CORS */
    private $allowed_origins = array(
        'http://localhost:5173',
        'http://localhost:4173',
        'http://localhost:3000',
        'https://wp.tributestream.com',
        'https://tributestream.com',
    );

    /** @var UserMetaManager User metadata manager */
    private $user_meta_manager;

    /** @var FormDataManager Form data manager */
    private $form_data_manager;

    /** @var TributeManager Tribute manager */
    private $tribute_manager;

    /** @var SecurityManager Security manager */
    private $security_manager;

    /**
     * Constructor
     */
    public function __construct() {
        global $wpdb;
        // Determine the table name (honoring WP table prefix).
        $this->table_name = $wpdb->prefix . 'tributes';

        // Initialize managers
        $this->user_meta_manager = new UserMetaManager();
        $this->form_data_manager = new FormDataManager($this->user_meta_manager);
        $this->tribute_manager = new TributeManager($this->table_name, $this->user_meta_manager);
        $this->security_manager = new SecurityManager();

        // Create the custom table on plugin activation.
        register_activation_hook(__FILE__, array($this, 'activate_plugin'));

        // Hook into REST API init to register our custom routes.
        add_action('rest_api_init', array($this, 'register_routes'));

        // Hook into rest_pre_serve_request to add CORS headers.
        add_action('rest_api_init', array($this, 'handle_cors'));
    }

    /**
     * Create the custom 'tributes' table if it doesn't exist.
     */
    public function activate_plugin() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE IF NOT EXISTS `{$this->table_name}` (
            `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            `user_id` BIGINT UNSIGNED NOT NULL,
            `loved_one_name` VARCHAR(255) NOT NULL,
            `slug` VARCHAR(255) NOT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            `custom_html` LONGTEXT NULL,
            `phone_number` VARCHAR(50) NOT NULL,
            `number_of_streams` BIGINT UNSIGNED DEFAULT 0,
            PRIMARY KEY (`id`),
            KEY `slug_index` (`slug`),
            KEY `user_id_index` (`user_id`)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * Set CORS headers for specific allowed origins.
     */
    public function handle_cors() {
        add_filter('rest_pre_serve_request', function ($value) {
            // Check if the Origin header is one of our allowed origins:
            if (isset($_SERVER['HTTP_ORIGIN'])) {
                $origin = $_SERVER['HTTP_ORIGIN'];
                if (in_array($origin, $this->allowed_origins)) {
                    header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
                    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
                    header('Access-Control-Allow-Credentials: true');
                    header('Access-Control-Allow-Headers: Authorization, Content-Type');
                }
            }
            return $value;
        });
    }

    /**
     * Register all custom REST API routes under namespace 'tributestream/v1'.
     */
    public function register_routes() {
        $namespace = 'tributestream/v1';

        // 1) TRIBUTE ROUTES
        // 1.1) GET /tributes
        register_rest_route($namespace, '/tributes', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_tributes'),
                'permission_callback' => '__return_true', // public
            ),
        ));

        // 1.2) POST /tributes
        register_rest_route($namespace, '/tributes', array(
            array(
                'methods'  => 'POST',
                'callback' => array($this, 'create_tribute'),
                'permission_callback' => array($this->security_manager, 'check_jwt_auth'),
            ),
        ));

        // 1.3) GET /tributes/{id}
        register_rest_route($namespace, '/tributes/(?P<id>\d+)', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_tribute_by_id'),
                'permission_callback' => array($this->security_manager, 'check_tribute_ownership'),
            ),
        ));

        // 1.4) PUT /tributes/{id}
        register_rest_route($namespace, '/tributes/(?P<id>\d+)', array(
            array(
                'methods'  => 'PUT',
                'callback' => array($this, 'update_tribute'),
                'permission_callback' => array($this->security_manager, 'check_tribute_ownership'),
            ),
        ));

        // 1.5) DELETE /tributes/{id}
        register_rest_route($namespace, '/tributes/(?P<id>\d+)', array(
            array(
                'methods'  => 'DELETE',
                'callback' => array($this, 'delete_tribute'),
                'permission_callback' => array($this->security_manager, 'check_tribute_ownership'),
            ),
        ));

        // 1.6) GET /tributes/by-user/{user_id}
        register_rest_route($namespace, '/tributes/by-user/(?P<user_id>\d+)', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_tributes_by_user'),
                'permission_callback' => array($this->security_manager, 'check_user_ownership_or_admin'),
            ),
        ));

        // 1.7) GET /tribute/{slug}
        register_rest_route($namespace, '/tribute/(?P<slug>[a-zA-Z0-9-_\s]+)', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_tribute_by_slug'),
                'permission_callback' => '__return_true', // public
            ),
        ));

        // 2) EXTENDED TRIBUTE DATA ROUTES
        // 2.1) POST /tribute-data/{tribute_id}
        register_rest_route($namespace, '/tribute-data/(?P<tribute_id>\d+)', array(
            array(
                'methods'  => 'POST',
                'callback' => array($this, 'create_or_replace_tribute_data'),
                'permission_callback' => array($this->security_manager, 'check_tribute_ownership'),
            ),
        ));

        // 2.2) GET /tribute-data/{tribute_id}
        register_rest_route($namespace, '/tribute-data/(?P<tribute_id>\d+)', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_tribute_data'),
                'permission_callback' => array($this->security_manager, 'check_tribute_ownership'),
            ),
        ));

        // 2.3) PUT /tribute-data/{tribute_id}
        register_rest_route($namespace, '/tribute-data/(?P<tribute_id>\d+)', array(
            array(
                'methods'  => 'PUT',
                'callback' => array($this, 'update_tribute_data'),
                'permission_callback' => array($this->security_manager, 'check_tribute_ownership'),
            ),
        ));

        // 3) USER REGISTRATION
        // 3.1) POST /register
        register_rest_route($namespace, '/register', array(
            array(
                'methods'  => 'POST',
                'callback' => array($this, 'register_new_user'),
                'permission_callback' => '__return_true', // public
            ),
        ));

        // 4) USER META ROUTES
        // 4.1) POST /user-meta
        register_rest_route($namespace, '/user-meta', array(
            array(
                'methods'  => 'POST',
                'callback' => array($this, 'create_or_update_user_meta'),
                'permission_callback' => array($this->security_manager, 'check_user_meta_ownership'),
            ),
        ));

        // 4.2) GET /user-meta/{user_id}
        register_rest_route($namespace, '/user-meta/(?P<user_id>\d+)', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_user_meta_all'),
                'permission_callback' => array($this->security_manager, 'check_user_ownership_or_admin'),
            ),
        ));

        // 4.3) GET /user-meta/{user_id}/{meta_key}
        register_rest_route($namespace, '/user-meta/(?P<user_id>\d+)/(?P<meta_key>[\w-]+)', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_user_meta_single'),
                'permission_callback' => array($this->security_manager, 'check_user_ownership_or_admin'),
            ),
        ));

        // 4.4) DELETE /user-meta/{user_id}/{meta_key}
        register_rest_route($namespace, '/user-meta/(?P<user_id>\d+)/(?P<meta_key>[\w-]+)', array(
            array(
                'methods'  => 'DELETE',
                'callback' => array($this, 'delete_user_meta_single'),
                'permission_callback' => array($this->security_manager, 'check_user_ownership_or_admin'),
            ),
        ));

        // 5) NEW FORM DATA SPECIFIC ROUTES
        // 5.1) POST /form-data
        register_rest_route($namespace, '/form-data', array(
            array(
                'methods'  => 'POST',
                'callback' => array($this, 'create_or_update_form_data'),
                'permission_callback' => array($this->security_manager, 'check_jwt_auth'),
            ),
        ));

        // 5.2) GET /form-data/{user_id}
        register_rest_route($namespace, '/form-data/(?P<user_id>\d+)', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_form_data'),
                'permission_callback' => array($this->security_manager, 'check_user_ownership_or_admin'),
            ),
        ));
    }

    /*--------------------------------------------------------------------------
     * USER META ENDPOINT CALLBACKS (Enhanced with UserMetaManager)
     *------------------------------------------------------------------------*/

    /**
     * Create or update user meta
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function create_or_update_user_meta($request) {
        $body = json_decode($request->get_body(), true);

        if (!isset($body['user_id']) || !isset($body['meta_key'])) {
            return new WP_Error(
                'missing_fields', 
                'Missing required fields: user_id and meta_key',
                array('status' => 400)
            );
        }

        $user_id = intval($body['user_id']);
        $meta_key = sanitize_key($body['meta_key']);
        $meta_value = isset($body['meta_value']) ? $body['meta_value'] : '';

        $result = $this->user_meta_manager->createOrUpdate($user_id, $meta_key, $meta_value);
        
        if (is_wp_error($result)) {
            return $result;
        }

        return rest_ensure_response($result);
    }

    /**
     * Get all user meta
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function get_user_meta_all($request) {
        $user_id = intval($request['user_id']);
        $result = $this->user_meta_manager->getAll($user_id);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response(['meta' => $result]);
    }

    /**
     * Get single user meta
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function get_user_meta_single($request) {
        $user_id = intval($request['user_id']);
        $meta_key = sanitize_key($request['meta_key']);
        
        $result = $this->user_meta_manager->get($user_id, $meta_key);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response([
            'key' => $meta_key,
            'value' => $result
        ]);
    }

    /**
     * Delete single user meta
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function delete_user_meta_single($request) {
        $user_id = intval($request['user_id']);
        $meta_key = sanitize_key($request['meta_key']);
        
        $result = $this->user_meta_manager->delete($user_id, $meta_key);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response([
            'success' => true,
            'message' => 'User meta deleted successfully'
        ]);
    }

    /*--------------------------------------------------------------------------
     * FORM DATA ENDPOINT CALLBACKS (New dedicated endpoints)
     *------------------------------------------------------------------------*/

    /**
     * Create or update form data
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function create_or_update_form_data($request) {
        $body = json_decode($request->get_body(), true);

        if (!isset($body['user_id']) || !isset($body['form_data'])) {
            return new WP_Error(
                'missing_fields', 
                'Missing required fields: user_id and form_data',
                array('status' => 400)
            );
        }

        $user_id = intval($body['user_id']);
        $form_data = $body['form_data'];

        // Save form data
        $result = $this->form_data_manager->saveFormData($user_id, $form_data);
        
        if (is_wp_error($result)) {
            return $result;
        }

        // Update tribune if needed
        if (isset($body['tribute_id']) && !empty($body['tribute_id'])) {
            $tribute_id = intval($body['tribute_id']);
            
            // Create tribute data from form data
            $tribute_data = [
                'loved_one_name' => trim($form_data['deceased-first-name'] . ' ' . $form_data['deceased-last-name']),
                'phone_number' => $form_data['phone-number'] ?? '',
            ];
            
            $this->tribute_manager->update($tribute_id, $tribute_data);
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'Form data saved successfully'
        ]);
    }

    /**
     * Get form data
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function get_form_data($request) {
        $user_id = intval($request['user_id']);
        
        $result = $this->form_data_manager->getFormData($user_id);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response([
            'form_data' => $result
        ]);
    }

    /*--------------------------------------------------------------------------
     * TRIBUTE ENDPOINT CALLBACKS (Enhanced with TributeManager)
     *------------------------------------------------------------------------*/

    /**
     * Create tribute (Enhanced version using TributeManager)
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function create_tribute($request) {
        $body = json_decode($request->get_body(), true);
        
        $result = $this->tribute_manager->create($body);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response($result);
    }

    /**
     * Update tribute (Enhanced version using TributeManager)
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function update_tribute($request) {
        $tribute_id = intval($request['id']);
        $body = json_decode($request->get_body(), true);
        
        $result = $this->tribute_manager->update($tribute_id, $body);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response($result);
    }

    /**
     * Get tribute by ID (Enhanced version using TributeManager)
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function get_tribute_by_id($request) {
        $tribute_id = intval($request['id']);
        
        $result = $this->tribute_manager->get($tribute_id);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response($result);
    }

    /**
     * Get tributes (With pagination, search, etc.)
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function get_tributes($request) {
        $page = isset($request['page']) ? max(1, intval($request['page'])) : 1;
        $per_page = isset($request['per_page']) ? max(1, intval($request['per_page'])) : 10;
        $search = isset($request['search']) ? trim($request['search']) : '';
        
        $result = $this->tribute_manager->getAll($page, $per_page, $search);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response($result);
    }

    /**
     * Get tributes by user (Enhanced version using TributeManager)
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function get_tributes_by_user($request) {
        $user_id = intval($request['user_id']);
        
        $result = $this->tribute_manager->getByUser($user_id);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response(['tributes' => $result]);
    }

    /**
     * Get tribute by slug (Enhanced version using TributeManager)
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function get_tribute_by_slug($request) {
        $slug = sanitize_title($request['slug']);
        
        $result = $this->tribute_manager->getBySlug($slug);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response($result);
    }

    /**
     * Delete tribute (Enhanced version using TributeManager)
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function delete_tribute($request) {
        $tribute_id = intval($request['id']);
        
        $result = $this->tribute_manager->delete($tribute_id);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response($result);
    }

    /*--------------------------------------------------------------------------
     * EXTENDED TRIBUTE DATA ENDPOINT CALLBACKS
     *------------------------------------------------------------------------*/

    /**
     * Create or replace tribute data (Enhanced to use UserMetaManager)
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function create_or_replace_tribute_data($request) {
        $tribute_id = intval($request['tribute_id']);
        $body = json_decode($request->get_body(), true);
        
        if (!is_array($body)) {
            $body = array();
        }
        
        // Force tribute_reference
        $body['tribute_reference'] = $tribute_id;
        
        // Find who owns the tribute
        $tribute = $this->tribute_manager->get($tribute_id);
        
        if (is_wp_error($tribute)) {
            return $tribute;
        }
        
        // Save in user meta using our enhanced manager
        $user_id = intval($tribute['user_id']);
        $meta_key = 'tributestream_extended_data_' . $tribute_id;
        
        $result = $this->user_meta_manager->createOrUpdate($user_id, $meta_key, $body);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response([
            'success' => true,
            'message' => 'Extended data stored successfully'
        ]);
    }

    /**
     * Get tribute data (Enhanced to use UserMetaManager)
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function get_tribute_data($request) {
        $tribute_id = intval($request['tribute_id']);
        
        // Check if tribute exists
        $tribute = $this->tribute_manager->get($tribute_id);
        
        if (is_wp_error($tribute)) {
            return $tribute;
        }
        
        $user_id = intval($tribute['user_id']);
        $meta_key = 'tributestream_extended_data_' . $tribute_id;
        
        $data = $this->user_meta_manager->get($user_id, $meta_key);
        
        if (is_wp_error($data)) {
            return $data;
        }
        
        return rest_ensure_response($data ? $data : array());
    }

    /**
     * Update tribute data (Enhanced to use UserMetaManager)
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function update_tribute_data($request) {
        $tribute_id = intval($request['tribute_id']);
        $body = json_decode($request->get_body(), true);
        
        if (!is_array($body)) {
            $body = array();
        }
        
        $tribute = $this->tribute_manager->get($tribute_id);
        
        if (is_wp_error($tribute)) {
            return $tribute;
        }
        
        $user_id = intval($tribute['user_id']);
        $meta_key = 'tributestream_extended_data_' . $tribute_id;
        
        // Get existing data
        $existing_data = $this->user_meta_manager->get($user_id, $meta_key);
        
        if (is_wp_error($existing_data) || !is_array($existing_data)) {
            $existing_data = array();
        }
        
        // Force tribute_reference
        $existing_data['tribute_reference'] = $tribute_id;
        
        // Merge new data into existing
        $merged_data = array_replace_recursive($existing_data, $body);
        
        $result = $this->user_meta_manager->createOrUpdate($user_id, $meta_key, $merged_data);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response([
            'success' => true,
            'message' => 'Extended data updated successfully'
        ]);
    }

    /*--------------------------------------------------------------------------
     * USER REGISTRATION
     *------------------------------------------------------------------------*/

    /**
     * Register new user (Original implementation)
     * 
     * @param WP_REST_Request $request API request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public function register_new_user($request) {
        $body = json_decode($request->get_body(), true);

        // Check required fields
        $required_fields = array('username', 'email', 'password');
        foreach ($required_fields as $field) {
            if (empty($body[$field])) {
                return new WP_Error(
                    'missing_fields',
                    sprintf('Missing required field: %s', $field),
                    array('status' => 400)
                );
            }
        }

        $username = sanitize_user($body['username']);
        $email = sanitize_email($body['email']);
        $password = $body['password'];

        // Check if username or email exists
        if (username_exists($username)) {
            return new WP_Error('username_exists', 'Username already exists.', array('status' => 400));
        }
        if (email_exists($email)) {
            return new WP_Error('email_exists', 'Email already exists.', array('status' => 400));
        }

        // Create user
        $user_id = wp_create_user($username, $password, $email);
        if (is_wp_error($user_id)) {
            return $user_id;
        }

        // Optionally set extra meta
        if (!empty($body['meta']) && is_array($body['meta'])) {
            foreach ($body['meta'] as $key => $value) {
                update_user_meta($user_id, $key, $value);
            }
        }

        // Generate JWT token
        $token_response = $this->generate_jwt_token([
            'user_login' => $username,
            'user_password' => $password,
        ]);
        
        if (is_wp_error($token_response)) {
            // If token generation fails, just return user info
            return rest_ensure_response([
                'user_id' => $user_id,
                'token' => null,
                'user_display_name' => $username,
                'user_email' => $email,
            ]);
        }

        // Return user data + token
        return rest_ensure_response([
            'user_id' => $user_id,
            'token' => $token_response['token'],
            'user_display_name' => $username,
            'user_email' => $email,
        ]);
    }

    /**
     * Attempt to generate JWT token programmatically (if the JWT Auth plugin is installed).
     * 
     * @param array $creds User credentials
     * @return array|WP_Error Token or error
     */
    private function generate_jwt_token($creds) {
        // If the jwt_auth_generate_token function is available:
        if (function_exists('jwt_auth_generate_token')) {
            $user = wp_signon($creds, false);
            if (is_wp_error($user)) {
                return $user; // Return the error.
            }
            // Return token info
            $token = jwt_auth_generate_token($user->ID);
            if (is_wp_error($token)) {
                return $token;
            }
            return array('token' => $token);
        } else {
            // Fallback: you could return an error or do nothing
            return new WP_Error('jwt_auth_missing', 'JWT Auth plugin is not available.', array('status' => 500));
        }
    }
}

/**
 * Manager class for user metadata operations
 */
class UserMetaManager {
    /**
     * Create or update user metadata with improved validation
     *
     * @param int $user_id WordPress user ID
     * @param string $meta_key Metadata key
     * @param mixed $meta_value Value to store
     * @return array|WP_Error Result of operation
     */
    public function createOrUpdate($user_id, $meta_key, $meta_value) {
        // Validate user exists
        if (!get_userdata($user_id)) {
            return new WP_Error('invalid_user', 'User does not exist', array('status' => 404));
        }
        
        // Validate meta key format
        if (!$this->validateMetaKey($meta_key)) {
            return new WP_Error('invalid_meta_key', 'Meta key contains invalid characters', array('status' => 400));
        }
        
        // Pre-process value based on type
        $processed_value = $this->preprocessValue($meta_value);
        
        // Update the metadata
        $result = update_user_meta($user_id, $meta_key, $processed_value);
        
        if (false === $result) {
            return new WP_Error('update_failed', 'Failed to update user metadata', array('status' => 500));
        }
        
        return array(
            'success' => true,
            'user_id' => $user_id,
            'meta_key' => $meta_key
        );
    }
    
    /**
     * Get user metadata for a specific key
     *
     * @param int $user_id WordPress user ID
     * @param string $meta_key Metadata key
     * @return mixed|WP_Error Metadata value or error
     */
    public function get($user_id, $meta_key) {
        if (!get_userdata($user_id)) {
            return new WP_Error('invalid_user', 'User does not exist', array('status' => 404));
        }
        
        $value = get_user_meta($user_id, $meta_key, true);
        
        // Auto-detect and decode JSON values
        return $this->postprocessValue($value);
    }
    
    /**
     * Get all metadata for a user
     *
     * @param int $user_id WordPress user ID
     * @return array|WP_Error Array of metadata or error
     */
    public function getAll($user_id) {
        if (!get_userdata($user_id)) {
            return new WP_Error('invalid_user', 'User does not exist', array('status' => 404));
        }
        
        $raw_meta = get_user_meta($user_id);
        $processed = array();
        
        foreach ($raw_meta as $key => $values) {
            // Typically each meta key is an array of values, but usually just 1
            if (count($values) === 1) {
                $processed[$key] = $this->postprocessValue($values[0]);
            } else {
                // If multiple meta values exist for the same key
                $arr = array();
                foreach ($values as $v) {
                    $arr[] = $this->postprocessValue($v);
                }
                $processed[$key] = $arr;
            }
        }
        
        return $processed;
    }
    
    /**
     * Delete user metadata
     *
     * @param int $user_id WordPress user ID
     * @param string $meta_key Metadata key
     * @return array|WP_Error Result of operation
     */
    public function delete($user_id, $meta_key) {
        if (!get_userdata($user_id)) {
            return new WP_Error('invalid_user', 'User does not exist', array('status' => 404));
        }
        
        $deleted = delete_user_meta($user_id, $meta_key);
        
        if (!$deleted) {
            return new WP_Error('delete_failed', 'Failed to delete user metadata', array('status' => 500));
        }
        
        return array(
            'success' => true,
            'user_id' => $user_id,
            'meta_key' => $meta_key
        );
    }
    
    /**
     * Process value before storage
     *
     * @param mixed $value Value to process
     * @return mixed Processed value
     */
    private function preprocessValue($value) {
        if (is_array($value) || is_object($value)) {
            return wp_json_encode($value);
        }
        
        return $value;
    }
    
    /**
     * Process value after retrieval
     *
     * @param mixed $value Value to process
     * @return mixed Processed value
     */
    private function postprocessValue($value) {
        if (is_string($value) && $this->isJson($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decoded;
            }
        }
        
        return $value;
    }
    
    /**
     * Check if a string is valid JSON
     *
     * @param string $string String to check
     * @return bool True if valid JSON
     */
    private function isJson($string) {
        if (!is_string($string) || empty($string)) {
            return false;
        }
        
        // Quick check for JSON format
        $first = substr(trim($string), 0, 1);
        $last = substr(trim($string), -1);
        
        if (($first === '{' && $last === '}') || ($first === '[' && $last === ']')) {
            json_decode($string);
            return (json_last_error() === JSON_ERROR_NONE);
        }
        
        return false;
    }
    
    /**
     * Validate meta key format
     *
     * @param string $key Meta key to validate
     * @return bool True if valid
     */
    private function validateMetaKey($key) {
        return is_string($key) && !empty($key) && !preg_match('/[^a-zA-Z0-9_-]/', $key);
    }
}

/**
 * Manager class for form data operations
 */
class FormDataManager {
    /** @var UserMetaManager */
    private $userMetaManager;
    
    /** @var string The meta key for memorial form data */
    private $formMetaKey = 'memorial_form_data';
    
    /**
     * Constructor
     *
     * @param UserMetaManager $userMetaManager User meta manager instance
     */
    public function __construct($userMetaManager) {
        $this->userMetaManager = $userMetaManager;
    }
    
    /**
     * Save form data for a user
     *
     * @param int $user_id WordPress user ID
     * @param array $formData Raw form data
     * @return array|WP_Error Result of operation
     */
    public function saveFormData($user_id, $formData) {
        // Validate form data
        $validation = $this->validateFormData($formData);
        if (is_wp_error($validation)) {
            return $validation;
        }
        
        // Transform to storage format
        $storageData = $this->transformToMetaFormat($formData);
        
        // Save to user metadata
        return $this->userMetaManager->createOrUpdate($user_id, $this->formMetaKey, $storageData);
    }
    
    /**
     * Get form data for a user
     *
     * @param int $user_id WordPress user ID
     * @return array|WP_Error Form data or error
     */
    public function getFormData($user_id) {
        $metaData = $this->userMetaManager->get($user_id, $this->formMetaKey);
        
        if (is_wp_error($metaData)) {
            return $metaData;
        }
        
        if (empty($metaData)) {
            // Return default empty form structure
            return $this->getDefaultFormData();
        }
        
        // Transform from storage format to fd-form format
        return $this->transformFromMetaFormat($metaData);
    }
    
    /**
     * Transform raw form data to storage format
     *
     * @param array $formData Raw form data
     * @return array Structured data for storage
     */
    public function transformToMetaFormat($formData) {
        return array(
            'director' => array(
                'firstName' => $formData['director-first-name'] ?? '',
                'lastName' => $formData['director-last-name'] ?? '',
            ),
            'familyMember' => array(
                'firstName' => $formData['family-member-first-name'] ?? '',
                'lastName' => $formData['family-member-last-name'] ?? '',
                'dob' => $formData['family-member-dob'] ?? '',
            ),
            'deceased' => array(
                'firstName' => $formData['deceased-first-name'] ?? '',
                'lastName' => $formData['deceased-last-name'] ?? '',
                'dob' => $formData['deceased-dob'] ?? '',
                'dop' => $formData['deceased-dop'] ?? '',
            ),
            'contact' => array(
                'email' => $formData['email-address'] ?? '',
                'phone' => $formData['phone-number'] ?? '',
            ),
            'memorial' => array(
                'locationName' => $formData['location-name'] ?? '',
                'locationAddress' => $formData['location-address'] ?? '',
                'time' => $formData['memorial-time'] ?? '',
                'date' => $formData['memorial-date'] ?? '',
            ),
            'meta' => array(
                'version' => '1.0',
                'lastUpdated' => current_time('mysql'),
            ),
        );
    }
    
    /**
     * Transform storage format to fd-form format
     *
     * @param array $metaData Stored metadata
     * @return array Form data format
     */
    public function transformFromMetaFormat($metaData) {
        return array(
            'director-first-name' => $metaData['director']['firstName'] ?? '',
            'director-last-name' => $metaData['director']['lastName'] ?? '',
            'family-member-first-name' => $metaData['familyMember']['firstName'] ?? '',
            'family-member-last-name' => $metaData['familyMember']['lastName'] ?? '',
            'family-member-dob' => $metaData['familyMember']['dob'] ?? '',
            'deceased-first-name' => $metaData['deceased']['firstName'] ?? '',
            'deceased-last-name' => $metaData['deceased']['lastName'] ?? '',
            'deceased-dob' => $metaData['deceased']['dob'] ?? '',
            'deceased-dop' => $metaData['deceased']['dop'] ?? '',
            'email-address' => $metaData['contact']['email'] ?? '',
            'phone-number' => $metaData['contact']['phone'] ?? '',
            'location-name' => $metaData['memorial']['locationName'] ?? '',
            'location-address' => $metaData['memorial']['locationAddress'] ?? '',
            'memorial-time' => $metaData['memorial']['time'] ?? '',
            'memorial-date' => $metaData['memorial']['date'] ?? '',
        );
    }
    
    /**
     * Get default empty form data
     *
     * @return array Default form data
     */
    private function getDefaultFormData() {
        return array(
            'director-first-name' => '',
            'director-last-name' => '',
            'family-member-first-name' => '',
            'family-member-last-name' => '',
            'family-member-dob' => '',
            'deceased-first-name' => '',
            'deceased-last-name' => '',
            'deceased-dob' => '',
            'deceased-dop' => '',
            'email-address' => '',
            'phone-number' => '',
            'location-name' => '',
            'location-address' => '',
            'memorial-time' => '',
            'memorial-date' => '',
        );
    }
    
    /**
     * Validate form data
     *
     * @param array $formData Form data to validate
     * @return true|WP_Error True if valid, error otherwise
     */
    public function validateFormData($formData) {
        $errors = array();
        
        // Required fields
        $requiredFields = array(
            'director-first-name' => "Director's first name is required",
            'director-last-name' => "Director's last name is required",
            'deceased-first-name' => "Deceased's first name is required",
            'deceased-last-name' => "Deceased's last name is required",
            'email-address' => "Email address is required",
            'location-name' => "Memorial location name is required",
        );
        
        foreach ($requiredFields as $field => $message) {
            if (empty($formData[$field])) {
                $errors[$field] = $message;
            }
        }
        
        // Email validation
        if (!empty($formData['email-address']) && !is_email($formData['email-address'])) {
            $errors['email-address'] = "Invalid email format";
        }
        
        // Phone number validation
        if (!empty($formData['phone-number']) && !preg_match('/^[0-9\-\+\(\)\s]{7,20}$/', $formData['phone-number'])) {
            $errors['phone-number'] = "Invalid phone number format";
        }
        
        // Date validations
        $dateFields = array('deceased-dob', 'deceased-dop', 'memorial-date', 'family-member-dob');
        foreach ($dateFields as $field) {
            if (!empty($formData[$field])) {
                $timestamp = strtotime($formData[$field]);
                if ($timestamp === false) {
                    $errors[$field] = "Invalid date format";
                }
            }
        }
        
        if (empty($errors)) {
            return true;
        }
        
        return new WP_Error(
            'form_validation_error',
            'Form validation failed',
            array('fields' => $errors, 'status' => 400)
        );
    }
}

/**
 * Manager class for tribute operations
 */
class TributeManager {
    /** @var string The tributes table name */
    private $tableName;
    
    /** @var UserMetaManager */
    private $userMetaManager;
    
    /**
     * Constructor
     *
     * @param string $tableName Tributes table name
     * @param UserMetaManager $userMetaManager User meta manager instance
     */
    public function __construct($tableName, $userMetaManager) {
        $this->tableName = $tableName;
        $this->userMetaManager = $userMetaManager;
    }
    
    /**
     * Create a new tribute record
     *
     * @param array $tributeData Tribute data
     * @return array|WP_Error New tribute ID or error
     */
    public function create($tributeData) {
        global $wpdb;
        
        // Validate required fields
        $requiredFields = array('user_id', 'loved_one_name', 'phone_number');
        foreach ($requiredFields as $field) {
            if (!isset($tributeData[$field]) || empty($tributeData[$field])) {
                return new WP_Error(
                    'missing_field',
                    sprintf('Missing required field: %s', $field),
                    array('status' => 400)
                );
            }
        }
        
        // Generate slug if not provided
        if (empty($tributeData['slug'])) {
            $tributeData['slug'] = sanitize_title($tributeData['loved_one_name']);
        } else {
            $tributeData['slug'] = sanitize_title($tributeData['slug']);
        }
        
        // Prepare data for insertion
        $insertData = array(
            'user_id' => intval($tributeData['user_id']),
            'loved_one_name' => sanitize_text_field($tributeData['loved_one_name']),
            'slug' => $tributeData['slug'],
            'phone_number' => sanitize_text_field($tributeData['phone_number']),
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql'),
        );
        
        // Add optional fields if present
        if (isset($tributeData['custom_html'])) {
            $insertData['custom_html'] = wp_kses_post($tributeData['custom_html']);
        }
        
        if (isset($tributeData['number_of_streams'])) {
            $insertData['number_of_streams'] = intval($tributeData['number_of_streams']);
        }
        
        // Insert record
        $inserted = $wpdb->insert($this->tableName, $insertData);
        
        if ($inserted === false) {
            return new WP_Error(
                'db_insert_error',
                'Failed to insert tribute record',
                array('status' => 500)
            );
        }
        
        $tributeId = $wpdb->insert_id;
        
        // Store extended data if provided
        if (isset($tributeData['extended_data'])) {
            $this->storeExtendedData($tributeId, $tributeData['user_id'], $tributeData['extended_data']);
        }
        
        return array(
            'success' => true,
            'id' => $tributeId,
            'slug' => $tributeData['slug'],
        );
    }
    
    /**
     * Update an existing tribute record
     *
     * @param int $tributeId Tribute ID
     * @param array $tributeData Updated tribute data
     * @return array|WP_Error Result or error
     */
    public function update($tributeId, $tributeData) {
        global $wpdb;
        
        // Fetch existing tribute to verify it exists
        $tribute = $this->get($tributeId);
        
        if (is_wp_error($tribute)) {
            return $tribute;
        }
        
        // Prepare updateable fields
        $updateData = array();
        $allowedFields = array(
            'loved_one_name' => 'sanitize_text_field',
            'slug' => 'sanitize_title',
            'custom_html' => 'wp_kses_post',
            'phone_number' => 'sanitize_text_field',
            'number_of_streams' => 'intval',
        );
        
        foreach ($allowedFields as $field => $sanitizer) {
            if (isset($tributeData[$field])) {
                $updateData[$field] = $sanitizer($tributeData[$field]);
            }
        }
        
        if (empty($updateData)) {
            return new WP_Error(
                'no_update_data',
                'No valid fields to update',
                array('status' => 400)
            );
        }
        
        // Always update the updated_at timestamp
        $updateData['updated_at'] = current_time('mysql');
        
        // Update record
        $updated = $wpdb->update(
            $this->tableName, 
            $updateData, 
            array('id' => $tributeId)
        );
        
        if ($updated === false) {
            return new WP_Error(
                'db_update_error',
                'Failed to update tribute record',
                array('status' => 500)
            );
        }
        
        // Update extended data if provided
        if (isset($tributeData['extended_data'])) {
            $this->storeExtendedData($tributeId, $tribute['user_id'], $tributeData['extended_data']);
        }
        
        return array(
            'success' => true,
            'updated_rows' => $updated
        );
    }
    
    /**
     * Get a tribute record by ID
     *
     * @param int $tributeId Tribute ID
     * @return array|WP_Error Tribute data or error
     */
    public function get($tributeId) {
        global $wpdb;
        
        $tribute = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$this->tableName} WHERE id = %d",
                $tributeId
            ),
            ARRAY_A
        );
        
        if (!$tribute) {
            return new WP_Error(
                'tribute_not_found',
                'Tribute not found',
                array('status' => 404)
            );
        }
        
        // Get extended data
        $extendedData = $this->getExtendedData($tributeId, $tribute['user_id']);
        if (!is_wp_error($extendedData)) {
            $tribute['extended_data'] = $extendedData;
        }
        
        return $tribute;
    }
    
    /**
     * Get a tribute record by slug
     *
     * @param string $slug Tribute slug
     * @return array|WP_Error Tribute data or error
     */
    public function getBySlug($slug) {
        global $wpdb;
        
        $tribute = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$this->tableName} WHERE slug = %s",
                $slug
            ),
            ARRAY_A
        );
        
        if (!$tribute) {
            return new WP_Error(
                'tribute_not_found',
                'Tribute not found',
                array('status' => 404)
            );
        }
        
        // Get extended data
        $extendedData = $this->getExtendedData($tribute['id'], $tribute['user_id']);
        if (!is_wp_error($extendedData)) {
            $tribute['extended_data'] = $extendedData;
        }
        
        return $tribute;
    }
    
    /**
     * Get all tributes with pagination and search
     *
     * @param int $page Page number
     * @param int $perPage Items per page
     * @param string $search Search term
     * @return array|WP_Error Tribute data or error
     */
    public function getAll($page = 1, $perPage = 10, $search = '') {
        global $wpdb;
        
        $offset = ($page - 1) * $perPage;
        
        // Build WHERE
        $whereClause = 'WHERE 1=1';
        $params = array();
        if (!empty($search)) {
            // Match on loved_one_name or slug
            $searchLike = '%' . $wpdb->esc_like($search) . '%';
            $whereClause .= " AND (loved_one_name LIKE %s OR slug LIKE %s)";
            $params[] = $searchLike;
            $params[] = $searchLike;
        }
        
        // Count total
        $sqlCount = "SELECT COUNT(*) FROM {$this->tableName} $whereClause";
        $totalItems = $wpdb->get_var($wpdb->prepare($sqlCount, $params));
        
        // Query tributes
        $sqlData = "SELECT * FROM {$this->tableName} $whereClause ORDER BY created_at DESC LIMIT %d, %d";
        $paramsData = array_merge($params, array($offset, $perPage));
        $results = $wpdb->get_results($wpdb->prepare($sqlData, $paramsData), ARRAY_A);
        
        $totalPages = ceil($totalItems / $perPage);
        
        return array(
            'tributes' => $results ? $results : array(),
            'total_pages' => $totalPages,
            'total_items' => (int) $totalItems,
            'current_page' => (int) $page
        );
    }
    
    /**
     * Get tributes by user ID
     *
     * @param int $userId User ID
     * @return array|WP_Error Tribute data or error
     */
    public function getByUser($userId) {
        global $wpdb;
        
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$this->tableName} WHERE user_id = %d ORDER BY created_at DESC",
                $userId
            ),
            ARRAY_A
        );
        
        // Add extended data to each tribute
        if ($results) {
            foreach ($results as &$tribute) {
                $extendedData = $this->getExtendedData($tribute['id'], $userId);
                if (!is_wp_error($extendedData)) {
                    $tribute['extended_data'] = $extendedData;
                }
            }
        }
        
        return $results ? $results : array();
    }
    
    /**
     * Delete a tribute record
     *
     * @param int $tributeId Tribute ID
     * @return array|WP_Error Result or error
     */
    public function delete($tributeId) {
        global $wpdb;
        
        // Get tribute first to ensure it exists and to get user_id
        $tribute = $this->get($tributeId);
        
        if (is_wp_error($tribute)) {
            return $tribute;
        }
        
        $deleted = $wpdb->delete($this->tableName, array('id' => $tributeId));
        
        if ($deleted === false) {
            return new WP_Error(
                'db_delete_error',
                'Failed to delete tribute record',
                array('status' => 500)
            );
        }
        
        if ($deleted === 0) {
            return new WP_Error(
                'not_found',
                'Tribute not found',
                array('status' => 404)
            );
        }
        
        // Delete associated extended data
        $metaKey = 'tributestream_extended_data_' . $tributeId;
        $this->userMetaManager->delete($tribute['user_id'], $metaKey);
        
        return array(
            'success' => true,
            'deleted_rows' => $deleted
        );
    }
    
    /**
     * Store extended tribute data
     *
     * @param int $tributeId Tribute ID
     * @param int $userId User ID
     * @param array $data Extended data
     * @return array|WP_Error Result or error
     */
    private function storeExtendedData($tributeId, $userId, $data) {
        // Ensure tribute_reference is set
        $data['tribute_reference'] = $tributeId;
        
        // Store in user meta
        $metaKey = 'tributestream_extended_data_' . $tributeId;
        return $this->userMetaManager->createOrUpdate($userId, $metaKey, $data);
    }
    
    /**
     * Get extended tribute data
     *
     * @param int $tributeId Tribute ID
     * @param int $userId User ID
     * @return array|WP_Error Extended data or error
     */
    private function getExtendedData($tributeId, $userId) {
        $metaKey = 'tributestream_extended_data_' . $tributeId;
        return $this->userMetaManager->get($userId, $metaKey);
    }
}

/**
 * Manager class for security operations
 */
class SecurityManager {
    /**
     * Generic check that user is logged in via JWT (non-public routes).
     * 
     * @return bool|WP_Error True if auth valid, WP_Error otherwise
     */
    public function check_jwt_auth() {
        if (is_user_logged_in()) {
            return true;
        }
        return new WP_Error('unauthorized', __('You must be logged in (JWT) to access this route.', 'tributestream-complete'), array('status' => 401));
    }

    /**
     * Checks if current user is admin or the same as {user_id}.
     * 
     * @param WP_REST_Request $request API request
     * @return bool|WP_Error True if auth valid, WP_Error otherwise
     */
    public function check_user_ownership_or_admin($request) {
        // Must be logged in at least.
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', __('You must be logged in.', 'tributestream-complete'), array('status' => 401));
        }
        $current_user_id = get_current_user_id();
        $requested_user_id = (int) $request['user_id'];

        if (user_can($current_user_id, 'administrator') || $current_user_id === $requested_user_id) {
            return true;
        }
        return new WP_Error('unauthorized', __('You are not allowed to access this user\'s data.', 'tributestream-complete'), array('status' => 403));
    }

    /**
     * Checks if current user is admin or the same user as in POST body for user-meta creation.
     * 
     * @param WP_REST_Request $request API request
     * @return bool|WP_Error True if auth valid, WP_Error otherwise
     */
    public function check_user_meta_ownership($request) {
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', __('You must be logged in.', 'tributestream-complete'), array('status' => 401));
        }
        $current_user_id = get_current_user_id();
        $body = json_decode($request->get_body(), true);

        if (!isset($body['user_id'])) {
            return new WP_Error('missing_fields', __('Missing required field: user_id', 'tributestream-complete'), array('status' => 400));
        }

        $requested_user_id = (int) $body['user_id'];
        if (user_can($current_user_id, 'administrator') || $current_user_id === $requested_user_id) {
            return true;
        }
        return new WP_Error('unauthorized', __('You are not allowed to modify this user\'s meta.', 'tributestream-complete'), array('status' => 403));
    }

    /**
     * Checks if the current user is admin or owner of the tribute.
     * 
     * @param WP_REST_Request $request API request
     * @return bool|WP_Error True if auth valid, WP_Error otherwise
     */
    public function check_tribute_ownership($request) {
        global $wpdb;
        
        // Must be logged in at least.
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', __('You must be logged in.', 'tributestream-complete'), array('status' => 401));
        }

        $table_name = $wpdb->prefix . 'tributes';
        $id_field = isset($request['id']) ? 'id' : 'tribute_id';
        $tribute_id = intval($request[$id_field]);

        $tribute = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table_name} WHERE id = %d", $tribute_id));
        if (!$tribute) {
            return new WP_Error('not_found', __('Tribute not found.', 'tributestream-complete'), array('status' => 404));
        }

        $current_user_id = get_current_user_id();
        // If user is admin or tribute->user_id matches current user:
        if (user_can($current_user_id, 'administrator') || (int) $tribute->user_id === $current_user_id) {
            return true;
        }

        return new WP_Error('unauthorized', __('You do not have permission to access this tribute.', 'tributestream-complete'), array('status' => 403));
    }
}

// Instantiate the plugin class
new TributeStreamComplete();