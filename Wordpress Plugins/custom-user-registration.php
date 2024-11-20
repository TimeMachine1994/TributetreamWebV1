<?php
/*
Plugin Name: Custom User Registration
*/
global $wpdb;


// Set up CORS headers specifically for REST API requests
add_action('rest_api_init', function() {
    header("Access-Control-Allow-Origin: https://tributestream.com");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
}, 15);
add_action('rest_api_init', function() {
    
        register_rest_route('custom/v1', '/slugs', array(
        'methods' => 'GET',
        'callback' => 'get_all_slugs'
    ));

    register_rest_route('registration_email/v1', '/send-email', array(
        'methods' => 'POST',
        'callback' => 'custom_send_registration_email',
        'permission_callback' => '__return_true',
        'args' => array(
            'email' => array(
                'required' => true,
                'type' => 'string'
            ),
            'subject' => array(
                'required' => true,
                'type' => 'string'
            ),
            'message' => array(
                'required' => true,
                'type' => 'string'
            )
        )
    ));
    
    
    
    
    //endpoints for CRUD on the wordpress tables
    register_rest_route('tributestream/v1', '/tribute', array(
        'methods' => 'POST',
        'callback' => 'create_tribute',
        'permission_callback' => 'is_user_logged_in'
    ));

 register_rest_route('tributestream/v1', '/tribute/(?P<slug>[a-zA-Z0-9-]+)', array(
        'methods' => 'GET',
        'callback' => 'get_tribute',
        'args' => array(
            'slug' => array(
                'validate_callback' => function($param, $request, $key) {
                    return is_string($param);
                }
            ),
        ),
        'permission_callback' => '__return_true', // Adjust this based on your security requirements
    ));

    register_rest_route('tributestream/v1', '/tribute/(?P<id>\d+)', array(
        'methods' => 'PUT',
        'callback' => 'update_tribute',
        'permission_callback' => 'is_user_logged_in'
    ));

    register_rest_route('tributestream/v1', '/tribute/(?P<id>\d+)', array(
        'methods' => 'DELETE',
        'callback' => 'delete_tribute',
        'permission_callback' => 'is_user_logged_in'
    ));

    // Register route for adding a slug
    register_rest_route('tributestream/v1', '/add-slug', [ //MAKE SURE UPDATE AND ADD SLUG WORK WITH THE MYSQL DB
        'methods' => 'POST',
        'callback' => 'add_slug_to_table',
        'permission_callback' => '__return_true', // Adjust for security in production
    ]);



    // Register user registration route
    register_rest_route('custom-user-registration/v1', '/register', [
        'methods' => ['POST', 'GET'],
        'callback' => 'handle_tributestream_registration',
        'permission_callback' => '__return_true'
    ]);

    // Test endpoint for debugging
    register_rest_route('custom-user-registration/v1', '/test', [
        'methods' => 'GET',
        'callback' => function() {
            return new WP_REST_Response('Endpoint is working!', 200);
        },
        'permission_callback' => '__return_true'
    ]);
    
        register_rest_route('tributestream/v1', '/tribute/(?P<tribute_id>\d+)/videos', [
        'methods' => 'GET',
        'callback' => 'get_tribute_videos',
        'permission_callback' => 'is_user_logged_in'
    ]);
    
    register_rest_route('tributestream/v1', '/tribute/video', [
        'methods' => 'POST',
        'callback' => 'create_tribute_video',
        'permission_callback' => 'is_user_logged_in'
    ]);
    
    register_rest_route('tributestream/v1', '/tribute/video/(?P<id>\d+)', [
        'methods' => 'PUT',
        'callback' => 'update_tribute_video',
        'permission_callback' => 'is_user_logged_in'
    ]);
    
    register_rest_route('tributestream/v1', '/tribute/video/(?P<id>\d+)', [
        'methods' => 'DELETE',
        'callback' => 'delete_tribute_video',
        'permission_callback' => 'is_user_logged_in'
    ]);
    // Register the nonce endpoint
    register_rest_route('tributestream/v1', '/get-nonce', [
        'methods' => 'GET',
        'callback' => 'get_custom_nonce',
        'permission_callback' => '__return_true'
    ]);
});

function custom_send_registration_email($request) {
    // Get parameters from request body
    $params = $request->get_params();
    
    $email = $params['email'];
    $subject = $params['subject'];
    $message = $params['message'];
    $headers = array('Content-Type: text/plain; charset=UTF-8');

    $sent = wp_mail($email, $subject, $message, $headers);
    
    if ($sent) {
        return new WP_REST_Response(['message' => 'Email sent successfully'], 200);
    } else {
        return new WP_REST_Response(['message' => 'Failed to send email'], 500);
    }
}

