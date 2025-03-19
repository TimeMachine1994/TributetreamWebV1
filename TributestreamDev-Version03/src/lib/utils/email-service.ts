import sgMail from '@sendgrid/mail';

/**
 * Interface for common email options
 */
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Interface for customer confirmation email data
 */
interface CustomerEmailData {
  familyLastName: string;
  tributeLink: string;
}

/**
 * Interface for form data (all fields from the memorial form)
 */
interface FormData {
  directorFirstName?: string;
  directorLastName?: string;
  familyMemberFirstName?: string;
  familyMemberLastName?: string;
  familyMemberDOB?: string;
  deceasedFirstName?: string;
  deceasedLastName?: string;
  deceasedDOB?: string;
  deceasedDOP?: string;
  email?: string;
  phone?: string;
  locationName?: string;
  locationAddress?: string;
  memorialTime?: string;
  memorialDate?: string;
  slug?: string;
  password?: string;
  [key: string]: any; // For any additional fields
}

// Import environment variables in SvelteKit using the proper module
import { SENDGRID_API_KEY } from '$env/static/private';

// Initialize SendGrid with the API key from environment variables
console.log('Initializing SendGrid with API key:', SENDGRID_API_KEY.substring(0, 10) + '...[REDACTED]');
sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Send a confirmation email to the customer
 * @param to Customer email address
 * @param data Personalization data
 * @returns Promise resolving to success status
 */
export async function sendCustomerConfirmation(to: string, data: CustomerEmailData): Promise<boolean> {
  try {
    const html = createCustomerEmailTemplate(data);
    const text = createCustomerEmailText(data);
    
    await sgMail.send({
      from: 'tributestream@tributestream.com',
      to,
      subject: 'Your Tributestream Memorial Service',
      html,
      text
    });
    
    console.log('✅ Customer confirmation email sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to send customer confirmation email:', error);
    return false;
  }
}

/**
 * Send internal notification email with all form data
 * @param formData Complete form submission data
 * @returns Promise resolving to success status
 */
export async function sendInternalNotification(formData: FormData): Promise<boolean> {
  try {
    const html = createInternalNotificationTemplate(formData);
    
    await sgMail.send({
      from: 'tributestream@tributestream.com',
      to: 'contact@tributestream.com',
      subject: 'New Memorial Service Form Submission',
      html
    });
    
    console.log('✅ Internal notification email sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to send internal notification email:', error);
    return false;
  }
}

/**
 * Send a generic email - used for legacy compatibility
 * @param options Email options
 * @returns Promise resolving to success status
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await sgMail.send({
      from: 'tributestream@tributestream.com',
      ...options
    });
    
    console.log('✅ Generic email sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

/**
 * Create HTML template for customer confirmation email
 */
function createCustomerEmailTemplate(data: CustomerEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 0;
          background-color: #f9f9f9;
        }
        .email-container {
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          margin: 20px;
        }
        .header {
          background: linear-gradient(135deg, #4a6cf7 0%, #2e4dd4 100%);
          color: white;
          padding: 30px;
          text-align: center;
          font-weight: 600;
          font-size: 24px;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 30px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding: 20px;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eaeaea;
        }
        .button {
          display: inline-block;
          background-color: #4a6cf7;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(74, 108, 247, 0.2);
          transition: all 0.2s ease;
        }
        .button:hover {
          background-color: #3a5cd7;
        }
        p {
          margin-bottom: 16px;
          color: #444;
        }
        .greeting {
          font-size: 18px;
          font-weight: 500;
          color: #222;
        }
        .cta-container {
          text-align: center;
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          Tributestream
        </div>
        
        <div class="content">
          <p class="greeting">Dear ${data.familyLastName} Family,</p>
          
          <p>Tributestream wishes you our deepest sympathy for the passing of your loved one.
          We hope that our duty to share the coming memorial will bring greater comfort.</p>
          
          <p>Please follow the link below to finish the process. You will get a confirmation email and a shareable link to the website page that will broadcast the stream:</p>
          
          <div class="cta-container">
            <a href="${data.tributeLink}" class="button">View Memorial Page</a>
          </div>
          
          <p>You will be contacted within 24-48 hours to complete the process.</p>
          
          <p>We look forward to meeting you in the near term to offer our personal condolences.</p>
          
          <p>Respectfully,<br>
          <strong>Tributestream</strong></p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Tributestream. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Create plain text version of customer email for clients that don't support HTML
 */
function createCustomerEmailText(data: CustomerEmailData): string {
  return `
TRIBUTESTREAM
------------

Dear ${data.familyLastName} Family,

Tributestream wishes you our deepest sympathy for the passing of your loved one.
We hope that our duty to share the coming memorial will bring greater comfort.

Please follow the link below to finish the process. You will get a confirmation
email and a shareable link to the website page that will broadcast the stream:

Memorial Page: ${data.tributeLink}

You will be contacted within 24-48 hours to complete the process.

We look forward to meeting you in the near term to offer our personal condolences.

Respectfully,
Tributestream

------------
© ${new Date().getFullYear()} Tributestream. All rights reserved.
  `;
}

/**
 * Create HTML template for internal notification email with all form data
 */
function createInternalNotificationTemplate(formData: FormData): string {
  // Convert form data to HTML table rows
  const formDataRows = Object.entries(formData)
    .map(([key, value]) => {
      if (key === 'password') {
        // Don't include the password in the email for security
        return '';
      }
      
      // Format the key by converting camelCase to Title Case with spaces
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
        .trim();
      
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eaeaea; font-weight: 500; color: #333;">${formattedKey}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #444;">${value}</td>
        </tr>
      `;
    })
    .filter(row => row !== '') // Remove empty rows (like password)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 0;
          background-color: #f9f9f9;
        }
        .email-container {
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          margin: 20px;
        }
        .header {
          background: linear-gradient(135deg, #4a6cf7 0%, #2e4dd4 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h2 {
          margin: 0 0 10px 0;
          font-weight: 600;
          font-size: 24px;
          letter-spacing: -0.5px;
        }
        .header p {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }
        .content {
          padding: 30px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding: 20px;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eaeaea;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        table thead th {
          background-color: #f5f7fd;
          padding: 12px;
          font-weight: 600;
          text-align: left;
          color: #4a6cf7;
          border-bottom: 1px solid #eaeaea;
        }
        .note {
          margin-top: 20px;
          padding: 15px;
          background-color: #f5f7fd;
          border-left: 4px solid #4a6cf7;
          border-radius: 4px;
        }
        .intro {
          font-size: 16px;
          margin-bottom: 20px;
          color: #444;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h2>New Memorial Service Form Submission</h2>
          <p>Received on: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="content">
          <p class="intro">A new memorial service form has been submitted with the following information:</p>
          
          <table>
            <thead>
              <tr>
                <th style="width: 35%;">Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              ${formDataRows}
            </tbody>
          </table>
          
          <div class="note">
            <strong>Note:</strong> Please review this information and follow up with the family within 24-48 hours as per protocol.
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Tributestream. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}