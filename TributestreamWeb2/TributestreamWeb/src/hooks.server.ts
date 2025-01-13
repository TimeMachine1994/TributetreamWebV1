import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    console.log('🔄 Hook Intercepting Request');

    const cookies = event.cookies.getAll();
    console.log('🍪 All cookies:', cookies);
    console.log( event.cookies.get('jwt'));
    // Retrieve the JWT from cookies
  
    // Attach the JWT to `locals`
    const jwt = event.cookies.get('jwt');
    event.locals.jwt = jwt;
    console.log('🔍 JWT in Hook:', jwt);

    const user_id = event.cookies.get('user_id');
    event.locals.user_id = user_id;
    console.log('🔍 user_id in hook:', user_id);



    // Continue resolving the request
    const response = await resolve(event);

    // Log the final response status
    console.log('✅ Response Status:', response.status);

    return response;
};

 