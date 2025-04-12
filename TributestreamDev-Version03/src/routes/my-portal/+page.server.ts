import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { loginSchema, portalSubscriptionSchema } from '$lib/utils/form-schemas';
import { sendEmail } from '$lib/utils/email-service';
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
      
      // Set authentication cookies
      setAuthCookies(cookies, data);
      
      // Return success message
      return message(loginForm, 'Login successful', {
        status: 'success'
      });
    } catch (error) {
      console.error('Login error:', error);
      return message(loginForm, 'An unexpected error occurred', {
        status: 'error'
      });
    }
  },
  
  // Password reset action
  resetPassword: async ({ request }) => {
    // Validate the form data
    const resetForm = await superValidate(request, zod(portalSubscriptionSchema));
    
    // Check if form is valid
    if (!resetForm.valid) {
      return fail(400, { resetForm });
    }
    
    try {
      // Prepare email data for password reset
      const emailOptions = {
        to: resetForm.data.email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>We received a request to reset your password. Please click the link below to reset your password:</p>
            <p><a href="https://tributestream.com/reset-password?token=PLACEHOLDER_TOKEN" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>If you did not request a password reset, please ignore this email.</p>
          </div>
        `,
        text: `Password Reset Request\n\nWe received a request to reset your password. Please visit the following link to reset your password:\n\nhttps://tributestream.com/reset-password?token=PLACEHOLDER_TOKEN\n\nIf you did not request a password reset, please ignore this email.`
      };
      
      // Send password reset email
      const emailSuccess = await sendEmail(emailOptions);
      
      if (!emailSuccess) {
        return message(resetForm, 'Failed to send password reset email. Please try again later.', {
          status: 'error'
        });
      }
      
      // Return success message
      return message(resetForm, 'Password reset instructions have been sent to your email.', {
        status: 'success'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      return message(resetForm, 'An unexpected error occurred', {
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