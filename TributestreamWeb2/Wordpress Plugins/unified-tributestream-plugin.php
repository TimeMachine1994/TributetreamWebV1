<?php
/**
 * Plugin Name: A6 Tributestream (Unified + Refactored)
 * Description: A refactoring of "Plugin 5" plus unified endpoints, using a custom 'wp_tributes' table and usermeta. Integrates JWT Auth for authentication.
 * Version: 1.3
 * Author: Your Name
 *
 * -------------------------------------------------------------------------
 * :: Overview
 * -------------------------------------------------------------------------
 * This plugin demonstrates how to store tribute data in a custom table
 * 'wp_tributes' (or '{prefix}_tributes') and user meta in 'wp_usermeta',
 * all exposed via REST API under the 'tributestream/v1' namespace.
 *
 * It relies on a JWT Auth plugin for protected routes (via verify_jwt_cookie
 * or custom_jwt_authenticate). Public routes are marked __return_true.
 *
 * Endpoints:
 * - /getRole (GET)                -> Return a user's roles by user ID
 * - /all-tributes (GET)           -> Get all tributes in DESC order (custom table)
 * - /tributes (GET|POST)          -> List tributes (paginated) OR create a new tribute
 * - /tributes/<id> (GET|PUT|DELETE) -> Read/Update/Delete a tribute by ID
 * - /tribute (POST, JWT)          -> Another create route for tributes (protected)
 * - /tribute/<slug> (GET)         -> Public read by slug
 * - /user-meta (POST, JWT)        -> Create/Update user meta
 * - /user-meta/<user_id> (GET, JWT) -> Retrieve user meta
 * - /register (POST)              -> Public user registration
 *
 * Additional usage or expansions can be integrated as needed.
 */

// -------------------------------------------------------------------------
// :: Global $wpdb
// -------------------------------------------------------------------------
global $wpdb;

