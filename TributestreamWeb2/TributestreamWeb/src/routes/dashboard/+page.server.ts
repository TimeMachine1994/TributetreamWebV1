// import { fetchWithAuth } from '$lib/utils/fetchWithAuth';
// import type { RequestEvent } from '@sveltejs/kit';

// export async function load(event: RequestEvent) {
//     try {
//         const response = await fetchWithAuth(
//             'https://wp.tributestream.com/wp-json/custom/v1/wpa2_tributes',
//             {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             },
//             event
//         );
//         const wpa2_tributes = await response.json();
//         return { wpa2_tributes };
//     } catch (error) {
//         console.error('Error fetching wpa2_tributes:', error);
//         return { wpa2_tributes: [] };
//     }
// }import type { RequestEvent } from '@sveltejs/kit';import type { RequestEvent } from '@sveltejs/kit';
import { fetchWithAuth } from '$lib/utils/fetchWithAuth';

export async function load(event: RequestEvent) {
    const WORDPRESS_API_URL = 'https://wp.tributestream.com/wp-json/custom/v1';
    console.log('Starting data fetch from:', WORDPRESS_API_URL);

    try {
        console.log('Attempting to fetch tributes and streams...');
        
        const [tributesResponse, streamsResponse] = await Promise.all([
            fetchWithAuth(`${WORDPRESS_API_URL}/wpa2_tributes`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }, event),
            fetchWithAuth(`${WORDPRESS_API_URL}/streams`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }, event)
        ]);

        console.log('Raw tributes response:', tributesResponse);
        console.log('Raw streams response:', streamsResponse);

        const tributes = await tributesResponse.json();
        const streams = await streamsResponse.json();

        console.log('Parsed tributes data:', tributes);
        console.log('Parsed streams data:', streams);

        const formattedTributes = tributes.map(tribute => ({
            id: tribute.id,
            slug: tribute.slug,
            title: tribute.title,
            streamCount: tribute.stream_count || 1,
            created_at: tribute.created_at,
            user_id: tribute.user_id,
            views: tribute.views || 0,
            location: tribute.location || 'N/A'
        }));

        console.log('Formatted tributes:', formattedTributes);
        console.log('Final streams array:', streams);

        return {
            tributes: formattedTributes,
            streams: streams
        };

    } catch (error) {
        console.log('API fetch failed, error details:', error);
        console.log('Switching to test data mode');
        
        const testData = {
            tributes: [
                {
                    id: 1,
                    slug: "john-doe-memorial",
                    title: "Celebrating John Doe",
                    streamCount: 2,
                    created_at: "2024-01-15T10:00:00",
                    user_id: 101,
                    views: 1250,
                    location: "New York, NY"
                },
                {
                    id: 2,
                    slug: "mary-smith-tribute",
                    title: "In Memory of Mary Smith",
                    streamCount: 1,
                    created_at: "2024-01-16T15:30:00",
                    user_id: 102,
                    views: 850,
                    location: "Los Angeles, CA"
                }
            ],
            streams: [
                { id: 1, name: "Stream 1", url: "rtmp://stream1.example.com/live" },
                { id: 2, name: "Stream 2", url: "rtmp://stream2.example.com/live" },
                { id: 3, name: "Stream 3", url: "rtmp://stream3.example.com/live" }
            ]
        };

        console.log('Returning test data:', testData);
        return testData;
    }
}
