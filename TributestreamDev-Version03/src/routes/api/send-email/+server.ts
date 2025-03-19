import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { 
  sendCustomerConfirmation, 
  sendInternalNotification,
  sendEmail
} from '$lib/utils/email-service';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validate request data
    if (!data || typeof data !== 'object') {
      return json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Handle dual email sending
    if (data.type === 'dual' && data.formData) {
      // Extract necessary data from the form data
      const { 
        familyMemberLastName,
        email,
        slug 
      } = data.formData;

      // Prepare data for customer email
      const customerData = {
        familyLastName: familyMemberLastName || 'Valued',
        tributeLink: `https://tributestream.com/celebration-of-life-for-${slug}`
      };

      // Send customer confirmation email
      const customerEmailResult = await sendCustomerConfirmation(
        email, 
        customerData
      );
      
      // Send internal notification with all form data
      const internalEmailResult = await sendInternalNotification(data.formData);
      
      // Return success if at least one email succeeded
      // This prevents blocking the user flow if one email fails
      if (customerEmailResult || internalEmailResult) {
        return json({
          success: true,
          customerEmailSent: customerEmailResult,
          internalEmailSent: internalEmailResult
        });
      } else {
        // Both emails failed
        return json(
          { success: false, message: 'Failed to send emails' },
          { status: 500 }
        );
      }
    }

    // Handle legacy email sending for backward compatibility
    if (data.to && data.subject) {
      // This is currently used in several places in the application
      // We'll maintain backward compatibility
      const emailResult = await sendEmail({
        to: data.to,
        subject: data.subject,
        html: data.html || '',
        text: data.text
      });

      if (emailResult) {
        return json({ success: true });
      } else {
        return json(
          { success: false, message: 'Failed to send email' },
          { status: 500 }
        );
      }
    }

    // If we reach here, request didn't match any expected format
    return json(
      { success: false, message: 'Invalid email request format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing email request:', error);
    return json(
      { success: false, message: 'Server error processing email request' },
      { status: 500 }
    );
  }
};