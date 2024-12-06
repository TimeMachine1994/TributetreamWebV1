// **************************************************************
// ::Start of describing our network using handlers
// **************************************************************
// A request handler is responsible for intercepting a request 
// and handling its response, 
// **************************************************************

 import { http, HttpResponse } from 'msw'
 
const BASE_WORDPRESS_API = 'http://localhost/wp-json';
const MAIN_URL = 'http://localhost';
// **************************************************************
// ::Start the handlers array
// **************************************************************
// You can describe different APIs, like REST or GraphQL,
// including at the same time in the same handlers array. 
// **************************************************************
export const handlers = [


    //Intercept POST that would normally register the user.

    http.post(
        `${BASE_WORDPRESS_API}/tributestream/v1/register`,
        async ({ request }) => {
            const userData = await request.json()
            
            // Log registration attempt
            console.log('Registration attempt with:', userData)
            
            return HttpResponse.json({
                user_id: '12345',
                message: 'User registered successfully'
            }, { status: 201 })
        }
    ),
    
    http.get(
        `${BASE_WORDPRESS_API}/tributestream/v1/tribute/:userId`,
        async ({ params }) => {
            const { slug } = params;
            console.log('Fetching tribute for slug:', slug);
            
            // Return the tribute data
            return HttpResponse.json({
                slug: slug,
                loved_one_name: "Test Name",
                // Add other tribute data fields here
            });
        }
    ),
    http.get(
        `${BASE_WORDPRESS_API}/tributestream/v1/tribute/:slug`,
        async ({ params }) => {
            const { slug } = params;
            console.log('Fetching tribute for slug:', slug);
            
            // Return the tribute data
            return HttpResponse.json({
                slug: slug,
                loved_one_name: "Test Name",
                // Add other tribute data fields here
            });
        }
    ),
    
    //Intercept POST that would normally create the tribute page.
    http.post(
        `${BASE_WORDPRESS_API}/tributestream/v1/tribute`, 
        async ({ request }) => {
            const requestData = await request.json()
            console.log('User ID:', requestData.user_id)
            console.log('Loved One Name:', requestData.loved_one_name)
            console.log('Slug:', requestData.slug)
            
            return HttpResponse.json(requestData)
    }),

    // JWT Token Generation
    http.post(`${BASE_WORDPRESS_API}/jwt-auth/v1/token`, async ({ request }) => {
        const credentials = await request.json()
        
        if (credentials.username === 'admin' && credentials.password === 'password') {
            return HttpResponse.json({
                token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.example.token',
                user_display_name: 'admin',
                user_email: 'admin@localhost.dev',
                user_nicename: 'admin'
            })
        }

        return HttpResponse.json({
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.example.token',
            user_display_name: 'admin',
            user_email: 'admin@localhost.dev',
            user_nicename: 'admin',
        }, )
    }),

    // JWT Token Validation
    http.post(`${BASE_WORDPRESS_API}/jwt-auth/v1/token/validate`, async ({ request }) => {
        const authHeader = request.headers.get('Authorization')
        
        if (authHeader?.startsWith('Bearer ')) {
            return HttpResponse.json({
                code: 'jwt_auth_valid_token',
                data: { status: 200 }
            })
        }

        return HttpResponse.json({



            code: 'jwt_auth_invalid_token',
            message: 'Signature verification failed',
            data: { status: 403 }
        }, )
    }),

// intercept GET reqeusts to the Wordpress API
    http.get(
        `${BASE_WORDPRESS_API}/wp/v2/users/me`, async ({ request }) => {
        const authHeader = request.headers.get('Authorization')

        if (authHeader?.startsWith('Bearer ')) {
            return HttpResponse.json({
                "id": 1,
                "username": "admin",
                "name": "Admin User",
                "first_name": "Admin",
                "last_name": "User",
                "email": "admin@example.com",
                "url": "",
                "description": "",
                "link": "https://yourwebsite.com/author/admin",
                "slug": "admin",
                "roles": ["administrator"],
            })
        }
    }
),

    // handle livestream cart update between pages 4 and 5. 
    http.post(
        `${BASE_WORDPRESS_API}/tributestream/v1/saveCart`, async ({ request }) => {
        const cartData = await request.json()
            console.log('Cart Data:', cartData)

            return HttpResponse.json({
                cart_id: '12345',
                message: 'Cart updated successfully'
            }, { status: 201 })
        } 
    ),
    //we will add a GET here later to load previous carts from the database if they have been accessed before. 

    http.get(
        `${BASE_WORDPRESS_API}/tributestream/v1/family_poc_profile`, async ({ request }) => {
            //return json data from database via profile_id in family_poc_profiles table
            return HttpResponse.json({
                id: '1',
                phone: '1234567890',
                address: '123 Main St',
                created_at: '2023-01-01 00:00:00',
                updated_at: '2023-01-01 00:00:00',
                incomplete_cart: '0',
            })
        }
    ),

    http.post(
        `${BASE_WORDPRESS_API}/tributestream/v1/family_poc_profile`, async ({ request }) => {
            //return json data from database via profile_id in family_poc_profiles table
            return HttpResponse.json({
                "updateStatus": "success",
            })
        }
    ),

//     http.get(
//         `${MAIN_URL}/src/routes/celebration-of-life-for-:slug/+page.js`,
//         async ({ params }) => {
//             const { slug } = params
            
//             return HttpResponse.json({
//                 props: {
//                     slug: slug,
//                     pageTitle: `Celebration of Life for ${slug}`,
//                     // Add any other data you want to pass to the page
//                 }
//             })
//         }
//     )
    

 ]
