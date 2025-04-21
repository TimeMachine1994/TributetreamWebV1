import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { loginUser } from '$lib/api/auth';

/** @type {import('./$types').PageServerLoad} */
export function load({ url, locals }) {
  // If already logged in, redirect
  if (locals.user) {
    throw redirect(302, '/');
  }
  
  return {
    redirectTo: url.searchParams.get('redirectTo') || '/'
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const identifier = formData.get('identifier');
    const password = formData.get('password');
    
    if (!identifier || !password) {
      return fail(400, { 
        error: 'Email/username and password are required' 
      });
    }
    
    try {
      // Attempt login with Strapi
      const { jwt, user } = await loginUser({ 
        identifier: identifier.toString(), 
        password: password.toString() 
      });
      
      // Set auth cookie
      cookies.set('auth_token', jwt, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: !dev, // Use secure cookies in production
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return fail(401, { 
        error: 'Invalid credentials',
        identifier: identifier.toString()
      });
    }
  }
};
