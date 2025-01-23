import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
    // Check if user is logged in and is admin
    if (!locals.user?.isAdmin) {
        throw redirect(302, '/login');
    }

    try {
        // Fetch tributes from the backend
        const response = await fetch('/api/tributes');
        if (!response.ok) {
            throw new Error('Failed to fetch tributes');
        }
        const tributes: App.Tribute[] = await response.json();

        return {
            tributes
        };
    } catch (error) {
        console.error('Error loading tributes:', error);
        return {
            tributes: []
        };
    }
};
