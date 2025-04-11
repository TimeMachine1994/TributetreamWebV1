import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  sendCustomerConfirmation,
  sendInternalNotification,
} from '$lib/utils/email-service';

export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('📨 Received request to send-email API endpoint');
    const data = await request.json();
    console.log('📦 Request data:', JSON.stringify(data, null, 2));
    
    // Validate request data
    if (!data || typeof data !== 'object') {
      return json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Handle dual email sending
    if (data.type === 'dual' && data.formData) {
      console.log('🔄 Processing dual email request');
      // Extract necessary data from the form data
      const {
        familyMemberLastName,
        email,
        slug
      } = data.formData;

      // Prepare data for customer email
      const customerData = {
        familyLastName: familyMemberLastName || 'Valued',
        tributeLink: slug
          ? `https://tributestream.com/celebration-of-life-for-${slug}`
          : 'https://tributestream.com/celebration-of-life-preview'
      };
      
      console.log('👤 Customer email data:', JSON.stringify(customerData, null, 2));

      // Send customer confirmation email
      const customerEmailResult = await sendCustomerConfirmation(
        email,
        customerData
      );
      // Send internal notification with all form data to tributestream@tributestream.com
      const internalEmailResult = await sendInternalNotification(data.formData);
      
      console.log('📊 Email sending results - Customer: ' + (customerEmailResult ? '✅' : '❌') +
                 ', Internal to tributestream@tributestream.com: ' + (internalEmailResult ? '✅' : '❌'));
      
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
 
    // If we reach here, request didn't match any expected format
    return json(
      { success: false, message: 'Invalid email request format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('💥 Top-level error processing API request:', error);
    return json(
      { success: false, message: 'Server error processing request' },
      { status: 500 }
    );
  }
};