// src/lib/utils/cookie-auth.ts
import { type Cookies } from '@sveltejs/kit';

// User type definition
export interface User {
  id: number;
  email: string;
  display_name: string;
  roles?: string[];
  avatar_url?: string;
  // Add any other user properties needed
}

// Cookie names
const TOKEN_COOKIE_NAME = 'tributestream_token';
const USER_COOKIE_NAME = 'tributestream_user';

// Cookie options
const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: true, // Set to true for production, false for development if needed
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7 // 7 days
};

/**
 * Get the authentication token from cookies
 */
export function getTokenFromCookie(cookies: Cookies): string | null {
  return cookies.get(TOKEN_COOKIE_NAME) || null;
}

/**
 * Get the user data from cookies
 */
export function getUserFromCookie(cookies: Cookies): User | null {
  const userJson = cookies.get(USER_COOKIE_NAME);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
}

/**
 * Set authentication cookies
 */
export function setAuthCookie(cookies: Cookies, token: string, user: User): void {
  cookies.set(TOKEN_COOKIE_NAME, token, COOKIE_OPTIONS);
  cookies.set(USER_COOKIE_NAME, JSON.stringify(user), COOKIE_OPTIONS);
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(cookies: Cookies): void {
  cookies.delete(TOKEN_COOKIE_NAME, { path: '/' });
  cookies.delete(USER_COOKIE_NAME, { path: '/' });
}

/**
 * Format user data from WordPress response
 */
export function formatUserData(data: any): User {
  return {
    id: data.user_id || data.id,
    email: data.user_email || data.email,
    display_name: data.user_display_name || data.display_name,
    roles: data.user_roles || data.roles,
    avatar_url: data.avatar_url
  };
}

/**
 * Validate a JWT token against WordPress
 * This function will be replaced by the auth store implementation
 */
export async function validateToken(token: string): Promise<boolean> {
  if (!token) return false;
  
  try {
    const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token/validate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}
