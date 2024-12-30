import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    console.log('🔄 Hook Intercepting Request');
 
 event.locals.jwt = event.cookies.get('jwt');
    console.log('🔍 JWT in Hook:', event.locals.jwt);
 
    return resolve(event);
};
