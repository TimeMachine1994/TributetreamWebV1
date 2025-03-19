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

// Need to import environment variables in SvelteKit in a special way
// Initialize SendGrid with the API key
// For now, let's use a placeholder. In production, this would come from $env/static/private
const SENDGRID_API_KEY = 'SG.placeholder'; // Will be replaced with actual API key in production
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
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 200px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
        .button {
          display: inline-block;
          background-color: #4A90E2;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://tributestream.com/logo.png" alt="Tributestream Logo">
      </div>
      
      <p>Dear ${data.familyLastName} Family,</p>
      
      <p>Tributestream wishes you our deepest sympathy for the passing of your loved one.
      We hope that our duty to share the coming memorial will bring greater comfort.</p>
      
      <p>Please follow the link below to finish the process. You will get a confirmation email and a shareable link to the website page that will broadcast the stream:</p>
      
      <p style="text-align: center;">
        <a href="${data.tributeLink}" class="button">View Memorial Page</a>
      </p>
      
      <p>You will be contacted within 24-48 hours to complete the process.</p>
      
      <p>We look forward to meeting you in the near term to offer our personal condolences.</p>
      
      <p>Respectfully,<br>
      Tributestream</p>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Tributestream. All rights reserved.</p>
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
Dear ${data.familyLastName} Family,

Tributestream wishes you our deepest sympathy for the passing of your loved one.
We hope that our duty to share the coming memorial will bring greater comfort.

Please follow the link below to finish the process. You will get a confirmation email and a shareable link to the website page that will broadcast the stream:

${data.tributeLink}

You will be contacted within 24-48 hours to complete the process.

We look forward to meeting you in the near term to offer our personal condolences.

Respectfully,
Tributestream
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
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${formattedKey}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${value}</td>
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
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 8px;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .section-header {
          background-color: #e9e9e9;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>New Memorial Service Form Submission</h2>
        <p>Received on: ${new Date().toLocaleString()}</p>
      </div>
      
      <p>A new memorial service form has been submitted with the following information:</p>
      
      <table>
        <tbody>
          ${formDataRows}
        </tbody>
      </table>
      
      <p><strong>Note:</strong> Please review this information and follow up with the family within 24-48 hours as per protocol.</p>
    </body>
    </html>
  `;
}