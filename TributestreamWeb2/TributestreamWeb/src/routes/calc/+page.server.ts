import { error } from '@sveltejs/kit';
import { SQUARE_SANDBOX_APP_ID, SQUARE_SANDBOX_ACCESS_TOKEN, SQUARE_LOCATION_ID } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies, }) => {

    console.log('🚀 Loading user meta data.');
     const user_id = cookies.get('user_id');
    if (!user_id) {
        console.error('❌ Missing "user_id" query parameter.');
    }

    const token = cookies.get('jwt');
    if (!token) {
        console.error('❌ Missing JWT token in cookies.');
    }
    // If both checks pass, continue, otherwise redirect
    if (!token || !user_id) {
        console.error('❌ Authentication or user ID check failed.');
        redirect(303, '/login');
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
        const metaObject = meta.reduce((acc, { meta_key, meta_value }) => {
            acc[meta_key] = meta_value;
            console.log(acc);
            return acc;
        }, {});

        
        return {
           
            meta,
        };
    } catch (err) {
        console.error('💥 Error in server load function:', err);
        throw error(500, err.message || 'Internal Server Error');
    }
};
