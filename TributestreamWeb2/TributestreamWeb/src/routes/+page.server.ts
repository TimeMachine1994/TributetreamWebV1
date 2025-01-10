import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
/**
 * This `actions` object handles form submissions. The "default" action is
 * invoked when you submit the form without a specific `?/action=foo`.
 */
export const actions = {
    default: async ({ request, fetch, locals, cookies }) => {
        try {
            // -----------------------------------------
            // 1) Extract Form Data
            // -----------------------------------------
            console.log('Extracting form data...');
            const formData = await request.formData();

            // Fields from the form. Adjust keys as needed to match <input name="...">
            const username = formData.get('userName');
            const email = formData.get('userEmail');

            console.log('Extracted username:', username);
            console.log('Extracted email:', email);

            // Validate presence
            if (!username || !email) {
                console.error('Missing username or email');
                return {
                    success: false,
                    message: 'Username and email are required.'
                };
            }

            // -----------------------------------------
            // 2) Generate Random Password
            // -----------------------------------------
            console.log('Generating random password...');
            const length = 12;
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
            let password = '';

            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length);
                password += charset[randomIndex];
            }

            console.log('Generated password:', password);

            // -----------------------------------------
            // 3) Register the User (via /api/register)
            // -----------------------------------------
            console.log('Sending data to /api/register...');
            const registerResponse = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            if (!registerResponse.ok) {
                console.error('Register API error:', registerResponse.statusText);
                const errorDetails = await registerResponse.text();
                console.error('Register API error details:', errorDetails);
                return {
                    success: false,
                    message: 'Failed to register user.'
                };
            }

            const registerResult = await registerResponse.json();
            console.log('Register API response:', registerResult);

         

            // Grab user_id from registration success
            const user_id = registerResult.user_id;
            console.log('Registered user ID:', user_id);

            // -----------------------------------------
            // 4) Immediately Log the User In (via /api/auth)
            // -----------------------------------------
            console.log('Logging in the newly registered user with /api/auth...');
            const authResponse = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Use the same username and password
                body: JSON.stringify({ username, password })
            });

            if (!authResponse.ok) {
                console.error('Auth API error:', authResponse.statusText);
                const errorDetails = await authResponse.text();
                console.error('Auth API error details:', errorDetails);
                return {
                    success: false,
                    message: 'Login failed after registration.'
                };
            }

            const authResult = await authResponse.json();
            console.log('Auth API response:', authResult);

            // The typical WordPress JWT response includes a token and user info
            if (!authResult.token) {
                console.error('No token returned from Auth API:', authResult);
                return {
                    success: false,
                    message: 'Login failed: no token received.'
                };
            }
            // After authResult is received
            cookies.set('jwt', authResult.token, {
                httpOnly: true, // Prevents client-side access
                path: '/',       // Makes the cookie accessible site-wide
                secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
                maxAge: 60 * 60 * 24 * 7 // Expires in 7 days
            });
            // Store user/token in `locals` so it can be accessed in subsequent
            // server-side load functions or the same request lifecycle.
            locals.jwt = authResult.token;
            locals.user = {
                id: user_id,
                username: authResult.user_display_name,
                email: authResult.user_email,
                nicename: authResult.user_nicename
            };

            // WORKING ON MAKING THE USER DATA IS STORED IN A STATE OBJECT
                        });
            
            console.log('JWT token stored in locals.jwt:', locals.jwt);
            console.log('User object stored in locals.user:', locals.user);
            // -----------------------------------------
            // 5) Create a Page for the User
            // -----------------------------------------
           

       
 
  

        } catch (error) {
            console.error('Unexpected error:', error);
            return {
                success: false,
                message: 'An unexpected error occurred.'
            };
        }

        throw redirect(303, '/success');
    }
} satisfies Actions;
