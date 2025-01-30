import type { PageServerLoad } from './$types';
import type { Tribute } from '../../types/tribute';

export const load: PageServerLoad = async ({ fetch }) => {
    console.log('[load] Fetching tributes from /api/tributes?page=1&per_page=10');

    try {
        // Fetching the latest 10 tributes
        const response = await fetch('/api/tributes?page=1&per_page=10');

        // Log the response status
        console.log('[load] Response Status:', response.status);

        if (!response.ok) {
            console.error('[load] Failed to fetch tributes, response not OK:', response.statusText);
            throw new Error('Failed to fetch tributes');
        }

        // Parse response JSON
        const data = await response.json();
        console.log('[load] Fetched data:', data);

        return {
            tributes: data.tributes as Tribute[],
            totalPages: data.total_pages || 1
        };
    } catch (error) {
        console.error('[load] Error loading tributes:', error);

        // Return default values in case of failure
        return {
            tributes: [],
            totalPages: 1
        };
    }
};