// -------------------------------------------------------------------------
// :: REST API Registration
// -------------------------------------------------------------------------
add_action('rest_api_init', function () {

    $namespace = 'tributestream/v1';

    /**
     * ---------------------------------------------------------------------
     * 1) Basic "getRole" Endpoint (A6 snippet)
     * GET /tributestream/v1/getRole?id=123
     * ---------------------------------------------------------------------
     */
    register_rest_route(
        $namespace,
        '/getRole',
        [
            'methods'  => 'GET',
            'callback' => 'get_user_roles_endpoint',
            'args'     => [
                'id' => [
                    'required'    => true,
                    'type'        => 'integer',
                    'description' => 'User ID to fetch roles for.',
                ],
            ],
            'permission_callback' => '__return_true', // or verify_jwt_cookie if you want it protected
        ]
    );

    /**
     * ---------------------------------------------------------------------
     * 2) "all-tributes" Endpoint (Descending order)
     * GET /tributestream/v1/all-tributes
     * ---------------------------------------------------------------------
     */
    register_rest_route(
        $namespace,
        '/all-tributes',
        [
            'methods'             => 'GET',
            'callback'            => 'get_all_tributes_desc', // from snippet
            'permission_callback' => '__return_true',          // public
        ]
    );

    /**
     * ---------------------------------------------------------------------
     * 3) TRIBUTES (Generic GET + POST)
     * GET /tributestream/v1/tributes       -> Paginated list
     * POST /tributestream/v1/tributes      -> Create new tribute
     * ---------------------------------------------------------------------
     */
    register_rest_route($namespace, '/tributes', [
        [
            'methods'             => 'GET',
            'callback'            => 'get_all_tributes',  // paginated
            'permission_callback' => '__return_true',     // or verify_jwt_cookie
        ],
        [
            'methods'             => 'POST',
            'callback'            => 'create_tribute',    // create a new tribute
            'permission_callback' => '__return_true',     // or verify_jwt_cookie
            'args' => [
                'user_id'          => ['required' => true, 'type' => 'integer'],
                'loved_one_name'   => ['required' => true, 'type' => 'string'],
                'slug'             => ['required' => true, 'type' => 'string'],
                'custom_html'      => ['required' => false, 'type' => 'string'],
                'phone_number'     => ['required' => true, 'type' => 'string'],
                'number_of_streams'=> ['required' => false, 'type' => 'integer'],
            ],
        ],
    ]);

    /**
     * ---------------------------------------------------------------------
     * 4) TRIBUTE by ID (READ / UPDATE / DELETE)
     * GET /tributestream/v1/tributes/<id>
     * PUT /tributestream/v1/tributes/<id>
     * DELETE /tributestream/v1/tributes/<id>
     * ---------------------------------------------------------------------
     */
    register_rest_route($namespace, '/tributes/(?P<id>\d+)', [
        [
            'methods'             => 'GET',
            'callback'            => 'read_tribute',
            'permission_callback' => '__return_true', // or verify_jwt_cookie
        ],
        [
            'methods'             => 'PUT',
            'callback'            => 'update_tribute',
            'permission_callback' => '__return_true', // or verify_jwt_cookie
        ],
        [
            'methods'             => 'DELETE',
            'callback'            => 'delete_tribute',
            'permission_callback' => '__return_true', // or verify_jwt_cookie
        ],
    ]);

    /**
     * ---------------------------------------------------------------------
     * 5) Alternative CREATE (Protected)
     * POST /tributestream/v1/tribute
     * Protected by JWT. This route is from snippet example.
     * ---------------------------------------------------------------------
     */
    register_rest_route(
        $namespace,
        '/tribute',
        [
            'methods'             => 'POST',
            'callback'            => 'handle_tributes_entry',  // snippet's "create tribute" logic
            'permission_callback' => 'verify_jwt_cookie',      // must have valid JWT
        ]
    );

    /**
     * ---------------------------------------------------------------------
     * 6) GET Tribute by SLUG (Public)
     * GET /tributestream/v1/tribute/<slug>
     * ---------------------------------------------------------------------
     */
    register_rest_route(
        $namespace,
        '/tribute/(?P<slug>[a-zA-Z0-9-_]+)',
        [
            'methods'             => 'GET',
            'callback'            => 'get_tribute_by_slug',
            'permission_callback' => '__return_true',
        ]
    );

    /**
     * ---------------------------------------------------------------------
     * 7) USER META (Protected)
     * POST /tributestream/v1/user-meta
     * GET  /tributestream/v1/user-meta/<user_id>
     * ---------------------------------------------------------------------
     */
    register_rest_route(
        $namespace,
        '/user-meta',
        [
            [
                'methods'             => 'POST',
                'callback'            => 'ts_store_user_meta',
                'permission_callback' => 'custom_jwt_authenticate', // check JWT
                'args'                => [
                    'user_id'    => ['required' => true, 'type' => 'integer'],
                    'meta_key'   => ['required' => true, 'type' => 'string'],
                    'meta_value' => ['required' => true, 'type' => 'string'],
                ],
            ],
        ]
    );

    register_rest_route(
        $namespace,
        '/user-meta/(?P<user_id>\d+)',
        [
            [
                'methods'             => 'GET',
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
     * ---------------------------------------------------------------------
     * 8) REGISTER (Public)
     * POST /tributestream/v1/register
     * ---------------------------------------------------------------------
     */
    register_rest_route(
        $namespace,
        '/register',
        [
            'methods'             => 'POST',
            'callback'            => 'handle_tributestream_registration',
            'permission_callback' => '__return_true',
        ]
    );
});


// -------------------------------------------------------------------------
// :: 1) get_user_roles_endpoint
// -------------------------------------------------------------------------
function get_user_roles_endpoint(WP_REST_Request $request)
{
    $user_id   = $request->get_param('id');
    $user_data = get_userdata($user_id);

    if (!$user_data) {
        return new WP_Error(
            'user_not_found',
            'No user found for the specified ID.',
            ['status' => 404]
        );
    }

    return [
        'user_id' => $user_id,
        'roles'   => $user_data->roles,
    ];
}

// -------------------------------------------------------------------------
// :: 2) "all-tributes" => get_all_tributes_desc
//     from your snippet - returns all tributes in descending order by id
// -------------------------------------------------------------------------
function get_all_tributes_desc($request)
{
    global $wpdb;
    // If your table is specifically named wpa2_tributes, use that.
    // Otherwise, you can do $wpdb->prefix . 'tributes'.
    $table_name = $wpdb->prefix . 'tributes';

    $query = "SELECT 
                id,
                user_id,
                loved_one_name,
                slug,
                created_at,
                updated_at,
                custom_html,
                phone_number,
                number_of_streams
              FROM $table_name
              ORDER BY id DESC";

    $results = $wpdb->get_results($query, ARRAY_A);
    return new WP_REST_Response($results, 200);
}

// -------------------------------------------------------------------------
// :: 3) get_all_tributes (GET) => shows pagination & optional search
// -------------------------------------------------------------------------
function get_all_tributes($request)
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributes';

    // Pagination
    $page     = (int) ($request['page'] ?? 1);
    $per_page = (int) ($request['per_page'] ?? 10);
    $offset   = ($page - 1) * $per_page;

    // Search
    $search        = isset($request['search']) ? sanitize_text_field($request['search']) : '';
    $where_clause  = '';
    if (!empty($search)) {
        // Example searching "loved_one_name" or "slug"
        $where_clause = $wpdb->prepare(
            "WHERE loved_one_name LIKE %s OR slug LIKE %s",
            '%' . $wpdb->esc_like($search) . '%',
            '%' . $wpdb->esc_like($search) . '%'
        );
    }

    // Get total count
    $total_items = $wpdb->get_var("SELECT COUNT(*) FROM $table_name $where_clause");
    $total_pages = ceil($total_items / $per_page);

    // Get the data
    $results = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT * FROM $table_name 
             $where_clause 
             ORDER BY id DESC 
             LIMIT %d OFFSET %d",
            $per_page,
            $offset
        ),
        ARRAY_A
    );

    return rest_ensure_response([
        'tributes'    => $results ?: [],
        'total_pages' => $total_pages,
        'total_items' => $total_items,
        'current_page'=> $page,
    ]);
}

