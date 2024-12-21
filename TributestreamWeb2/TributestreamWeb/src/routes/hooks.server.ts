// Example hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // Handle auth token from cookies
    event.locals.token = event.cookies.get('auth_token');
    return await resolve(event);
};
