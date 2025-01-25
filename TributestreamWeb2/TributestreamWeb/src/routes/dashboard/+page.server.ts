import type { PageServerLoad } from './$types';
import type { Tribute } from '../../types/tribute';

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        // Default to fetching latest 10 tributes
        const response = await fetch('/api/tributes?page=1&per_page=10');
        if (!response.ok) {
            throw new Error('Failed to fetch tributes');
        }

        const data = await response.json();
        return {
            tributes: data.tributes as Tribute[],
            totalPages: data.total_pages || 1
        };
    } catch (error) {
        console.error('Error loading tributes:', error);
        return {
            tributes: [],
            totalPages: 1
        };
    }
};