// -------------------------------------------------------------------------
// :: 3b) CREATE tribute (POST /tributes) => create_tribute
// -------------------------------------------------------------------------
function create_tribute($request)
{
    global $wpdb;
    $table = $wpdb->prefix . 'tributes';

    $data = [
        'user_id'           => (int) $request['user_id'],
        'loved_one_name'    => sanitize_text_field($request['loved_one_name']),
        'slug'              => sanitize_title($request['slug']),
        'custom_html'       => $request['custom_html'] ?? null,
        'phone_number'      => sanitize_text_field($request['phone_number']),
        'number_of_streams' => isset($request['number_of_streams']) ? (int)$request['number_of_streams'] : null,
        'created_at'        => current_time('mysql', 1),
        'updated_at'        => current_time('mysql', 1),
    ];

    $inserted = $wpdb->insert($table, $data);
    if ($inserted) {
        return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id]);
    }

    return new WP_Error('db_insert_error', 'Failed to insert data', ['status' => 500]);
}

// -------------------------------------------------------------------------
// :: 4a) READ tribute by ID (GET /tributes/<id>) => read_tribute
// -------------------------------------------------------------------------
function read_tribute($request)
{
    global $wpdb;
    $table = $wpdb->prefix . 'tributes';
    $id    = (int) $request['id'];

    $tribute = $wpdb->get_row(
        $wpdb->prepare("SELECT * FROM $table WHERE id = %d", $id),
        ARRAY_A
    );

    if ($tribute) {
        return rest_ensure_response($tribute);
    }

    return new WP_Error('not_found', 'Tribute not found', ['status' => 404]);
}

