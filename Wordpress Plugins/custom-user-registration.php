<?php
/*
Plugin Name: Custom User Registration
The way this plugin work, is it exposes routes that lets us 
write to the database using $wpdb. 

The custom-user-registration file name is a misnomer. The file 
below is strucuted as follows:

Custom User Registration Functions 
Custom Admin CRUD Functions
Then, Custom user CruD Functions
*/
global $wpdb;
add_action('rest_api_init', function() {
#************************************
#remove_action('rest_api_init', 'rest_send_cors_headers');
#Start 12-30-24 Edit
#Custom User Registration Functions 
#************************************
#Insert Here:
#************************************
// Register user registration route
    register_rest_route('tributestream/v1', '/user-login', [
        'methods' => 'POST',
        'callback' => 'handle_user_login',
        'permission_callback' => '__return_true'
    ]);

    register_rest_route('custom-user-registration/v1', '/register', [
        'methods' => ['POST', 'GET'],
        'callback' => 'handle_tributestream_registration',
        'permission_callback' => '__return_true'
    ]);
// Get user role
    register_rest_route('custom/v1', '/user-role', array(
        'methods' => 'GET',
        'callback' => 'custom_get_user_role',
        'permission_callback' => 'is_user_logged_in'
    ));

//******************************  
//Custom Admin CRUD Functions
//******************************  
// CRUD Tribute Events

    register_rest_route('tributestream/v1', '/tribute/(?P<tribute_id>\d+)/events', [
        'methods' => 'GET',
        'callback' => 'get_tribute_events',
        'permission_callback' => '__return_true'
    ]);

    register_rest_route('tributestream/v1', '/tribute-event', [
        'methods' => 'POST',
        'callback' => 'create_tribute_event',
        'permission_callback' => 'is_user_logged_in'
    ]);
     
    register_rest_route('custom/v1', '/slugs', array(
        'methods' => 'GET',
        'callback' => 'get_all_slugs',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('tributestream/v1', '/tribute-event/(?P<id>\d+)', [
        'methods' => 'PUT',
        'callback' => 'update_tribute_event',
        'permission_callback' => 'is_user_logged_in'
    ]);
    register_rest_route('tributestream/v1', '/tribute-event/(?P<id>\d+)', [
        'methods' => 'DELETE',
        'callback' => 'delete_tribute_event',
        'permission_callback' => 'is_user_logged_in'
    ]);
    register_rest_route('tributestream/v1', '/tribute', [
        'methods' => 'GET',
        'callback' => 'get_all_tributes',
        'permission_callback' => 'is_user_logged_in',
    ]);
    register_rest_route('tributestream/v1', '/tribute', [
        'methods' => 'POST',
        'callback' => 'create_tribute',
        'permission_callback' => 'is_user_logged_in',
    ]);
    register_rest_route('tributestream/v1', '/tribute/custom-html/(?P<tribute_id>\d+)', [
        'methods' => 'PUT',
        'callback' => 'update_tribute_custom_html',
        'permission_callback' => 'is_user_logged_in'
    ]);

// Get all slugs (for search?)

});

function handle_user_login(WP_REST_Request $request) {
         $params = $request->get_json_params();
         $username = sanitize_user($params['username']);
         $password = $params['password'];
    
         // Make request to JWT plugin endpoint
         $jwt_response = wp_remote_post(get_site_url() . '/wp-json/jwt-auth/v1/token', [
             'body' => [
                 'username' => $username,
                 'password' => $password
             ]
         ]);
    
         if (is_wp_error($jwt_response)) {
             return new WP_Error('jwt_auth_failed', 'Authentication failed', ['status' => 401]);
         }
    
         $response_body = json_decode(wp_remote_retrieve_body($jwt_response), true);
    
         // Return the JWT token and user data
         return new WP_REST_Response([
             'token' => $response_body['token'],
             'user_email' => $response_body['user_email'],
             'user_nicename' => $response_body['user_nicename'],
             'user_display_name' => $response_body['user_display_name']
         ], 200);
     }
     
function get_tribute_events($request) {
    global $wpdb;
    $tribute_id = $request->get_param('tribute_id');

    $events = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM wpa2_tribute_events WHERE tribute_id = %d ORDER BY event_date ASC",
        $tribute_id
    ));

    return new WP_REST_Response($events, 200);
}

function get_all_slugs() {
    global $wpdb;
    $results = $wpdb->get_results("SELECT post_name FROM wp_posts WHERE post_status = 'publish' AND post_type = 'page'");
    $slugs = array_map(function($row) {
        return $row->post_name;
    }, $results);
    return $slugs;
}

