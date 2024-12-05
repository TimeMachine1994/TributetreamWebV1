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
