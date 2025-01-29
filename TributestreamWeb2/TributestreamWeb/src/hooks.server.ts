import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    console.log('🔄 [Hook] Intercepting Request:', event.url.pathname);

    // Get all cookies for logging
    const cookies = event.cookies.getAll();
    console.log('🍪 [Hook] All cookies:', cookies);

    // Get JWT and user data
    const jwt = event.cookies.get('jwt');
    const userCookie = event.cookies.get('user');
    
    // Attach JWT to locals for API requests
    event.locals.jwt = jwt;
    
    // Parse user data if available
    let userData = null;
    if (userCookie) {
        try {
            userData = JSON.parse(userCookie);
            event.locals.user = userData;
            console.log('👤 [Hook] User data parsed:', {
                displayName: userData.displayName,
                //roles: userData.roles,
               // isAdmin: userData.isAdmin
            });
        } catch (error) {
            console.error('❌ [Hook] Error parsing user cookie:', error);
        }
    }

    // Check if trying to access admin routes
    if (event.url.pathname.startsWith('/admin') || event.url.pathname.startsWith('/admin-dashboard')) {
        console.log('🔒 [Hook] Checking admin route access...');
        
        // Redirect /admin to /admin-dashboard
        if (event.url.pathname === '/admin' || event.url.pathname.startsWith('/admin/')) {
            console.log('↪️ [Hook] Redirecting /admin to /admin-dashboard');
            throw redirect(303, '/admin-dashboard');
        }
        
        // Redirect to login if not authenticated
        if (!jwt || !userData) {
            console.log('⚠️ [Hook] No authentication found, redirecting to login');
            throw redirect(303, '/login');
        }

        // Check admin status
        if (!userData.isAdmin) {
            console.log('🚫 [Hook] User is not an admin, redirecting to dashboard');
            throw redirect(303, '/dashboard');
        }

        console.log('✅ [Hook] Admin access granted');
    }

    // Continue resolving the request
    const response = await resolve(event);
    console.log('✅ [Hook] Response Status:', response.status);

    return response;
};
