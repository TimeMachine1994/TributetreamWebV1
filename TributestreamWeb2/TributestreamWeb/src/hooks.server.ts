import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

const PROTECTED_ROUTES = ['/dashboard', '/admin'];
const PUBLIC_ROUTES = ['/login', '/register', '/api/auth'];

export const handle: Handle = async ({ event, resolve }) => {
    console.log('🔄 [Hook] Intercepting Request:', event.url.pathname);

    const { cookies, url } = event;
    const token = cookies.get('auth_token');
    const isProtectedRoute = PROTECTED_ROUTES.some(route => url.pathname.startsWith(route));
    const isPublicRoute = PUBLIC_ROUTES.some(route => url.pathname.startsWith(route));

    // Skip auth check for public routes and API endpoints
    if (!isProtectedRoute || isPublicRoute) {
        return await resolve(event);
    }

    // Check for token on protected routes
    if (!token) {
        console.log('❌ [Hook] No auth token found, redirecting to login');
        throw redirect(302, '/login');
    }

    try {
        // Validate token
        const response = await event.fetch('/api/auth/validate', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.log('❌ [Hook] Invalid token, redirecting to login');
            cookies.delete('auth_token', { path: '/' });
            throw redirect(302, '/login');
        }

        // Decode JWT payload to get user info
        const [, payload] = token.split('.');
        const decodedUser = JSON.parse(atob(payload));

        // Set user and token in event.locals
        event.locals.user = {
            id: decodedUser.sub,
            email: decodedUser.email,
            name: decodedUser.name,
            role: decodedUser.role || 'user'
        };
        event.locals.token = token;

        console.log('✅ [Hook] User authenticated:', event.locals.user.email);
    } catch (error) {
        console.error('❌ [Hook] Auth error:', error);
        cookies.delete('auth_token', { path: '/' });
        throw redirect(302, '/login');
    }

    const response = await resolve(event);
    console.log('✅ [Hook] Response Status:', response.status);

    return response;
};
