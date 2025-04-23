import type { Handle } from '@sveltejs/kit';
import { getUserFromToken } from '$lib/auth/utils';

export const handle: Handle = async ({ event, resolve }) => {
    // Get JWT token from cookie
    const jwt = event.cookies.get('jwt');
    
    // Extract user information from token
    event.locals.user = await getUserFromToken(jwt) || {
        id: 0,
        email: '',
        authenticated: false
    };

    // Add JWT token to requests to Strapi API
    if (event.url.pathname.startsWith('/api/')) {
        event.locals.jwt = jwt;
    }
    
    // Handle protected routes
    if (event.url.pathname.startsWith('/protected') && !event.locals.user.authenticated) {
        return new Response('Redirect', {
            status: 303,
            headers: { Location: '/login' }
        });
    }

    // Resolve the request and return the response
    const response = await resolve(event);
    return response;
};
