import { error } from '@sveltejs/kit';

export const load = async ({ fetch, cookies }) => {
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
            return acc;
        }, {});

        return {
            userMeta: metaObject,
        };
    } catch (err) {
        console.error('💥 Error in server load function:', err);
        throw error(500, err.message || 'Internal Server Error');
    }
};
