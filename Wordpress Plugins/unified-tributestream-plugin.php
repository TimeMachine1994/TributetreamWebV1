<?php
/*
Plugin Name: Unified Tributestream Plugin
*/
global $wpdb;

add_action('rest_api_init', function() {

 

    register_rest_route('tributestream/v1', '/tribute', [
        'methods' => 'POST',
        'callback' => 'create_tribute',
        'permission_callback' => 'is_user_logged_in',
    ]);
    // Register user registration route
    register_rest_route('tributestream/v1', '/register', [
        'methods' => ['POST', 'GET'],
        'callback' => 'handle_tributestream_registration',
        'permission_callback' => '__return_true'
    ]);
});

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