function get_all_tributes() {
    global $wpdb;
    
    $tributes = $wpdb->get_results(
        "SELECT id, user_id, loved_one_name, slug, created_at, updated_at, custom_html, phone_number, number_of_streams 
         FROM wpa2_tributes 
         ORDER BY created_at DESC",
        ARRAY_A
    );

    if ($wpdb->last_error) {
        return new WP_REST_Response([
            'error' => true,
            'message' => 'Database error: ' . $wpdb->last_error
        ], 500);
    }

    return new WP_REST_Response($tributes, 200);
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

// Callback function to fetch the user's role
function custom_get_user_role(WP_REST_Request $request) {
    $user = wp_get_current_user();

    if (!$user || empty($user->roles)) {
        return new WP_Error('no_role', __('User has no role or is not logged in'), array('status' => 403));
    }

    return array(
        'roles' => $user->roles
    );
}


function create_tribute_event($request) {
    global $wpdb;
    $params = $request->get_json_params();

    $result = $wpdb->insert(
        'wpa2_tribute_events',
        array(
            'tribute_id' => $params['tribute_id'],
            'event_name' => sanitize_text_field($params['event_name']),
            'event_date' => $params['event_date'], // Assume date validation handled elsewhere
            'event_location' => sanitize_text_field($params['event_location']),
            'event_description' => sanitize_textarea_field($params['event_description'])
        ),
        array('%d', '%s', '%s', '%s', '%s')
    );

    if ($result === false) {
        return new WP_Error('db_insert_error', 'Failed to create event', array('status' => 500));
    }

    return new WP_REST_Response(['message' => 'Event created', 'id' => $wpdb->insert_id], 200);
}





function update_tribute_event($request) {
    global $wpdb;
    $event_id = $request->get_param('id');
    $params = $request->get_json_params();

    $wpdb->update(
        'wpa2_tribute_events',
        array(
            'event_name' => sanitize_text_field($params['event_name']),
            'event_date' => $params['event_date'],
            'event_location' => sanitize_text_field($params['event_location']),
            'event_description' => sanitize_textarea_field($params['event_description'])
        ),
        array('id' => $event_id)
    );

    return new WP_REST_Response(['message' => 'Event updated'], 200);
}


function delete_tribute_event($request) {
    global $wpdb;
    $event_id = $request->get_param('id');

    $wpdb->delete('wpa2_tribute_events', ['id' => $event_id]);

    return new WP_REST_Response(['message' => 'Event deleted'], 200);
}



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


 
 
//     // Get WPA2 Tributes endpoint
//     register_rest_route('custom/v1', '/wpa2_tributes', array(
//         'methods' => 'GET',
//         'callback' => 'get_wpa2_tributes',
//         'permission_callback' => 'is_user_logged_in'
//     ));

//     // Get Streams endpoint
//     register_rest_route('custom/v1', '/streams', array(
//         'methods' => 'GET',
//         'callback' => 'get_streams',
//         'permission_callback' => 'custom_jwt_authenticate'
//     ));

//     // Update Tribute Custom HTML endpoint
//     register_rest_route('custom/v1', '/wpa2_tributes/(?P<id>\d+)', array(
//         'methods' => 'PATCH',
//         'callback' => 'update_tribute_custom_html',
//         'permission_callback' => 'custom_jwt_authenticate'
//     ));

//     register_rest_route('registration_email/v1', '/send-email', array(
//         'methods' => 'POST',
//         'callback' => 'custom_send_registration_email',
//         'permission_callback' => '__return_true',
//         'args' => array(
//             'email' => array(
//                 'required' => true,
//                 'type' => 'string'
//             ),
//             'subject' => array(
//                 'required' => true,
//                 'type' => 'string'
//             ),
//             'message' => array(
//                 'required' => true,
//                 'type' => 'string'
//             )
//         )
//     ));
    
//  register_rest_route('tributestream/v1', '/tribute/(?P<slug>[a-zA-Z0-9-]+)', array(
//         'methods' => 'GET',
//         'callback' => 'get_tribute',
//         'args' => array(
//             'slug' => array(
//                 'validate_callback' => function($param, $request, $key) {
//                     return is_string($param);
//                 }
//             ),
//         ),
//         'permission_callback' => '__return_true', // Adjust this based on your security requirements
//     ));

//     register_rest_route('tributestream/v1', '/tribute/(?P<id>\d+)', array(
//         'methods' => 'PUT',
//         'callback' => 'update_tribute',
//         'permission_callback' => 'is_user_logged_in'
//     ));

//     register_rest_route('tributestream/v1', '/tribute/(?P<id>\d+)', array(
//         'methods' => 'DELETE',
//         'callback' => 'delete_tribute',
//         'permission_callback' => 'is_user_logged_in'
//     ));

//     // Register route for adding a slug
//     register_rest_route('tributestream/v1', '/add-slug', [ //MAKE SURE UPDATE AND ADD SLUG WORK WITH THE MYSQL DB
//         'methods' => 'POST',
//         'callback' => 'add_slug_to_table',
//         'permission_callback' => '__return_true', // Adjust for security in production
//     ]);



//     // Register user registration route
//     register_rest_route('custom-user-registration/v1', '/register', [
//         'methods' => ['POST', 'GET'],
//         'callback' => 'handle_tributestream_registration',
//         'permission_callback' => '__return_true'
//     ]);

//     // Test endpoint for debugging
//     register_rest_route('custom-user-registration/v1', '/test', [
//         'methods' => 'GET',
//         'callback' => function() {
//             return new WP_REST_Response('Endpoint is working!', 200);
//         },
//         'permission_callback' => '__return_true'
//     ]);
    
//         register_rest_route('tributestream/v1', '/tribute/(?P<tribute_id>\d+)/videos', [
//         'methods' => 'GET',
//         'callback' => 'get_tribute_videos',
//         'permission_callback' => 'is_user_logged_in'
//     ]);
    
//     register_rest_route('tributestream/v1', '/tribute/video', [
//         'methods' => 'POST',
//         'callback' => 'create_tribute_video',
//         'permission_callback' => 'is_user_logged_in'
//     ]);
    
//     register_rest_route('tributestream/v1', '/tribute/video/(?P<id>\d+)', [
//         'methods' => 'PUT',
//         'callback' => 'update_tribute_video',
//         'permission_callback' => 'is_user_logged_in'
//     ]);
    
//     register_rest_route('tributestream/v1', '/tribute/video/(?P<id>\d+)', [
//         'methods' => 'DELETE',
//         'callback' => 'delete_tribute_video',
//         'permission_callback' => 'is_user_logged_in'
//     ]);
//     // Register the nonce endpoint
//     register_rest_route('tributestream/v1', '/get-nonce', [
//         'methods' => 'GET',
//         'callback' => 'get_custom_nonce',
//         'permission_callback' => '__return_true'
//     ]);
    
    

   
//     register_rest_route('custom/v1', '/login', array(
//     'methods' => 'POST',
//     'callback' => 'custom_login_user',
//     'permission_callback' => '__return_true', // Allow unauthenticated access
//     ));

// });

// function custom_login_user(WP_REST_Request $request) {
//     $params = $request->get_json_params();
//     $username = sanitize_user($params['username']);
//     $password = $params['password'];

//     // Make request to JWT plugin endpoint
//     $jwt_response = wp_remote_post(get_site_url() . '/wp-json/jwt-auth/v1/token', [
//         'body' => [
//             'username' => $username,
//             'password' => $password
//         ]
//     ]);

//     if (is_wp_error($jwt_response)) {
//         return new WP_Error('jwt_auth_failed', 'Authentication failed', ['status' => 401]);
//     }

//     $response_body = json_decode(wp_remote_retrieve_body($jwt_response), true);

//     // Return the JWT token and user data
//     return new WP_REST_Response([
//         'token' => $response_body['token'],
//         'user_email' => $response_body['user_email'],
//         'user_nicename' => $response_body['user_nicename'],
//         'user_display_name' => $response_body['user_display_name']
//     ], 200);
// }
// 





#function update_tribute_custom_html($request) {
 #   global $wpdb;
 #   
 #   $tribute_id = $request->get_param('tribute_id');
 #   $params = $request->get_json_params();
 #   $custom_html = $params['custom_html'];
 #   
 #   $result = $wpdb->update(
 #       'wpa2_tributes',
 #       array('id' => $tribute_id),
  #      array('%s'),
 #       array('%d')
#    );
    
   # if ($result === false) {
   #     return new WP_REST_Response([
  #       ], 500);
#    }
    
   # return new WP_REST_Response([
  #      'message' => 'Custom HTML updated successfully',
 #       'tribute_id' => $tribute_id
#    ], 200);
#}


// function custom_send_registration_email($request) {
//     // Get parameters from request body
//     $params = $request->get_params();
    
//     $email = $params['email'];
//     $subject = $params['subject'];
//     $message = $params['message'];
//     $headers = array('Content-Type: text/plain; charset=UTF-8');

//     $sent = wp_mail($email, $subject, $message, $headers);
    
//     if ($sent) {
//         return new WP_REST_Response(['message' => 'Email sent successfully'], 200);
//     } else {
//         return new WP_REST_Response(['message' => 'Failed to send email'], 500);
//     }
// }

// // Function to add a slug to the custom table DOUBLE CHECK THIS
// function add_slug_to_table($request) {
//     global $wpdb;
//     $table_name = $wpdb->prefix . 'array_data';
//     $slug = sanitize_text_field($request->get_param('slug'));

//     // Check if slug exists
//     $exists = $wpdb->get_var($wpdb->prepare(
//         "SELECT COUNT(*) FROM $table_name WHERE array_value = %s",
//         $slug
//     ));

//     if ($exists) {
//         return new WP_REST_Response(['message' => 'Already added'], 200);
//     }

//     // Insert the slug
//     $wpdb->insert($table_name, [
//         'post_id' => 0, // Adjust as needed
//         'array_key' => 'slug_key', // Adjust if you want a specific key
//         'array_value' => $slug,
//     ]);

//     return new WP_REST_Response(['message' => 'Added'], 200);
// }




 

// // added 11.15.24  and beyond: 

// function create_tribute_video($request) {
//     global $wpdb;
//     $params = $request->get_json_params();
    
//     $result = $wpdb->insert(
//         'wpa2_tribute_videos',
//         array(
//             'tribute_id' => $params['tribute_id'],
//             'embed_code' => $params['embed_code'],
//             'position' => $params['position'],
//             'title' => $params['title'],
//             'description' => $params['description']
//         ),
//         array('%d', '%s', '%d', '%s', '%s')
//     );
    
//     return new WP_REST_Response(array(
//         'message' => 'Video created successfully',
//         'id' => $wpdb->insert_id
//     ), 200);
// }

// // Get videos for a tribute
// function get_tribute_videos($request) {
//     global $wpdb;
//     $tribute_id = $request->get_param('tribute_id');
    
//     $videos = $wpdb->get_results($wpdb->prepare(
//         "SELECT * FROM wpa2_tribute_videos WHERE tribute_id = %d ORDER BY position ASC",
//         $tribute_id
//     ));
    
//     return new WP_REST_Response($videos, 200);
// }

// // Update video
// function update_tribute_video($request) {
//     global $wpdb;
//     $video_id = $request->get_param('id');
//     $params = $request->get_json_params();
    
//     $wpdb->update(
//         'wpa2_tribute_videos',
//         array(
//             'embed_code' => $params['embed_code'],
//             'position' => $params['position'],
//             'title' => $params['title'],
//             'description' => $params['description']
//         ),
//         array('id' => $video_id)
//     );
    
//     return new WP_REST_Response(['message' => 'Video updated'], 200);
// }

// // Delete video
// function delete_tribute_video($request) {
//     global $wpdb;
//     $video_id = $request->get_param('id');
    
//     $wpdb->delete('wpa2_tribute_videos', ['id' => $video_id]);
//     return new WP_REST_Response(['message' => 'Video deleted'], 200);
// }
 
//  function get_custom_nonce() {
//     return new WP_REST_Response([
//         'nonce' => wp_create_nonce('wp_rest')
//     ], 200);
// }

 

// #new custom stuff as of 12 20 2024

// function get_wpa2_tributes() {
//     global $wpdb;
//     $table_name = $wpdb->prefix . 'tributes';
    
//     error_log("Starting get_wpa2_tributes function");
//     error_log("Table name: " . $table_name);
    
//     $tributes = $wpdb->get_results(
//         $wpdb->prepare("SELECT * FROM {$table_name}")
//     );
    
//     error_log("Query executed. Last error: " . $wpdb->last_error);
//     error_log("Results: " . print_r($tributes, true));
    
//     if ($wpdb->last_error) {
//         error_log("Database error: " . $wpdb->last_error);
//         return new WP_REST_Response([
//             'error' => true,
//             'message' => 'Database error',
//             'details' => $wpdb->last_error
//         ], 500);
//     }
    
//     return new WP_REST_Response($tributes, 200);
// }



// function get_streams() {
//     global $wpdb;
//     $streams = $wpdb->get_results(
//         "SELECT * FROM wp_wpa2_streams",
//         ARRAY_A
//     );
//     return new WP_REST_Response($streams, 200);
// }

// function update_tribute_custom_html($request) {
//     global $wpdb;
//     $tribute_id = $request['id'];
//     $custom_html = $request->get_param('custom_html');
    
//     $result = $wpdb->update(
//         'wp_wpa2_tributes',
//         array('custom_html' => $custom_html),
//         array('id' => $tribute_id)
//     );
    
//     return new WP_REST_Response(['success' => true], 200);
// }
// #end of custom stuff 
