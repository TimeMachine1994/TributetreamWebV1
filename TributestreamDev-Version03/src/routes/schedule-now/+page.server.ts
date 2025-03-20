import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { scheduleSchema } from '$lib/utils/form-schemas';

export const load: PageServerLoad = async () => {
  // Initialize the form with default values
  const form = await superValidate(zod(scheduleSchema));
  
  return { form };
};

export const actions = {
  default: async ({ request, fetch }) => {
    console.log('🚀 Starting schedule-now form action.');
    
    try {
      // Validate the form data using superValidate
      console.log('📝 Parsing and validating form data...');
      const form = await superValidate(request, zod(scheduleSchema));
      
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
        phone: form.data.phone,
        serviceDetails: {
          date: form.data.serviceDate,
          time: form.data.serviceTime,
          location: form.data.serviceLocation || 'Not provided',
          type: form.data.serviceType || 'Not provided'
        },
        attendees: form.data.attendees || 'Not specified',
        additionalInfo: form.data.additionalInfo || 'None',
        preferredContactMethod: form.data.preferredContactMethod || 'Email',
        submissionDate: new Date().toISOString()
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
          formData: {
            ...emailData,
            // These fields are expected by the email service
            familyMemberLastName: form.data.name.split(' ').pop() || 'Client'
          }
        })
      });
      
      const emailResult = await emailResponse.json();
      
      if (!emailResult.success) {
        console.error('❌ Email sending failed:', emailResult);
        return message(form, 'Failed to send confirmation email. Please try again or contact us directly.', {
          status: 'error'
        });
      }
      
      console.log('✅ Emails sent successfully');
      
      // Return success response with a message
      return message(form, 'Your message has been sent, check your email.', {
        status: 'success'
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