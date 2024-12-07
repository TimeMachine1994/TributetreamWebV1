<?php
/*
Plugin Name: Unified Tributestream Plugin
*/
// **************************************************************
// ::Set Wordpress Database Connection via wpdb class.
// **************************************************************
// An instantiated wpdb class can talk to any number of tables, 
// but only to one database at a time. 
// Ref: https://developer.wordpress.org/reference/classes/wpdb/
// **************************************************************
global $wpdb;
// **************************************************************
// ::Beginning of the plugin, initalize the rest api.
// **************************************************************
// To make this available via the API, we need to register a
// route. This tells the API to respond to a given request with our
// function. We do this through a function called register_rest_route, 
// which should be called in a callback on rest_api_init to avoid doing 
// extra work when the API isn’t loaded.
// https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/
// **************************************************************
add_action ('rest_api_init', function() {

    register_rest_route('tributestream/v1', '/tribute', [
        'methods' => 'POST',
        'callback' => 'create_tribute',
        'permission_callback' => 'is_user_logged_in',
    ]);

    //Need to add GET route for this soon.

    // Register user registration route
    register_rest_route('tributestream/v1', '/register', [
        'methods' => ['POST', 'GET'],
        'callback' => 'handle_tributestream_registration',
        'permission_callback' => '__return_true'
    ]);

    register_rest_route('tributestream/v1', '/saveCart', [
        'methods' => ['POST', 'GET'],
        'callback' => 'handle_livestream_cart',
        'permission_callback' => 'is_user_logged_in'
    ]);

    register_rest_route('tributestream/v1', '/family_poc_profile', [
        'methods' => ['POST', 'GET'],
        'callback' => 'handle_family_poc_profile',
        'permission_callback' => 'is_user_logged_in'
    ]);

// **************************************************************
// ::End of registering rest routes
// **************************************************************
});

// **************************************************************
// ::Start of custom functions, which routes will be calling.
// **************************************************************

// **************************************************************
// ::Start of rough functions
// **************************************************************
// Establish family_poc_profile
function handle_family_poc_profile($request) {
    global $wpdb;
    $params = $request->get_json_params();
    $user_id = $params['user_id'];
    $phone = // pull from tributes
    $created_at = //if not created yet, establish the timestamp.
    $updated_at = //make current timestamp
    $incomplete_cart = // send order json to tributes custom html for future rendering,
// write to database here??
//post means write update the keyvaue pares sent via the request, get means send the key value pairs as a resposne 
}

// handle livestream cart from calculator page
function handle_livestream_cart($request) {
    global $wpdb;
    $params = $request->get_json_params();
    $user_id = $params['user_id'];
    $cart_items = $params['cart_items'];
    //write the the database here

}

// **************************************************************
// ::End rough functions
// **************************************************************
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
