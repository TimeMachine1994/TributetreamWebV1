import type { Handle } from '@sveltejs/kit';

/**
 * Server hook for handling authentication state
 * Validates JWT tokens and manages authenticated user state
 */
export const handle: Handle = async ({ event, resolve }) => {
    // Get JWT token from cookies
    const jwt = event.cookies.get('jwt_token'); // Note: Using the jwt_token name as in auth-helpers.ts
    
    if (jwt) {
        try {
            // Validate token with WordPress endpoint
            const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token/validate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });
            
            if (response.ok) {
                // If token is valid, set authenticated status in locals
                event.locals.authenticated = true;
                event.locals.token = jwt;
                
                // Also set user info if available
                const userCookie = event.cookies.get('user');
                if (userCookie) {
                    try {
                        const userData = JSON.parse(userCookie);
                        event.locals.user = userData;
                    } catch (error) {
                        console.error('Error parsing user cookie:', error);
                    }
                }
            } else {
                // If token validation fails, clear the cookies
                event.cookies.delete('jwt_token', { path: '/' });
                event.cookies.delete('user', { path: '/' });
            }
        } catch (error) {
            console.error('Error validating JWT token:', error);
        }
    }
    
    // Continue with the request
    return await resolve(event);
};