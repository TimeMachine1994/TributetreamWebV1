import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
    // Check if user is logged in and is admin
    if (!locals.user?.isAdmin) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        // TODO: Replace with actual database query
        // This is mock data for now
        const tributes: App.Tribute[] = [
            {
                id: '1',
                user_id: '123',
                loved_one_name: 'John Doe',
                slug: 'john-doe',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                custom_html: null,
                phone_number: '555-0123',
                number_of_streams: 2
            },
            {
                id: '2',
                user_id: '124',
                loved_one_name: 'Jane Smith',
                slug: 'jane-smith',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                custom_html: null,
                phone_number: '555-0124',
                number_of_streams: 1
            }
        ];

        return json(tributes);
    } catch (error) {
        console.error('Error fetching tributes:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
