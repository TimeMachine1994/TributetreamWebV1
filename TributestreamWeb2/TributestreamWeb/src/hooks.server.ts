// import { dev } from '$app/environment';

// if (dev) {
//   const { server } = await import('./mocks/node');

//   server.listen();
// }
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // Set a cookie
    event.cookies.set('jwt', 'cookieValue', {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // Get a cookie
   event.cookies.get('jwt');

    // Delete a cookie
    event.cookies.delete('jwt', { path: '/' });

    const response = await resolve(event);
    return response;
};
