import { error, json } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Tribute } from '../../types/tribute';

type ErrorWithCode = {
    message: string;
    status?: number;
};

// Function to validate tribute array
function isValidTributeArray(data: any): data is Tribute[] {
    console.log('[isValidTributeArray] Checking data validity:', data);
    const isValid = Array.isArray(data) && data.every(item =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.loved_one_name === 'string' &&
        typeof item.created_at === 'string' &&
        typeof item.slug === 'string' &&
        (item.html_content === undefined || typeof item.html_content === 'string')
    );

    console.log('[isValidTributeArray] Validation result:', isValid);
    return isValid;
}

export const load: PageServerLoad = async ({ fetch, locals }) => {
    console.log('[load] Starting tribute data fetch...');
    console.log('[load] JWT Token:', locals.jwt ? 'Provided' : 'Not provided');

    try {
        // Fetching tributes with JWT authentication
        console.log('[load] Sending request to /tributestream/v1/tribute');
        const response = await fetch('/tributestream/v1/tribute', {
            headers: {
                'Authorization': `Bearer ${locals.jwt}`,
                'Accept': 'application/json'
            }
        });

        console.log('[load] Response received:', response);
        console.log('[load] Response status:', response.status);
        console.log('[load] Response headers:', response.headers);

        if (!response.ok) {
            console.error('[load] Fetch error:', response.statusText);
            throw error(response.status, {
                message: `Failed to fetch tributes: ${response.statusText}`
            } as ErrorWithCode);
        }

        try {
            console.log('[load] Parsing JSON response...');
            const data = await response.json();
            console.log('[load] Raw fetched data:', JSON.stringify(data, null, 2));

            if (!data || typeof data !== 'object') {
                console.error('[load] Invalid data structure:', data);
                throw new Error('Invalid response data structure');
            }

            // Handle both array and object with tributes property
            const tributes = Array.isArray(data) ? data : (data.tributes || []);
            console.log('[load] Extracted tributes:', tributes);

            if (!isValidTributeArray(tributes)) {
                console.error('[load] Invalid tributes structure:', tributes);
                throw new Error('Invalid tributes data structure');
            }

            const transformedTributes = tributes.map(tribute => ({
                id: tribute.id,
                loved_one_name: tribute.loved_one_name,
                html_content: tribute.html_content || '',
                created_at: tribute.created_at,
                slug: tribute.slug
            }));

            console.log('[load] Transformed tribute data:', transformedTributes);

            return {
                tributes: transformedTributes,
                totalPages: data.total_pages || 1
            };
        } catch (parseError) {
            console.error('[load] JSON Parsing Error:', parseError);
            throw error(500, {
                message: 'Failed to parse tribute data'
            } as ErrorWithCode);
        }
    } catch (err) {
        console.error('[load] General Error:', err);
        throw error(500, {
            message: 'Failed to load tributes'
        } as ErrorWithCode);
    }
};
