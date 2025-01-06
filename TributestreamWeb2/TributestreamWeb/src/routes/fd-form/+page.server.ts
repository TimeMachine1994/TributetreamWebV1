import sgMail from '@sendgrid/mail';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY is not set in the environment variables');
    throw new Error('SENDGRID_API_KEY is not set');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const actions: Actions = {
    default: async (event) => {
        console.log('▶️ Form action triggered: default');

        // Parse Form Data
        let formData;
        try {
            formData = await event.request.formData();
            console.log('✅ Form data received:', [...formData.entries()]);
        } catch (e) {
            console.error('❌ Failed to parse form data:', e);
            return fail(400, {
                message: 'Invalid form data',
                error: e.message || 'Unknown error'
            });
        }

        const directorFirstName = formData.get('directorFirstName')?.toString();
        if (!directorFirstName) {
            console.warn('⚠️ Missing required field: directorFirstName');
            return fail(400, {
                message: 'Director first name is required',
                field: 'directorFirstName'
            });
        }

        // SEND FORM DATA TO THE DATABASE AND GET THE DIRECTOR ID
        // 1. create the user based on the data input
        // 2. save the rest of the form data to the meta field 
        // 3. offer to continue to the next step or reset the form.
        


        // Prepare email data
        const emailData = {
            to: 'rockodo@gmail.com', // Replace with your recipient
            from: 'tributestream@tributestream.com', // Replace with your verified sender
            subject: 'Director Name Submission',
            text: `Director's First Name: ${directorFirstName}`,
            html: `<p>Director's First Name: <strong>${directorFirstName}</strong></p>`
        };

        // Send email
        try {
            console.log('✉️ Sending email with SendGrid:', emailData);
            await sgMail.send(emailData);
            console.log('✅ Email sent successfully');
        } catch (e) {
            console.error('❌ SendGrid error:', e.response?.body || e.message || e);
            return fail(500, {
                message: 'Failed to send email confirmation',
                error: e.response?.body || e.message || 'Unknown error'
            });
        }

        console.log('✅ All operations succeeded. Redirecting to confirmation page...');
        throw redirect(303, '/fd-form/confirmation');
    }
};
