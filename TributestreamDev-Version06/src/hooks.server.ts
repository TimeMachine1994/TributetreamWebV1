import type { Handle } from '@sveltejs/kit';
import { getUserFromToken } from '$lib/auth/utils';
import type { UserRole } from '$lib/auth/types';

// Define route access rules
const routeAccessRules: Record<string, UserRole[]> = {
    '/admin-dashboard': ['Admin'],
    '/funeral-director-portal': ['Funeral Director'],
    '/family-dashboard': ['Family Contact']
};

/**
 * Check if user has access to the requested path
 */
function hasAccess(path: string, userRole?: UserRole): boolean {
    console.log('🔒 Checking access for path:', path, 'User role:', userRole);
    
    // Find matching route rule
    const matchingRoute = Object.keys(routeAccessRules).find(route => 
        path.startsWith(route)
    );

    if (!matchingRoute) {
        console.log('✅ No access rule found, allowing access');
        return true; // No rule found, allow access
    }

    if (!userRole) {
        console.log('❌ No user role found, denying access');
        return false; // No role, no access
    }

    const hasPermission = routeAccessRules[matchingRoute].includes(userRole);
    console.log(hasPermission ? '✅ Access granted' : '❌ Access denied');
    return hasPermission;
}

export const handle: Handle = async ({ event, resolve }) => {
    console.log('🌐 Processing request for:', event.url.pathname);

    // Get JWT token from cookie
    const jwt = event.cookies.get('jwt');
    
    // Extract user information from token with default values
    event.locals.user = await getUserFromToken(jwt) || {
        id: 0,
        email: '',
        name: '',
        role: 'Family Contact' as UserRole, // Default role for unauthenticated users
        authenticated: false
    };

    // Add JWT token to requests to Strapi API
    if (event.url.pathname.startsWith('/api/')) {
        event.locals.jwt = jwt;
    }
    
    // Check access for protected routes
    const isProtectedRoute = Object.keys(routeAccessRules).some(route => 
        event.url.pathname.startsWith(route)
    );

    if (isProtectedRoute) {
        console.log('🛡️ Protected route detected');

        // Check authentication first
        if (!event.locals.user.authenticated) {
            console.log('🚫 User not authenticated, redirecting to login');
            return new Response('Redirect', {
                status: 303,
                headers: { Location: '/login' }
            });
        }

        // Check role-based access
        if (!hasAccess(event.url.pathname, event.locals.user.role)) {
            console.log('🚫 Access denied, redirecting to unauthorized page');
            return new Response('Redirect', {
                status: 303,
                headers: { Location: '/unauthorized' }
            });
        }
    }

    // Handle general protected routes
    if (event.url.pathname.startsWith('/protected') && !event.locals.user.authenticated) {
        console.log('🚫 Protected route access denied');
        return new Response('Redirect', {
            status: 303,
            headers: { Location: '/login' }
        });
    }

    // Resolve the request and return the response
    console.log('✨ Processing request');
    const response = await resolve(event);
    return response;
};
