// import { dev } from '$app/environment';

// if (dev) {
//   const { server } = await import('./mocks/node');

//   server.listen();
// }
/** @type {import('@sveltejs/kit').Handle} */

export function handle({ event, resolve }) {
	const jwt = event.cookies.get('jwt');
	event.locals.user = jwt ? JSON.parse(atob(jwt)) : null;

	return resolve(event);
}