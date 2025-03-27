import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { portalSubscriptionSchema, loginSchema } from '$lib/utils/form-schemas';
import { sendEmail } from '$lib/utils/email-service';
import { loginUser } from '$lib/utils/auth-helpers';

export const load: PageServerLoad = async ({ locals, url }) => {
  // Check if user is already authenticated
  if (locals.authenticated && locals.user) {
    // Redirect to dashboard if already logged in
    throw redirect(302, '/my-portal/dashboard');
  }
  
  // Initialize both forms with default values
  const subscriptionForm = await superValidate(zod(portalSubscriptionSchema));
  const loginForm = await superValidate(zod(loginSchema));
  
  // Get error message from query parameters (if any)
  const errorMessage = url.searchParams.get('error');
  
  return {
    subscriptionForm,
    loginForm,
    errorMessage
  };
};

export const actions = {
  // Action for portal subscription
  subscribe: async ({ request }) => {
    console.log('🚀 Starting portal subscription form action.');
    
    try {
      // Validate the form data using superValidate
      console.log('📝 Parsing and validating form data...');
      const form = await superValidate(request, zod(portalSubscriptionSchema));
      
      // Check if form is valid
      if (!form.valid) {
        console.error('❌ Validation errors:', form.errors);
        return fail(400, { subscriptionForm: form });
      }
      
      // Prepare email data for admin notification
      console.log('📧 Preparing admin notification email...');
      const adminEmailOptions = {
        to: 'contact@tributestream.com', // Change to the admin email
        subject: 'New Portal Notification Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
            <h2 style="color: #333;">New Portal Notification Request</h2>
            <p>A user has requested to be notified when the portal becomes available.</p>
            <p><strong>Email:</strong> ${form.data.email}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `,
        text: `New Portal Notification Request\n\nA user has requested to be notified when the portal becomes available.\n\nEmail: ${form.data.email}\nDate: ${new Date().toLocaleString()}`
      };
      
      // Send admin notification email
      console.log('📤 Sending admin notification...');
      const emailSuccess = await sendEmail(adminEmailOptions);
      
      if (!emailSuccess) {
        console.error('❌ Failed to send admin notification');
        return message(form, 'Failed to submit your request. Please try again later.', {
          status: 'error'
        });
      }
      
      console.log('✅ Admin notification sent successfully');
      
      // Return success response with a message
      return message(form, 'Thank you! We\'ll notify you when the portal becomes available.', {
        status: 'success'
      });
      
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      return fail(500, {
        error: true,
        message: 'An unexpected error occurred. Please try again later.',
        subscriptionForm: await superValidate(zod(portalSubscriptionSchema))
      });
    }
  },
  
  // Action for user login
  login: async ({ request, cookies, fetch }) => {
    console.log('🔑 Starting user login action.');
    
    try {
      // Validate the form data using superValidate
      console.log('📝 Parsing and validating login form data...');
      const form = await superValidate(request, zod(loginSchema));
      
      // Check if form is valid
      if (!form.valid) {
        console.error('❌ Validation errors:', form.errors);
        return fail(400, { loginForm: form });
      }
      
      // Log the username being used (for debugging)
      console.log('👤 Attempting login with username:', form.data.username);
      
      // Attempt to log in the user
      console.log('🔒 Attempting user login...');
      console.log('📞 Calling loginUser function from auth-helpers.ts');
      const loginResult = await loginUser(form.data.username, form.data.password, cookies, fetch);
      
      // Log the login result (for debugging)
      console.log('📊 Login result:', JSON.stringify({
        success: loginResult.success,
        message: loginResult.message,
        hasUser: !!loginResult.user
      }));
      
      // Handle login failure
      if (!loginResult.success) {
        console.error('❌ Login failed:', loginResult.message);
        return fail(401, {
          loginForm: form,
          loginError: loginResult.message || 'Invalid username or password.'
        });
      }
      
      // Login successful, redirect to dashboard
      console.log('✅ Login successful, redirecting to dashboard...');
      throw redirect(302, '/my-portal/dashboard');
      
    } catch (error) {
      // Only handle errors that are not redirects
      if (error.status !== 302) {
        console.error('💥 Unexpected login error:', error);
        return fail(500, {
          error: true,
          message: 'An unexpected error occurred during login. Please try again later.',
          loginForm: await superValidate(zod(loginSchema))
        });
      }
      
      // Re-throw redirect
      throw error;
    }
  }
} satisfies Actions;