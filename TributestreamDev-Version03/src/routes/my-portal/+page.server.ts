import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { accessControlService } from '$lib/services/access-control-service';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { loginSchema, portalSubscriptionSchema } from '$lib/utils/form-schemas';
 import { getUserFromCookie } from '$lib/utils/cookie-auth';
import { setAuthCookies, getUserFromCookies } from '$lib/utils/auth-helpers';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
  // Check if user is already authenticated
  const user = getUserFromCookie(cookies);
  
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
          status: 'error'
        });
      }
      
      // The API endpoint already sets the cookies
      
      // Check if user has admin access using server-side method
      const isAdmin = accessControlService.hasAdminAccessFromCookies(cookies);
      
      // Add debug logging
      console.log('Login successful for user:', data.user_display_name);
      console.log('User ID:', data.user_id);
      console.log('Is admin:', isAdmin);
      
      // Redirect to appropriate dashboard based on user role
      if (isAdmin) {
        console.log('Redirecting to admin dashboard');
        throw redirect(303, '/dashboard/admin');
      } else {
        console.log('Redirecting to regular dashboard');
        throw redirect(303, '/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      return message(loginForm, 'An unexpected error occurred', {
        status: 'error'
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