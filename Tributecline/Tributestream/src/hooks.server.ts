import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // Ignore requests for MSW script
    if (event.url.pathname === '/mockServiceWorker.js') {
        return new Response('', { status: 200 });
    }

    // Get JWT token from cookies
    const token = event.cookies.get('jwt_token');
    const userId = event.cookies.get('user_id');

    // Add token and userId to event.locals for use in routes
    event.locals.token = token;
    event.locals.userId = userId;

    // Add auth helper to locals
    event.locals.isAuthenticated = !!token;

    const response = await resolve(event);
    return response;
};
