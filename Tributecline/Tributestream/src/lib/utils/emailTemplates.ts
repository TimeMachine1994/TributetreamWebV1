import { generateMagicLink } from '$lib/utils/security';
import type { MemorialFormData } from '$lib/types/api';

interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

interface WelcomeEmailData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userId: string;
  token: string;
}

/**
 * Generates a memorial request notification email
 * @param data The memorial form data
 * @returns EmailTemplate object containing subject, text, and HTML version
 */
export function generateMemorialRequestEmail(data: MemorialFormData): EmailTemplate {
  const subject = 'New Memorial Request';
  
  const text = `
New Memorial Request Details:

Director Information:
- Name: ${data.director.firstName} ${data.director.lastName}

Family Member Information:
- Name: ${data.familyMember.firstName} ${data.familyMember.lastName}
- Date of Birth: ${data.familyMember.dob}

Deceased Information:
- Name: ${data.deceased.firstName} ${data.deceased.lastName}
- Date of Birth: ${data.deceased.dob}
- Date of Passing: ${data.deceased.dop}

Contact Information:
- Email: ${data.contact.email}
- Phone: ${data.contact.phone}

Memorial Details:
- Location: ${data.memorial.locationName}
- Address: ${data.memorial.locationAddress}
- Date: ${data.memorial.date}
- Time: ${data.memorial.time}
  `.trim();
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2563eb;">New Memorial Request</h1>
  
  <div style="margin: 20px 0;">
    <h2 style="color: #1e40af;">Director Information</h2>
    <p>
      <strong>Name:</strong> ${data.director.firstName} ${data.director.lastName}
    </p>
  </div>

  <div style="margin: 20px 0;">
    <h2 style="color: #1e40af;">Family Member Information</h2>
    <p>
      <strong>Name:</strong> ${data.familyMember.firstName} ${data.familyMember.lastName}<br>
      <strong>Date of Birth:</strong> ${data.familyMember.dob}
    </p>
  </div>

  <div style="margin: 20px 0;">
    <h2 style="color: #1e40af;">Deceased Information</h2>
    <p>
      <strong>Name:</strong> ${data.deceased.firstName} ${data.deceased.lastName}<br>
      <strong>Date of Birth:</strong> ${data.deceased.dob}<br>
      <strong>Date of Passing:</strong> ${data.deceased.dop}
    </p>
  </div>

  <div style="margin: 20px 0;">
    <h2 style="color: #1e40af;">Contact Information</h2>
    <p>
      <strong>Email:</strong> ${data.contact.email}<br>
      <strong>Phone:</strong> ${data.contact.phone}
    </p>
  </div>

  <div style="margin: 20px 0;">
    <h2 style="color: #1e40af;">Memorial Details</h2>
    <p>
      <strong>Location:</strong> ${data.memorial.locationName}<br>
      <strong>Address:</strong> ${data.memorial.locationAddress}<br>
      <strong>Date:</strong> ${data.memorial.date}<br>
      <strong>Time:</strong> ${data.memorial.time}
    </p>
  </div>
</body>
</html>
  `.trim();
  
  return {
    subject,
    text,
    html
  };
}

/**
 * Generates a welcome email for new users
 * @param data The welcome email data
 * @returns EmailTemplate object containing subject, text, and HTML version
 */
export function generateWelcomeEmail(data: WelcomeEmailData): EmailTemplate {
  const subject = 'Welcome to Tributestream - Your Account Details';
  
  const text = `
Hello ${data.firstName} ${data.lastName},

Welcome to Tributestream! Your account has been created successfully.

Here are your login credentials:
Email: ${data.email}
Password: ${data.password}

Please keep this information secure. We recommend changing your password after your first login.

Best regards,
The Tributestream Team
  `.trim();
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2563eb;">Welcome to Tributestream!</h1>
  
  <p>Hello ${data.firstName} ${data.lastName},</p>
  
  <p>Your account has been created successfully.</p>
  
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
    <h2 style="color: #1e40af; margin-top: 0;">Your Login Credentials</h2>
    <p>
      <strong>Email:</strong> ${data.email}<br>
      <strong>Password:</strong> ${data.password}
    </p>
  </div>
  
  <p>Please keep this information secure. We recommend changing your password after your first login.</p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  
  <p style="color: #666; font-size: 14px;">
    Best regards,<br>
    The Tributestream Team
  </p>
</body>
</html>
  `.trim();
  
  return {
    subject,
    text,
    html
  };
}

/**
 * Generates a password reset email with magic link
 * @param userId The user's ID
 * @param email The user's email
 * @param name The user's display name
 * @returns EmailTemplate object containing subject, text, and HTML version
 */
export function generatePasswordResetEmail(userId: string, email: string, name: string): EmailTemplate {
  const magicLink = generateMagicLink(userId, email);
  
  const subject = 'Reset Your Tributestream Password';
  
  const text = `
Hello ${name},

We received a request to reset your Tributestream password.

To reset your password, click the link below:
${magicLink}

This link will expire in 24 hours for security purposes.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
The Tributestream Team
  `.trim();
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2563eb;">Reset Your Password</h1>
  
  <p>Hello ${name},</p>
  
  <p>We received a request to reset your Tributestream password.</p>
  
  <p>To reset your password, click the button below:</p>
  
  <p style="text-align: center; margin: 30px 0;">
    <a href="${magicLink}" 
       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Reset Password
    </a>
  </p>
  
  <p style="color: #666; font-size: 14px;">
    This link will expire in 24 hours for security purposes.<br>
    If you didn't request a password reset, you can safely ignore this email.
  </p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  
  <p style="color: #666; font-size: 14px;">
    Best regards,<br>
    The Tributestream Team
  </p>
</body>
</html>
  `.trim();
  
  return {
    subject,
    text,
    html
  };
}