import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface TributeResponse {
    user_id: number;
    loved_one_name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

export const load: PageServerLoad = async ({ params }) => {
    try {
        console.log('Loading tribute for slug:', params.slug);
        const apiUrl = `https://wp.tributestream.com/wp-json/tributestream/v1/tribute/${params.slug}`;
        console.log('Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw error(404, {
                message: 'Tribute not found'
            });
        }

        const tributeData = await response.json() as TributeResponse;
        console.log('Loaded tribute:', tributeData);
        
        if (!tributeData || !tributeData.loved_one_name) {
            console.error('Invalid tribute data:', tributeData);
            throw error(500, {
                message: 'Invalid tribute data received'
            });
        }

        return {
            tribute: {
                name: tributeData.loved_one_name,
                custom_html: null // Add other fields as needed
            }
        };
    } catch (err) {
        console.error('Error loading tribute:', err);
        throw error(500, {
            message: 'Error loading tribute'
        });
    }
};
