/**
 * Security utilities for handling authentication and token validation
 */
import { randomBytes, createHash } from 'crypto';

/**
 * Validates a JWT token by making a request to WordPress
 * @param token The JWT token to validate
 * @returns Promise<boolean> True if token is valid, false otherwise
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.WORDPRESS_URL}/wp-json/jwt-auth/v1/token/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.code === 'jwt_auth_valid_token' && data.data.status === 200;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * Generates a secure magic link token
 * @param userId The user's ID
 * @param email The user's email
 * @returns The generated magic link token
 */
export function generateMagicLinkToken(userId: string, email: string): string {
  const timestamp = Date.now();
  const randomString = randomBytes(32).toString('hex');
  const data = `${userId}-${email}-${timestamp}-${randomString}`;
  
  return createHash('sha256')
    .update(data)
    .update(process.env.MAGIC_LINK_SECRET || 'default-secret')
    .digest('hex');
}

/**
 * Generates a complete magic link URL
 * @param userId The user's ID
 * @param email The user's email
 * @returns The complete magic link URL
 */
export function generateMagicLink(userId: string, email: string): string {
  const token = generateMagicLinkToken(userId, email);
  const baseUrl = process.env.APP_URL || 'http://localhost:5173';
  
  return `${baseUrl}/auth/verify?token=${token}&userId=${userId}&email=${encodeURIComponent(email)}`;
}

/**
 * Validates a magic link token
 * @param token The token to validate
 * @param userId The user's ID
 * @param email The user's email
 * @returns boolean indicating if the token is valid
 */
export function validateMagicLinkToken(token: string, userId: string, email: string): boolean {
  // Token expiration time (24 hours)
  const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;
  
  try {
    // Recreate the token with the same data
    const newToken = generateMagicLinkToken(userId, email);
    
    // Compare the tokens
    if (token === newToken) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Magic link validation error:', error);
    return false;
  }
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Type guard to check if an error is an instance of Error
 * @param error The error to check
 * @returns boolean indicating if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Formats an error message for display
 * @param error The error to format
 * @returns A user-friendly error message
 */
export function formatErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}