// -------------------------------------------------------------------------
// :: 4b) UPDATE tribute by ID (PUT /tributes/<id>) => update_tribute
// -------------------------------------------------------------------------
function update_tribute($request)
{
    global $wpdb;
    $table = $wpdb->prefix . 'tributes';
    $id    = (int) $request['id'];

    $data = array_filter([
        'loved_one_name'    => sanitize_text_field($request['loved_one_name'] ?? ''),
        'slug'              => sanitize_title($request['slug'] ?? ''),
        'custom_html'       => $request['custom_html'] ?? '',
        'phone_number'      => sanitize_text_field($request['phone_number'] ?? ''),
        'number_of_streams' => isset($request['number_of_streams']) ? (int)$request['number_of_streams'] : null,
        'updated_at'        => current_time('mysql', 1),
    ], function ($value) {
        return $value !== null && $value !== '';
    });

    if (empty($data)) {
        return new WP_Error('no_update', 'No valid fields to update', ['status' => 400]);
    }

    $updated = $wpdb->update($table, $data, ['id' => $id]);
    if ($updated !== false) {
        return rest_ensure_response(['success' => true, 'updated_rows' => $updated]);
    }

    return new WP_Error('db_update_error', 'Failed to update data', ['status' => 500]);
}

// -------------------------------------------------------------------------
// :: 4c) DELETE tribute by ID (DELETE /tributes/<id>) => delete_tribute
// -------------------------------------------------------------------------
function delete_tribute($request)
{
    global $wpdb;
    $table = $wpdb->prefix . 'tributes';
    $id    = (int) $request['id'];

    $deleted = $wpdb->delete($table, ['id' => $id]);
    if ($deleted) {
        return rest_ensure_response(['success' => true, 'deleted_rows' => $deleted]);
    }

    return new WP_Error('db_delete_error', 'Failed to delete data', ['status' => 500]);
}

// -------------------------------------------------------------------------
// :: 5) Another CREATE (POST /tribute) => handle_tributes_entry (JWT-protected)
// -------------------------------------------------------------------------
function handle_tributes_entry($request)
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributes';

    $params = $request->get_json_params();
    error_log('handle_tributes_entry: ' . json_encode($params));

    $data = [
        'user_id'        => isset($params['user_id'])        ? intval($params['user_id']) : null,
        'loved_one_name' => isset($params['loved_one_name']) ? sanitize_text_field($params['loved_one_name']) : null,
        'slug'           => isset($params['slug'])           ? sanitize_title($params['slug']) : null,
        'created_at'     => current_time('mysql', 1),
        'updated_at'     => current_time('mysql', 1),
    ];

    // Basic validation
    if (empty($data['user_id']) || empty($data['loved_one_name']) || empty($data['slug'])) {
        return new WP_Error(
            'missing_fields',
            'Required fields (user_id, loved_one_name, slug) are missing or empty.',
            ['status' => 400]
        );
    }

    $result = $wpdb->insert($table_name, $data);
    if ($result === false) {
        $wpdb_error = $wpdb->last_error;
        error_log('DB insert error: ' . $wpdb_error);
        return new WP_Error(
            'db_insert_error',
            'Failed to insert tribute entry: ' . $wpdb_error,
            ['status' => 500]
        );
    }

    return new WP_REST_Response(
        [
            'message' => 'Tribute created successfully',
            'id'      => $wpdb->insert_id,
        ],
        201
    );
}

// -------------------------------------------------------------------------
// :: 6) GET tribute by SLUG (public) => get_tribute_by_slug
// -------------------------------------------------------------------------
function get_tribute_by_slug($request)
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'tributes';

    $slug   = sanitize_title($request['slug']);
    $result = $wpdb->get_row(
        $wpdb->prepare("SELECT * FROM $table_name WHERE slug = %s", $slug),
        ARRAY_A
    );

    if (!$result) {
        return new WP_REST_Response(['message' => 'Tribute not found'], 404);
    }

    return new WP_REST_Response($result, 200);
}

// -------------------------------------------------------------------------
// :: 7) USER META (Protected)
//     POST /user-meta => ts_store_user_meta
//     GET  /user-meta/<user_id> => ts_get_all_user_meta
// -------------------------------------------------------------------------
function ts_store_user_meta($request)
{
    $params     = $request->get_json_params();
    $user_id    = isset($params['user_id'])    ? (int)$params['user_id'] : 0;
    $meta_key   = isset($params['meta_key'])   ? sanitize_text_field($params['meta_key']) : '';
    $meta_value = isset($params['meta_value']) ? sanitize_text_field($params['meta_value']) : '';

    if (!$user_id || !$meta_key) {
        return new WP_Error('missing_params', 'user_id and meta_key are required', ['status' => 400]);
    }

    $result = update_user_meta($user_id, $meta_key, $meta_value);
    if ($result === false) {
        return new WP_Error(
            'meta_update_failed',
            'Failed to update user meta. Please check the data and try again.',
            ['status' => 500]
        );
    }

    return new WP_REST_Response([
        'success'    => true,
        'message'    => 'User meta updated successfully.',
        'user_id'    => $user_id,
        'meta_key'   => $meta_key,
        'meta_value' => $meta_value,
    ], 200);
}

