// src/lib/utils/fetchWithAuth.ts
import type { RequestEvent } from '@sveltejs/kit';

export async function fetchWithAuth(
    url: string,
    options: RequestInit = {},
    event: RequestEvent
): Promise<Response> {
    // Ensure this function is called only on the server side
    if (typeof window !== 'undefined') {
        throw new Error('fetchWithAuth should not be called on the client side');
    }

    // Get the JWT token from server-side cookies
    const jwtToken = event.cookies.get('jwt');

    if (!jwtToken) {
        console.error('No JWT token found in server-side cookies');
        throw new Error('No JWT token found in server-side cookies');
    }

    // Set up the request headers with the JWT token
    const headers: HeadersInit = {
        ...options.headers,
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
    };

    console.log('Making request to URL:', url);
    console.log('Request headers:', headers);

    // Make the fetch request to the WordPress API
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        // Handle errors
        const errorData = await response.text(); // Use text in case response is not JSON
        console.error('Fetch error:', errorData);
        throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    }

    return response;
}
