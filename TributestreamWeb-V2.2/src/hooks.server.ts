import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // Get the JWT token from cookies
    const jwt = event.cookies.get('jwt');
    const userId = event.cookies.get('user_id');

    // Add authentication data to event.locals
    event.locals = {
        authenticated: !!jwt,
        token: jwt,
        userId: userId
    };

    // Protected routes that require authentication
    const protectedRoutes = ['/fd-form/confirmation'];
    const isProtectedRoute = protectedRoutes.some(route => event.url.pathname.startsWith(route));

    if (isProtectedRoute && !jwt) {
        // Redirect to login if trying to access protected route without authentication
        return new Response('Redirect', {
            status: 303,
            headers: { Location: '/login' }
        });
    }

    const response = await resolve(event);
    return response;
};
