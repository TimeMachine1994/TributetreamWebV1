import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    // Mock data structure matching our WordPress pages
    const mockPages = [
        {
            id: 1,
            title: 'Celebration of Life - John Smith',
            post_status: 'publish',
            post_date: '2024-03-15',
            meta: {
                customer_name: 'Mary Smith',
                stream_status: 'scheduled',
                celebration_date: '2024-04-01'
            }
        },
        {
            id: 2,
            title: 'Memorial Service - Robert Johnson',
            post_status: 'draft',
            post_date: '2024-03-16',
            meta: {
                customer_name: 'Sarah Johnson',
                stream_status: 'pending',
                celebration_date: '2024-04-15'
            }
        },
        {
            id: 3,
            title: 'Remembrance - Alice Williams',
            post_status: 'publish',
            post_date: '2024-03-17',
            meta: {
                customer_name: 'James Williams',
                stream_status: 'live',
                celebration_date: '2024-03-30'
            }
        }
    ];

    return {
        pages: mockPages,
        totalPages: mockPages.length,
        lastUpdated: new Date().toISOString()
    };
};