// Function to add a slug to the custom table DOUBLE CHECK THIS
function add_slug_to_table($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'array_data';
    $slug = sanitize_text_field($request->get_param('slug'));

    // Check if slug exists
    $exists = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM $table_name WHERE array_value = %s",
        $slug
    ));

    if ($exists) {
        return new WP_REST_Response(['message' => 'Already added'], 200);
    }

    // Insert the slug
    $wpdb->insert($table_name, [
        'post_id' => 0, // Adjust as needed
        'array_key' => 'slug_key', // Adjust if you want a specific key
        'array_value' => $slug,
    ]);

    return new WP_REST_Response(['message' => 'Added'], 200);
}


// Function to handle user registration
function handle_tributestream_registration($request) {
    error_log('Registration attempt started');
    
    $params = $request->get_json_params();
    
    $username = sanitize_user($params['username']);
    $email = sanitize_email($params['email']);
    $password = $params['password'];
    $meta = $params['meta'];
    
    $user_id = wp_create_user($username, $password, $email);
    
    if (is_wp_error($user_id)) {
        error_log('Registration failed: ' . $user_id->get_error_message());
        return new WP_Error('registration_failed', $user_id->get_error_message(), ['status' => 400]);
    }
    
    update_user_meta($user_id, 'full_name', sanitize_text_field($meta['full_name']));
    update_user_meta($user_id, 'loved_one_name', sanitize_text_field($meta['loved_one_name']));
    update_user_meta($user_id, 'phone', sanitize_text_field($meta['phone']));
    
    return new WP_REST_Response(['user_id' => $user_id, 'message' => 'User registered successfully'], 201);
}


//Functions to add REST api end points (crud) for database TRIBUTES
// Create tribute
function create_tribute($request) {
     global $wpdb;
    $params = $request->get_json_params();
    $user_id = $params['user_id'];
    $loved_one_name = sanitize_text_field($params['loved_one_name']);
    $slug = sanitize_text_field($params['slug']);
    
     $result = $wpdb->insert(
        'wpa2_tributes',
        array(
            'user_id' => $user_id,
            'loved_one_name' => $loved_one_name,
            'slug' => $slug
        ),
        array('%d', '%s', '%s')
    );
      if ($result === false) {
        return new WP_Error('db_insert_error', 'Failed to insert tribute', array('status' => 500));
    }
    
        return new WP_REST_Response(array('message' => 'Tribute created successfully', 'id' => $wpdb->insert_id), 200);

}

//Read Tribute
function get_tribute($request) {
    global $wpdb;
    
    $slug = $request->get_param('slug');
    
    return $wpdb->get_row(
        $wpdb->prepare(
            "SELECT *, custom_html FROM wpa2_tributes WHERE slug = %s",
            $slug
        )
    );
}

function get_all_slugs() {
    global $wpdb;
    $results = $wpdb->get_results("SELECT post_name FROM wp_posts WHERE post_status = 'publish' AND post_type = 'page'");
    $slugs = array_map(function($row) {
        return $row->post_name;
    }, $results);
    return $slugs;
}

// added 11.15.24  and beyond: 

function create_tribute_video($request) {
    global $wpdb;
    $params = $request->get_json_params();
    
    $result = $wpdb->insert(
        'wpa2_tribute_videos',
        array(
            'tribute_id' => $params['tribute_id'],
            'embed_code' => $params['embed_code'],
            'position' => $params['position'],
            'title' => $params['title'],
            'description' => $params['description']
        ),
        array('%d', '%s', '%d', '%s', '%s')
    );
    
    return new WP_REST_Response(array(
        'message' => 'Video created successfully',
        'id' => $wpdb->insert_id
    ), 200);
}

// Get videos for a tribute
function get_tribute_videos($request) {
    global $wpdb;
    $tribute_id = $request->get_param('tribute_id');
    
    $videos = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM wpa2_tribute_videos WHERE tribute_id = %d ORDER BY position ASC",
        $tribute_id
    ));
    
    return new WP_REST_Response($videos, 200);
}

// Update video
function update_tribute_video($request) {
    global $wpdb;
    $video_id = $request->get_param('id');
    $params = $request->get_json_params();
    
    $wpdb->update(
        'wpa2_tribute_videos',
        array(
            'embed_code' => $params['embed_code'],
            'position' => $params['position'],
            'title' => $params['title'],
            'description' => $params['description']
        ),
        array('id' => $video_id)
    );
    
    return new WP_REST_Response(['message' => 'Video updated'], 200);
}

// Delete video
function delete_tribute_video($request) {
    global $wpdb;
    $video_id = $request->get_param('id');
    
    $wpdb->delete('wpa2_tribute_videos', ['id' => $video_id]);
    return new WP_REST_Response(['message' => 'Video deleted'], 200);
}
 
 function get_custom_nonce() {
    return new WP_REST_Response([
        'nonce' => wp_create_nonce('wp_rest')
    ], 200);
}



