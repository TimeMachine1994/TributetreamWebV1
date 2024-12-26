// import { dev } from '$app/environment';

// if (dev) {
//   const { server } = await import('./mocks/node');

//   server.listen();
// }
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // Set a cookie
    event.cookies.set('myCookie', 'cookieValue', {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // Get a cookie
   event.cookies.get('myCookie');

    // Delete a cookie
    event.cookies.delete('myCookie', { path: '/' });

    const response = await resolve(event);
    return response;
};
