import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies, fetch }) => {
    // First check if user is logged in
 

    // Get user data from cookie
    const userCookie = cookies.get('user');
    if (!userCookie) {
        throw redirect(303, '/login');
    }

    try {
        const userData = JSON.parse(userCookie);
        // If user is not admin, redirect them to schedule page
        if (!userData.isAdmin) {
            throw redirect(303, '/schedule');
        }
    } catch (error) {
        console.error('Error parsing user cookie:', error);
        throw redirect(303, '/login');
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
