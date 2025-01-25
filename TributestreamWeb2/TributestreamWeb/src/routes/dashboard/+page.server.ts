import type { PageServerLoad } from './$types';
import type { Tribute } from '../../types/tribute';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, url, locals }) => {
    try {
        // Get pagination and search parameters from URL
        const page = url.searchParams.get('page') || '1';
        const perPage = url.searchParams.get('per_page') || '10';
        const search = url.searchParams.get('search') || '';

        // Construct API URL with all parameters
        const apiUrl = new URL('/api/tributes', url.origin);
        apiUrl.searchParams.set('page', page);
        apiUrl.searchParams.set('per_page', perPage);
        if (search) {
            apiUrl.searchParams.set('search', search);
        }

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw error(response.status, {
                message: errorData.error || 'Failed to fetch tributes'
            });
        }

        const data = await response.json();
        
        if (!Array.isArray(data.tributes)) {
            throw error(500, {
                message: 'Invalid response format from API'
            });
        }

        return {
            tributes: data.tributes as Tribute[],
            totalPages: data.total_pages || 1,
            currentPage: parseInt(page),
            searchQuery: search
        };
    } catch (err: unknown) {
        console.error('Error loading tributes:', err);
        if (err instanceof Error) {
            throw error(500, {
                message: err.message
            });
        }
        throw error(500, {
            message: 'Failed to load tributes'
        });
    }
};
