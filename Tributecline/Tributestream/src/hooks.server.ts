import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_WORDPRESS_URL } from '$env/static/public';

// Routes that require calculator completion
const PROTECTED_ROUTES = [
    '/family-dashboard',
    '/schedule',
    '/payment'
];

// Routes that are exempt from calculator check
const EXEMPT_ROUTES = [
    '/login',
    '/calculator',
    '/admin-dashboard',
    '/api',
    '/mockServiceWorker.js'
];

async function getCalculatorStatus(fetch: any, token: string) {
    try {
        const response = await fetch('/api/user-meta', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const calculatorStatus = data.meta_value ? JSON.parse(data.meta_value) : null;
        return calculatorStatus?.completed || false;
    } catch (error) {
        console.error('Error fetching calculator status:', error);
        return null;
    }
}

async function getUserRole(fetch: any, token: string) {
    try {
        const response = await fetch(`${PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return null;
        }

        const userData = await response.json();
        return userData.roles?.length ? userData.roles[0] : 'subscriber';
    } catch (error) {
        console.error('Error fetching user role:', error);
        return null;
    }
}

export const handle: Handle = async ({ event, resolve }) => {
    // Ignore requests for MSW script
    if (event.url.pathname === '/mockServiceWorker.js') {
        return new Response('', { status: 200 });
    }

    // Get JWT token from cookies
    const token = event.cookies.get('jwt_token');
    const userId = event.cookies.get('user_id');

    // Add token and userId to event.locals for use in routes
    event.locals.token = token;
    event.locals.userId = userId;

    // Add auth helper to locals
    event.locals.isAuthenticated = !!token;

    // Check if route requires calculator completion
    const pathname = event.url.pathname;
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isExemptRoute = EXEMPT_ROUTES.some(route => pathname.startsWith(route));

    if (token && isProtectedRoute && !isExemptRoute) {
        // Get user role
        const role = await getUserRole(event.fetch, token);

        // Only check calculator status for subscribers
        if (role === 'subscriber') {
            const hasCompletedCalculator = await getCalculatorStatus(event.fetch, token);
            
            // If calculator is not completed, redirect to calculator
            if (hasCompletedCalculator === false) {
                throw redirect(302, '/calculator');
            }
        }
    }

    const response = await resolve(event);
    return response;
};
