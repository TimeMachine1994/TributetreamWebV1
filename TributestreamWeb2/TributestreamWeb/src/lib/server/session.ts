// FILE: src/lib/server/session.ts

import type { Cookies, RequestEvent } from '@sveltejs/kit';
import { BASE_WORDPRESS_API } from '$env/static/private';

/**
 * Validate the session token.
 * - Makes a request to your backend to validate the JWT token.
 * - Returns the session and user details if valid, null otherwise.
 */ 
/**
 * Set the session token as a cookie.
 */
export function setSessionTokenCookie(cookies: Cookies, token: string) {
    console.log('[setSessionTokenCookie] Setting session token cookie:', token);

    cookies.set('jwt', token, {
        path: '/',
        httpOnly: false, // Consider setting this to true for security
        sameSite: 'none', // Adjust based on your cross-site request needs
        secure: false,    // Set to true in production for HTTPS
        maxAge: 60 * 60 * 24 // 1 day
    });

    console.log('[setSessionTokenCookie] Cookie set successfully');
}

/**
 * Delete the session token cookie.
 */
export function deleteSessionTokenCookie(event: RequestEvent) {
    console.log('[deleteSessionTokenCookie] Deleting session token cookie');

    event.cookies.delete('jwt', { path: '/' });

    console.log('[deleteSessionTokenCookie] Cookie deleted successfully');
}
