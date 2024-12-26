/*****************************************************************************************
 * +page.server.ts
 *
 * This file implements an "actions" object for a SvelteKit form post on the login page.
 * It takes a username and password from the form, fetches a JWT token from WordPress,
 * and stores it in an HTTP-only cookie. If there's an error, it returns a 400 response.
 * On success, it redirects to '/dashboard'.
 *****************************************************************************************/
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { BASE_WORDPRESS_API } from '$env/static/private';

export const load: PageServerLoad = async ({ cookies }) =>  {
  const token = await cookies.get('jwt');
  if (token) {
    throw redirect(302, '/dashboard');
  }
  return { user: null };
}


export const actions = {
  /**
   * login: The default form action triggered by <form method="post">.
   */
  login: async ({ cookies, request }) => {
    console.log('Login action triggered.');
    
    try {
      // 1. Gather form data
      const data = await request.formData();
      const username = data.get('username');
      const password = data.get('password');
      
      console.log('Form data retrieved:', { username, password });

      if (!username || !password) {
        console.error('Validation error: Username or password is missing.');
        return fail(400, {
          error: true,
          message: 'Username and password are required.'
        });
      }

      // 2. Make a POST request to WordPress' JWT token endpoint
      console.log('Sending POST request to WordPress API...');
      const response = await fetch(`${BASE_WORDPRESS_API}/jwt-auth/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      // Log response status for debugging
      console.log('Response status:', response.status);

      // 3. Parse JSON response from WP
      const result = await response.json();
      console.log('Response from WordPress API:', result);
    // 6. On success, redirect the user to the dashboard
   
      // 4. If the request failed, return a 400 with the error message
      if (!response.ok) {
        console.error('WordPress API error:', result?.message || 'Unknown error');
        return fail(400, {
          error: true,
          message: result?.message || 'Unknown error during login'
        });
      }

      /**
       * 5. Store the JWT token in a secure, HTTP-only cookie
       */
      console.log('Storing JWT token in HTTP-only cookie...');
      cookies.set('jwt', result.token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      });

      console.log('JWT token stored successfully.');

  

    } catch (error) {
      console.error('An unexpected error occurred during the login process:', error);
      return fail(500, {
        error: true,
        message: 'An unexpected error occurred. Please try again later.'
      });
    }
 
  }
  
} satisfies Actions;
