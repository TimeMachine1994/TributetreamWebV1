import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    // Clear the JWT cookie
    cookies.delete('jwt', { path: '/' });
    
    return json({ success: true });
};
