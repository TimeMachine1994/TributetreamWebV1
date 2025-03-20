import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { portalSubscriptionSchema } from '$lib/utils/form-schemas';
import { sendEmail } from '$lib/utils/email-service';

export const load: PageServerLoad = async () => {
  // Initialize the form with default values
  const form = await superValidate(zod(portalSubscriptionSchema));
  
  return { form };
};

export const actions = {
  default: async ({ request }) => {
    console.log('🚀 Starting portal subscription form action.');
    
    try {
      // Validate the form data using superValidate
      console.log('📝 Parsing and validating form data...');
      const form = await superValidate(request, zod(portalSubscriptionSchema));
      
      // Check if form is valid
      if (!form.valid) {
        console.error('❌ Validation errors:', form.errors);
        return fail(400, { form });
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
        form: await superValidate(zod(portalSubscriptionSchema))
      });
    }
  }
} satisfies Actions;