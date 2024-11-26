import type { Request } from '@sveltejs/kit';

export async function fetchWithAuth(
    url: string,
    options: RequestInit = {},
    request?: Request
): Promise<Response> {
    let jwtToken: string | null;

    if (typeof document !== 'undefined') {
        // Browser environment: get cookie from document.cookie
        jwtToken = getCookie('jwt');
    } else if (request) {
        // Server environment: get cookie from request headers
        const cookies = parseCookies(request.headers.get('cookie') || '');
        jwtToken = cookies['jwt'] || null;
    } else {
        throw new Error('Unable to retrieve JWT token');
    }

    if (!jwtToken) {
        throw new Error('No JWT token found.');
    }

    const headers: HeadersInit = {
        ...options.headers,
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Fetch error:', errorData);
        throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    }

    return response;
}

// Helper: Get cookie from `document.cookie` in the browser
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
}

// Helper: Parse cookies in server-side environment
function parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach((cookie) => {
        const [key, value] = cookie.split('=').map((part) => part.trim());
        if (key && value) {
            cookies[key] = value;
        }
    });
    return cookies;
}
