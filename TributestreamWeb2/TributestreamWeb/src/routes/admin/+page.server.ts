import { error } from '@sveltejs/kit';

export async function load({ fetch }) {
    try {
        // Fetch tributes from the backend API
        const res = await fetch('http://wp.tributestream.com/wp-json/tributestream/v1/tribute');

        if (!res.ok) {
            throw error(res.status, 'Failed to fetch tributes');
        }

        const tributes = await res.json();

        // Pass tributes to the frontend
        return { tributes };
    } catch (err) {
        console.error('Error loading tributes:', err);
        throw error(500, 'An unexpected error occurred');
    }
}
