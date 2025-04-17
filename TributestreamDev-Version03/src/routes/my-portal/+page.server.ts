import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { loginSchema, portalSubscriptionSchema } from '$lib/utils/form-schemas';
 
import { setAuthCookies, getUserFromCookies } from '$lib/utils/auth-helpers';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
  // Check if user is already authenticated
  const user = getUserFromCookies(cookies);
  
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
      console.log('🔄 [Page Server] Sending authentication request to API');
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
      
      console.log('🛬 [Page Server] Received response from API:', response.status);
      const data = await response.json();
      console.log('📝 [Page Server] Parsed response data:', JSON.stringify(data).substring(0, 200) + '...');
      
      // Handle authentication failure
      if (!response.ok) {
        return message(loginForm, data.message || 'Authentication failed');
      }
      
      console.log('🔑 [Page Server] Setting authentication cookies');
      // Set authentication cookies
      setAuthCookies(cookies, data);
      console.log('✅ [Page Server] Authentication cookies set');
      
      // Check if user is an administrator
      const user = getUserFromCookies(cookies);
      console.log('👤 [Page Server] User from cookies:', user ? JSON.stringify(user).substring(0, 200) + '...' : 'null');
      console.log('🔑 [Page Server] User roles:', user?.roles);
      console.log('🔑 [Page Server] User capabilities:', user?.capabilities);
      console.log('🔑 [Page Server] Username:', user?.name);
      
      // Check for admin role, capabilities, or specific admin username
      const isAdmin = user && (
        (user.roles && user.roles.includes('administrator')) ||
        (user.capabilities && user.capabilities.manage_options) ||
        // Temporary solution: Allow specific usernames to access admin dashboard
        (user.name === 'admints' || user.display_name === 'admints') // Check both name and display_name
      );
      console.log('🔍 [Page Server] Admin check result:', isAdmin);
      
      if (isAdmin) {
        // Redirect administrators to the dashboard
        console.log('🚀 [Page Server] Redirecting to dashboard');
        // Don't wrap redirect in try/catch - it's not an error but a control flow mechanism
        throw redirect(302, '/my-portal/dashboard');
      }
      
      // Return success message for regular users
      return message(loginForm, 'Login successful');
    } catch (error) {
      // If this is a redirect response, just pass it through
      if (error instanceof Response || (typeof error === 'object' && error !== null && 'status' in error)) {
        throw error;
      }
      
      console.error('Login error:', error);
      return message(loginForm, 'An unexpected error occurred');
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