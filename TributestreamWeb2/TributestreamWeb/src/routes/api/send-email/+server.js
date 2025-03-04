import { json } from '@sveltejs/kit';
import sgMail from '@sendgrid/mail';
import { env } from '$env/dynamic/private';

 
// Set SendGrid API Key
sgMail.setApiKey(env.SENDGRID_API_KEY || '');

export async function POST({ request }) {
  try {
    const body = await request.json(); // Parse request body
    const { to, subject, text, html } = body;

    const msg = {
      to: to || 'tributestream@gmail.com', // Fallback recipient
      from: 'tributestream@tributestream.com', // Your verified sender email
      subject: subject || 'No Subject',
      text: text || 'No text provided',
      html: html || '<strong>No HTML content provided</strong>',
    };

    // Send the email using SendGrid
    await sgMail.send(msg);

    return json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}