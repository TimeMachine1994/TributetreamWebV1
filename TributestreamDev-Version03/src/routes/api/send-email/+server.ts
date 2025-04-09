import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  sendCustomerConfirmation,
  sendInternalNotification,
  sendEmail
} from '$lib/utils/email-service';
import { registerWordPressUser } from '$lib/server/wp-user-service';

export const POST: RequestHandler = async ({ request }) => {
  let registrationStatusMessage: string | undefined = undefined; // To hold registration outcome
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
      console.log('🔄 Processing dual email request (includes potential registration)');
      // Extract necessary data from the form data
      const {
        familyMemberLastName,
        firstName,
        email,
        slug
      } = data.formData;

      // --- WordPress Registration Step ---
      // Attempt registration if email is present
      let registrationAttempted = false;
      if (email) {
        registrationAttempted = true;
        console.log(`🏁 Attempting WordPress registration for: ${email}`);
        const registrationResult = await registerWordPressUser({
          email: email,
          firstName: firstName || familyMemberLastName, // Use available name fields
          lastName: familyMemberLastName
        });

        if (registrationResult.success) {
          registrationStatusMessage = `User ${email} registered successfully in WordPress (User ID: ${registrationResult.userId || 'N/A'}).`;
          console.log(registrationStatusMessage);
        } else if (registrationResult.isDuplicate) {
          // Graceful handling of DUPLICATE users
          registrationStatusMessage = `Note: User ${email} could not be registered because they already exist in WordPress. Form data processed normally.`;
          console.warn(registrationStatusMessage); // Log as warning
        } else {
          // Handle OTHER registration errors (log but still send emails)
          registrationStatusMessage = `Warning: WordPress registration failed for ${email}. Reason: ${registrationResult.message}. Form data still processed.`;
          console.error(registrationStatusMessage); // Log as error
        }
      } else {
        console.log('ℹ️ Registration skipped (no email provided in formData).');
      }

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
      // Pass the registration status message to the internal notification
      const internalEmailResult = await sendInternalNotification(data.formData, registrationStatusMessage);
      
      console.log('📊 Email sending results - Customer: ' + (customerEmailResult ? '✅' : '❌') +
                 ', Internal to tributestream@tributestream.com: ' + (internalEmailResult ? '✅' : '❌'));
      
      // Return success if at least one email succeeded
      // This prevents blocking the user flow if one email fails
      if (customerEmailResult || internalEmailResult) {
        return json({
          success: true,
          registrationStatus: registrationStatusMessage || (registrationAttempted ? 'Registration failed (unknown reason)' : 'Registration not attempted'),
          customerEmailSent: customerEmailResult,
          internalEmailSent: internalEmailResult
        });
      } else {
        // Both emails failed
        return json(
          { success: false, message: 'Failed to send emails', registrationStatus: registrationStatusMessage },
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
    console.error('💥 Top-level error processing API request:', error);
    // Include any registration status message obtained before the error, if available
    return json(
      { success: false, message: 'Server error processing request', registrationStatus: registrationStatusMessage },
      { status: 500 }
    );
  }
};