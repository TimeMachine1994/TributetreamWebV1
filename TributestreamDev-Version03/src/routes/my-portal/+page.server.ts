import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { accessControlService } from '$lib/services/access-control-service';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { loginSchema, portalSubscriptionSchema } from '$lib/utils/form-schemas';
 import { getUserFromCookie } from '$lib/utils/cookie-auth';
import { setAuthCookies, getUserFromCookies } from '$lib/utils/auth-helpers';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
  console.log('[my-portal] Page server load function called');
  console.log('[my-portal] Available cookies:', Object.keys(cookies.getAll()));
  
  // Check if user is already authenticated
  console.log('[my-portal] Getting user from cookie');
  const user = getUserFromCookie(cookies);
  console.log('[my-portal] User from cookie:', user);
  
  // Initialize the login form
  const loginForm = await superValidate(zod(loginSchema));
  
  // Initialize the password reset form
  const resetForm = await superValidate(zod(portalSubscriptionSchema));
  
  // If user is authenticated, fetch their tributes
  let tributes = [];
  if (user) {
    try {
      const response = await fetch(`/api/tributes?user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        tributes = data.tributes || [];
      }
    } catch (error) {
      console.error('Error fetching tributes:', error);
    }
  }
  
  return { 
    user,
    tributes,
    loginForm,
    resetForm
  };
};

export const actions = {
  // Login action
  login: async ({ request, cookies, fetch }) => {
    // Validate the form data
    const loginForm = await superValidate(request, zod(loginSchema));
    
    // Check if form is valid
    if (!loginForm.valid) {
      return fail(400, { loginForm });
    }
    
    try {
      // Send authentication request to API
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginForm.data.username,
          password: loginForm.data.password
        })
      });
      
      const data = await response.json();
      
      // Handle authentication failure
      if (!response.ok) {
        return message(loginForm, data.message || 'Authentication failed', {
          status: 400
        });
      }
      
      // The API endpoint already sets the cookies
      console.log('[login-action] Login successful, API response:', data);
      
      // Manually set cookies for debugging
      console.log('[login-action] Setting cookies manually');
      try {
        // Set user cookie with proper encoding
        const userData = {
          id: data.user.id,
          name: data.user.name,
          display_name: data.user.display_name,
          email: data.user.email,
          roles: data.user.roles || [],
          capabilities: data.user.capabilities || {}
        };
        console.log('[login-action] User data to store in cookie:', userData);
        
        cookies.set('user', JSON.stringify(userData), {
          path: '/',
          httpOnly: false,
          sameSite: 'strict',
          secure: import.meta.env.PROD,
          maxAge: 60 * 60 * 24 * 7 // 1 week
        });
        
        console.log('[login-action] Cookies set successfully');
      } catch (error) {
        console.error('[login-action] Error setting cookies:', error);
      }
      
      // Check if user has admin access using server-side method
      console.log('[login-action] Checking admin access');
      // Force a re-check after setting cookies manually
      const isAdmin = data.user.id === 1 ||
                     (Array.isArray(data.user.roles) && data.user.roles.includes('administrator')) ||
                     accessControlService.hasAdminAccessFromCookies(cookies);
      
      console.log('[login-action] Admin check - Direct ID check:', data.user.id === 1);
      console.log('[login-action] Admin check - Roles check:', Array.isArray(data.user.roles) && data.user.roles.includes('administrator'));
      console.log('[login-action] Admin check - Cookie check:', accessControlService.hasAdminAccessFromCookies(cookies));
      
      // Add debug logging
      console.log('[login-action] Login successful for user:', data.user.display_name);
      console.log('[login-action] User ID:', data.user.id);
      console.log('[login-action] Is admin:', isAdmin);
      
      // Redirect to appropriate dashboard based on user role
      if (isAdmin) {
        console.log('[login-action] Redirecting to admin dashboard');
        throw redirect(303, '/my-portal/admin-dashboard');
      } else {
        console.log('[login-action] Redirecting to regular dashboard');
        throw redirect(303, '/my-portal');
      }
    } catch (error) {
      console.error('Login error:', error);
      return message(loginForm, 'An unexpected error occurred', {
        status: 500
      });
    }
  },
  
    
  
  // Logout action
  logout: async ({ cookies }) => {
    // Clear authentication cookies
    cookies.delete('jwt_token', { path: '/' });
    cookies.delete('user', { path: '/' });
    
    // Redirect to the login page
    throw redirect(302, '/my-portal');
  }
} satisfies Actions;