function ts_get_all_user_meta($request)
{
    global $wpdb;
    $user_id = (int) $request->get_param('user_id');

    // Confirm that user actually exists
    if (!get_userdata($user_id)) {
        return new WP_Error('user_not_found', 'User ID does not exist.', ['status' => 404]);
    }

    // Query usermeta
    $table_name = $wpdb->usermeta;
    $results = $wpdb->get_results(
        $wpdb->prepare("SELECT meta_key, meta_value FROM $table_name WHERE user_id = %d", $user_id),
        ARRAY_A
    );

    if ($results === false) {
        return new WP_Error('db_query_failed', 'Error querying usermeta.', ['status' => 500]);
    }
    if (empty($results)) {
        return new WP_Error('no_meta_found', 'No meta data found for user.', ['status' => 404]);
    }

    return new WP_REST_Response([
        'success' => true,
        'user_id' => $user_id,
        'meta'    => $results,
    ], 200);
}

// -------------------------------------------------------------------------
// :: 8) REGISTER (Public)
//     POST /register => handle_tributestream_registration
// -------------------------------------------------------------------------
function handle_tributestream_registration($request)
{
    error_log('Registration attempt started');
    $params   = $request->get_json_params();
    $username = sanitize_user($params['username'] ?? '');
    $email    = sanitize_email($params['email'] ?? '');
    $password = $params['password'] ?? '';
    $meta     = $params['meta'] ?? [];

    // Create the new user
    $user_id = wp_create_user($username, $password, $email);
    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', $user_id->get_error_message(), ['status' => 400]);
    }

    // Optionally store meta fields
    if (!empty($meta)) {
        foreach ($meta as $key => $value) {
            update_user_meta($user_id, sanitize_key($key), sanitize_text_field($value));
        }
    }

    // Optionally send an email
    wp_mail(
        $email,
        'Welcome to TributeStream',
        "Your account has been created.\nUsername: $username"
    );

    return new WP_REST_Response(['user_id' => $user_id], 201);
}

// -------------------------------------------------------------------------
// :: JWT AUTH CALLBACKS (verify_jwt_cookie & custom_jwt_authenticate)
// -------------------------------------------------------------------------

function verify_jwt_cookie($request)
{
    error_log('Attempting JWT authentication: verify_jwt_cookie');

    $auth_header = $request->get_header('Authorization');
    if (!$auth_header || stripos($auth_header, 'Bearer ') === false) {
        return new WP_Error(
            'jwt_auth_no_auth_header',
            'Authorization header not found or invalid.',
            ['status' => 403]
        );
    }

    $token = trim(str_ireplace('Bearer', '', $auth_header));
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
        $body = $response->get_data();
        $err  = isset($body['message']) ? $body['message'] : 'Unknown error';
        return new WP_Error('jwt_auth_invalid_token', "Token validation failed: $err", ['status' => 403]);
    }

    return true;
}

function custom_jwt_authenticate($request)
{
    error_log('Attempting JWT authentication: custom_jwt_authenticate');

    $auth_header = $request->get_header('Authorization');
    if (!$auth_header || stripos($auth_header, 'Bearer ') === false) {
        return new WP_Error(
            'jwt_auth_no_auth_header',
            'Authorization header not found or invalid.',
            ['status' => 403]
        );
    }

    $token = trim(str_ireplace('Bearer', '', $auth_header));
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
        $body = $response->get_data();
        $err  = isset($body['message']) ? $body['message'] : 'Unknown error';
        return new WP_Error('jwt_auth_invalid_token', "Token validation failed: $err", ['status' => 403]);
    }

    return true;
}
