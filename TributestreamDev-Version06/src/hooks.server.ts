import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {

    event.locals.user = await getUserInformation(event.cookies.get('sessionid'));

    if (request.url.startsWith(http://localhost:1338/api)) {
     //add jwt  
    }
    if (event.url.pathname.startsWith('/custom')) {
        return new Response('custom resposne');
    }

    response.headers.set();

    const response =  await resolve(event);
    return response;
};
 
