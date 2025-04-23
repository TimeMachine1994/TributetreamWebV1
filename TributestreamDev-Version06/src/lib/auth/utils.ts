import type { Cookies } from '@sveltejs/kit';
import type { JwtPayload, UserData } from './types';

/**
 * Extract user information from JWT token
 * @param token JWT token from cookie
 * @returns User data or null if token is invalid
 */
export async function getUserFromToken(token: string | undefined): Promise<UserData | null> {
  if (!token) return null;
  
  try {
    // TODO: Use a proper JWT library for verification
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload)) as JwtPayload;
    
    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      return null;
    }
    
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      authenticated: true
    };
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
}

/**
 * Store JWT token in cookie
 * @param cookies SvelteKit cookies object
 * @param token JWT token to store
 */
export function setAuthCookie(cookies: Cookies, token: string): void {
  cookies.set('jwt', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
}

/**
 * Clear JWT token from cookie
 * @param cookies SvelteKit cookies object
 */
export function clearAuthCookie(cookies: Cookies): void {
  cookies.set('jwt', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 0
  });
}