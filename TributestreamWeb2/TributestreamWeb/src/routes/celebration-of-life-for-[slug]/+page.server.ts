import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface TributeResponse {
    user_id: number;
    loved_one_name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

export const load: PageServerLoad = async ({ params, fetch }) => {
    try {
        console.log('[CUSTOM-LINK SERVER] Loading tribute for slug:', params.slug);
        const apiUrl = `api/tributes/by-slug/${params.slug}`;
        console.log('[CUSTOM-LINK SERVER] Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('[CUSTOM-LINK SERVER] Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[CUSTOM-LINK SERVER] Error response:', errorText);
            throw error(404, {
                message: 'Tribute not found'
            });
        }

        const tributeData = await response.json() as TributeResponse;
        console.log('[CUSTOM-LINK SERVER] Loaded tribute:', tributeData);
        
        if (!tributeData || !tributeData.loved_one_name) {
            console.error('[CUSTOM-LINK SERVER] Invalid tribute data:', tributeData);
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
        console.error('[CUSTOM-LINK SERVER] Error loading tribute:', err);
        throw error(500, {
            message: 'Error loading tribute'
        });
    }
};
