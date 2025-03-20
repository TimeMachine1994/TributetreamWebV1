import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { contactSchema } from '$lib/utils/form-schemas';

export const load: PageServerLoad = async () => {
  // Initialize the form with default values
  const form = await superValidate(zod(contactSchema));
  
  return { form };
};

export const actions = {
  default: async ({ request, fetch }) => {
    console.log('🚀 Starting contact-us form action.');
    
    try {
      // Validate the form data using superValidate
      console.log('📝 Parsing and validating form data...');
      const form = await superValidate(request, zod(contactSchema));
      
      // Check if form is valid
      if (!form.valid) {
        console.error('❌ Validation errors:', form.errors);
        return fail(400, { form });
      }
      
      // Step 3: Prepare email data
      console.log('📧 Preparing email data...');
      const emailData = {
        // Format the data for both customer and internal emails
        name: form.data.name,
        email: form.data.email,
        phone: form.data.phone || 'Not provided',
        message: form.data.message,
        submissionDate: new Date().toISOString(),
        familyMemberLastName: form.data.name.split(' ').pop() || 'Customer' // Used by the email service
      };
      
      // Step 4: Send emails using the email API
      console.log('📤 Sending emails...');
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'dual',
          formData: emailData
        })
      });
      
      const emailResult = await emailResponse.json();
      
      if (!emailResult.success) {
        console.error('❌ Email sending failed:', emailResult);
        // Using numeric HTTP status code 400 for error
        return message(form, 'Failed to send your message. Please try again or contact us directly.', {
          status: 400 // Using a valid HTTP status code instead of 'error'
        });
      }
      
      console.log('✅ Emails sent successfully');
      
      // Return success response with a message
      // Using numeric HTTP status code 200 for success
      return message(form, 'Your message has been sent, check your email.', {
        status: 200 // Using a valid HTTP status code instead of 'success'
      });
      
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      return fail(500, {
        error: true,
        message: 'An unexpected error occurred. Please try again or contact us directly.',
        formData: {}
      });
    }
  }
} satisfies Actions;