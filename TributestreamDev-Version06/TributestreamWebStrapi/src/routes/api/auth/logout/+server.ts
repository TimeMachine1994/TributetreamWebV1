import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * POST handler for user logout
 */
export async function POST({ cookies }: RequestEvent) {
  // Clear the JWT cookie
  cookies.set('jwt', '', {
    path: '/',
    expires: new Date(0),
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict'
  });
  
  return json({ success: true });
}

/**
 * GET handler for user logout - for when POST isn't available
 */
export async function GET({ cookies }: RequestEvent) {
  // Clear the JWT cookie
  cookies.set('jwt', '', {
    path: '/',
    expires: new Date(0),
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict'
  });
  
  return json({ success: true });
}