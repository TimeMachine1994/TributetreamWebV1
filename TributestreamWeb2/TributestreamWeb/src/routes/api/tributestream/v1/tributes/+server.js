import { json } from '@sveltejs/kit';
import { getWpApiUrl } from '$lib/config';

// Helper function to forward headers
function getForwardHeaders(request) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Forward Authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        headers['Authorization'] = authHeader;
    }
    
    return headers;
}

// Helper function to handle errors
function handleError(error, defaultMessage, response = null) {
    console.error(`API Error: ${error.message}`);
    console.error('Full error details:', error);
    
    if (response) {
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
    }

    let errorDetails = {
        error: defaultMessage,
        details: error.message,
        timestamp: new Date().toISOString(),
        statusCode: error.status || (response ? response.status : 500)
    };

    if (response) {
        errorDetails.responseInfo = {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        };
    }

    return new Response(
        JSON.stringify(errorDetails), 
        {
            status: errorDetails.statusCode,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

export async function GET({ url, request }) {
    try {
        // Get pagination parameters
        const page = url.searchParams.get('page') || 1;
        const perPage = url.searchParams.get('per_page') || 10;
        const search = url.searchParams.get('search') || '';

        // Construct the WordPress API URL with query parameters
        const wpUrl = new URL(getWpApiUrl('tributes'));
        wpUrl.searchParams.set('page', page);
        wpUrl.searchParams.set('per_page', perPage);
        if (search) {
            wpUrl.searchParams.set('search', search);
        }

        const res = await fetch(wpUrl.toString(), {
            headers: getForwardHeaders(request)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('WordPress API Error Response:', {
                status: res.status,
                statusText: res.statusText,
                body: errorText
            });
            
            let error = new Error(errorText);
            error.status = res.status;
            return handleError(error, 'WordPress API request failed', res);
        }

        const data = await res.json();
        return json(data);
    } catch (error) {
        return handleError(error, 'Failed to fetch tributes');
    }
}

export async function POST({ request }) {
    try {
        const payload = await request.json();
        const res = await fetch(getWpApiUrl('tributes'), {
            method: 'POST',
            headers: getForwardHeaders(request),
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            return new Response(errorText, { 
                status: res.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await res.json();
        return json(data);
    } catch (error) {
        return handleError(error, 'Failed to create tribute');
    }
}

export async function PUT({ request, params }) {
    try {
        const id = params.id;
        const payload = await request.json();
        const res = await fetch(`${getWpApiUrl('tributes')}/${id}`, {
            method: 'PUT',
            headers: getForwardHeaders(request),
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            return new Response(errorText, { 
                status: res.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await res.json();
        return json(data);
    } catch (error) {
        return handleError(error, 'Failed to update tribute');
    }
}

export async function DELETE({ request, params }) {
    try {
        const id = params.id;
        const res = await fetch(`${getWpApiUrl('tributes')}/${id}`, {
            method: 'DELETE',
            headers: getForwardHeaders(request)
        });

        if (!res.ok) {
            const errorText = await res.text();
            return new Response(errorText, { 
                status: res.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await res.json();
        return json(data);
    } catch (error) {
        return handleError(error, 'Failed to delete tribute');
    }
}
