import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface TributeResponse {
    id?: number;
    user_id?: number;
    title?: string;
    loved_one_name?: string;
    slug?: string;
    created_at?: string;
    updated_at?: string;
    content?: string;
    custom_html?: string | null;
    status?: string;
    date?: string;
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
        
        // Log all fields to help debug data structure issues
        console.log('[CUSTOM-LINK SERVER] Tribute data fields:', Object.keys(tributeData));
        
        // Get the name from either loved_one_name or title field, whichever is available
        const tributeName = tributeData.loved_one_name || tributeData.title || params.slug;
        
        if (!tributeName) {
            console.error('[CUSTOM-LINK SERVER] Invalid tribute data (no name):', tributeData);
            throw error(500, {
                message: 'Invalid tribute data received - missing name'
            });
        }

        console.log('[CUSTOM-LINK SERVER] Mapping tribute data with name:', tributeName);
        
        return {
            tribute: {
                name: tributeName,
                custom_html: tributeData.custom_html || null // Use actual custom_html if available
            }
        };
    } catch (err) {
        console.error('[CUSTOM-LINK SERVER] Error loading tribute:', err);
        throw error(500, {
            message: 'Error loading tribute'
        });
    }
};
