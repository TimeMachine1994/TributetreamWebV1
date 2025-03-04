import { json } from '@sveltejs/kit';
import sgMail from '@sendgrid/mail';
import { env } from '$env/dynamic/private';

 
// Set SendGrid API Key - with proper fallback for development
const apiKey = env.SENDGRID_API_KEY || '';
if (apiKey) {
  sgMail.setApiKey(apiKey);
} else {
  console.warn('⚠️ No SendGrid API key set - emails will be mocked');
}

/**
 * @param {import('@sveltejs/kit').RequestEvent} param0
 */
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

    // Check if we have a SendGrid API key
    if (env.SENDGRID_API_KEY) {
      // Send the email using SendGrid
      await sgMail.send(msg);
      console.log('✅ Email sent via SendGrid to:', to);
    } else {
      // Mock email for development
      console.log('📧 MOCK EMAIL (SendGrid not configured):');
      console.log('  To:', msg.to);
      console.log('  From:', msg.from);
      console.log('  Subject:', msg.subject);
      console.log('  Text:', msg.text.substring(0, 100) + (msg.text.length > 100 ? '...' : ''));
    }

    return json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}