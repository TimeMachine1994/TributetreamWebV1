// src/routes/api/search/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const searchQuery = url.searchParams.get('search') || '';
    const page = url.searchParams.get('page') || '1';
    
    try {
        const response = await fetch(
            `https://tributestream.com/wp-json/wp/v2/search?search=${searchQuery}&page=${page}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch search results');
        }

        const data = await response.json();
        const totalPages = response.headers.get('X-WP-TotalPages');

        return json({
            results: data,
            totalPages: parseInt(totalPages || '1')
        });
    } catch (error) {
        return new Response('Search failed', { status: 500 });
    }
}