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

export async function GET({ params, request }) {
    try {
        const res = await fetch(`${getWpApiUrl('tributes')}/${params.id}`, {
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
        return handleError(error, 'Failed to fetch tribute');
    }
}

export async function PUT({ params, request }) {
    try {
        const payload = await request.json();
        const res = await fetch(`${getWpApiUrl('tributes')}/${params.id}`, {
            method: 'PUT',
            headers: getForwardHeaders(request),
            body: JSON.stringify(payload)
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
        return handleError(error, 'Failed to update tribute', null);
    }
}

export async function DELETE({ params, request }) {
    try {
        const res = await fetch(`${getWpApiUrl('tributes')}/${params.id}`, {
            method: 'DELETE',
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
        return handleError(error, 'Failed to delete tribute', null);
    }
}
