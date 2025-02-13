import { json } from '@sveltejs/kit';
import type { RegisterData } from '$lib/types/api';
import { wpFetch, ApiError } from '$lib/utils/api';
import { generateSimplePassword } from '$lib/utils/security';
import { generateWelcomeEmail } from '$lib/utils/emailTemplates';
import sgMail from '@sendgrid/mail';

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST({ request }) {
  try {
    const data = await request.json() as RegisterData;
    
    // Basic validation
    if (!data.username || !data.email || !data.firstName || !data.lastName) {
      return json(
        { error: 'Username, email, first name, and last name are required' },
        { status: 400 }
      );
    }

    try {
      // Generate a simple password
      const generatedPassword = generateSimplePassword();

      // Register user with WordPress
      const result = await wpFetch<{ user_id: number }>(
        '/register',
        {
          method: 'POST',
          body: JSON.stringify({
            username: data.username,
            email: data.email,
            password: generatedPassword,
            meta: data.meta
          })
        }
      );

      // Generate welcome email with credentials
      const welcomeEmail = generateWelcomeEmail({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: generatedPassword
      });

      // Send welcome email
      try {
        await sgMail.send({
          to: data.email,
          from: 'tributestream@tributestream.com',
          subject: welcomeEmail.subject,
          text: welcomeEmail.text,
          html: welcomeEmail.html
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Continue with registration even if email fails
      }

      return json({
        success: true,
        user_id: result.user_id,
        message: 'Registration successful. Please check your email for login credentials.'
      }, { status: 201 });
    } catch (error) {
      console.error('WordPress registration error:', error);
      return json(
        { 
          error: true, 
          message: error instanceof Error ? error.message : 'Registration failed'
        }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Registration endpoint error:', error);
    return json(
      { 
        error: true, 
        message: 'An unexpected error occurred during registration'
      }, 
      { status: 500 }
    );
  }
}
