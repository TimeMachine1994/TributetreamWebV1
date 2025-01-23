import { error, redirect } from '@sveltejs/kit';
import { VITE_SQUARE_APP_ID, VITE_SQUARE_LOCATION_ID } from '$env/static/private';
import type { PageServerLoad } from './$types';
import type { Cookies } from '@sveltejs/kit';

interface MetaItem {
    meta_key: string;
    meta_value: string;
}

export const load: PageServerLoad = async ({ fetch, cookies }: { fetch: typeof globalThis.fetch, cookies: Cookies }) => {

    console.log('🚀 Loading user meta data.');
     const user_id = cookies.get('user_id');
    if (!user_id) {
        console.error('❌ Missing "user_id" query parameter.');
         throw error(400, 'user_id is required as a query parameter.');
    }

    const token = cookies.get('jwt');
    if (!token) {
        console.error('❌ Missing JWT token in cookies.');
         throw error(401, 'Authentication required');
    }
    // If both checks pass, continue, otherwise redirect
    if (!token || !user_id) {
        console.error('❌ Authentication or user ID check failed.');
        redirect(303, '/');
    }
    try {
        const apiUrl = `https://wp.tributestream.com/wp-json/tributestream/v1/user-meta/${user_id}`;
        console.log('🔗 Fetching data from:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Error fetching user meta:', errorData);
            throw error(response.status, errorData.message || 'Failed to fetch user meta.');
        }

        const { meta } = await response.json();
        console.log('✅ User meta data retrieved:', meta);

        // Create an object with keys as meta_key and values as meta_value
        const metaObject = (meta as MetaItem[]).reduce((acc: Record<string, string>, { meta_key, meta_value }) => {
            acc[meta_key] = meta_value;
            return acc;
        }, {});

        const appId = VITE_SQUARE_APP_ID;
        const locationId = VITE_SQUARE_LOCATION_ID;

        
        return {
            appId, locationId,
            userMeta: metaObject,
        };
    } catch (err: unknown) {
        console.error('💥 Error in server load function:', err);
        const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
        throw error(500, errorMessage);
    }
};
