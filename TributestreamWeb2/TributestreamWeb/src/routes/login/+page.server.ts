import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';
 
export const actions: Actions = {
  login: async ({ request, cookies }) => {
    // Extract form data from request
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    // Ensure form fields are filled out
    if (!username || !password) {
      return fail(400, { error: 'Username and password are required' });
    }

    try {
      // Make a POST request to the WordPress backend for authentication
      const response = await fetch(`https://wp.tributestream.com/wp-json/custom-registration-plugin/v1/user-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      // Check if the response is OK
      if (!response.ok) {
        return fail(401, { error: 'Invalid credentials' });
      }

      // Parse the response
      const result = await response.json();
      const token = result.token;

      // Save JWT to cookies
      cookies.set('jwt', token, {
        path: '/',
        httpOnly: true,  // Prevent JavaScript access to the cookie
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // Protect against CSRF attacks
        maxAge: 60 * 60 * 24  // Set cookie expiry to 1 day
      });

      // Redirect to the admin page after successful login
      throw redirect(303, '/admin');

    } catch (error) {
      console.error('Login error:', error);
      return fail(500, { error: 'Server error. Please try again later.' });
    }
  }
};
