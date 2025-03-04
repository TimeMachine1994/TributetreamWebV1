import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    //console.log('🔄 [Hook] Intercepting Request:', event.url.pathname);

    // Get all cookies for logging
    const cookies = event.cookies.getAll();
  //  console.log('🍪 [Hook] All cookies:', cookies);

    // Get JWT and user data
    const jwt = event.cookies.get('jwt');
    const userCookie = event.cookies.get('user');
    
    // Attach JWT to locals for API requests
    event.locals.jwt = jwt;
    event.locals.user = userCookie ? JSON.parse(userCookie) : null;
 

    // Check if trying to a 

    // Continue resolving the request
    const response = await resolve(event);
    //console.log('✅ [Hook] Response Status:', response.status);

    return response;
};
