// src/routes/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { setAuthCookie, formatUserData } from '$lib/utils/cookie-auth';
import { authStore } from '$lib/stores/auth-store';

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    const formData = await request.formData();
    const username = formData.get('username')?.toString();
    const password = formData.get('password')?.toString();
    
    if (!username || !password) {
      return fail(400, { 
        error: true, 
        message: 'Username and password are required' 
      });
    }
    
    try {
      // Call WordPress login endpoint
      const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return fail(401, { 
          error: true, 
          message: data.message || 'Invalid credentials' 
        });
      }
      
      // Format user data
      const user = formatUserData(data);
      
      // Set cookies
      setAuthCookie(cookies, data.token, user);
      
      // Initialize auth store
      await authStore.initFromCookies(data.token, user);
      
      // Redirect to dashboard
      throw redirect(303, '/my-portal/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      return fail(500, { 
        error: true, 
        message: 'An error occurred during login' 
      });
    }
  }
};
