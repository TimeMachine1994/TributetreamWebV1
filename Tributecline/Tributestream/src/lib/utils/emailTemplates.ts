import { generateMagicLink } from '$lib/utils/security';

interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

/**
 * Generates a welcome email with magic link for new users
 * @param userId The user's ID
 * @param email The user's email
 * @param name The user's display name
 * @returns EmailTemplate object containing subject, text, and HTML version
 */
export function generateWelcomeEmail(userId: string, email: string, name: string): EmailTemplate {
  const magicLink = generateMagicLink(userId, email);
  
  const subject = 'Welcome to Tributestream - Verify Your Account';
  
  const text = `
Hello ${name},

Welcome to Tributestream! We're excited to have you join us.

To get started, please verify your account by clicking the link below:
${magicLink}

This link will expire in 24 hours for security purposes.

If you didn't create an account with us, you can safely ignore this email.

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
  
  <p>Hello ${name},</p>
  
  <p>Welcome to Tributestream! We're excited to have you join us.</p>
  
  <p>To get started, please verify your account by clicking the button below:</p>
  
  <p style="text-align: center; margin: 30px 0;">
    <a href="${magicLink}" 
       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Verify Your Account
    </a>
  </p>
  
  <p style="color: #666; font-size: 14px;">
    This link will expire in 24 hours for security purposes.<br>
    If you didn't create an account with us, you can safely ignore this email.
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