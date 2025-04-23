import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clearAuthCookie } from '$lib/auth/utils';

/**
 * Logout endpoint that clears the JWT cookie
 */
export const POST: RequestHandler = async ({ cookies }) => {
    // Clear the JWT cookie
    clearAuthCookie(cookies);
    
    return json({ success: true });
};