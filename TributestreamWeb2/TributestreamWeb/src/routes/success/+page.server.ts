import { error as svelteError } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    console.log('🟢 Starting load function');

    const userId = cookies.get('user_id');
    console.log('🟡 Retrieved user ID:', userId);

    const jwtToken = cookies.get('jwt');
    console.log('🟡 Retrieved JWT token:', jwtToken);

    if (!userId) {
        console.error('🚨 Missing user ID in cookies');
        throw svelteError(400, 'User ID is missing');
    }

    if (!jwtToken) {
        console.error('🚨 Missing JWT token in cookies');
        throw svelteError(401, 'Authentication token missing');
    }

    try {
        console.log('🟢 Starting API requests for user data and meta');
        const [userDataResponse, userMetaResponse] = await Promise.all([
            fetch(`/api/user_data?id=${encodeURIComponent(userId)}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    Accept: 'application/json',
                },
            }),
            fetch(`/api/user-meta?user_id=${encodeURIComponent(userId)}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    Accept: 'application/json',
                },
            }),
        ]);

        console.log('🟡 API responses received, processing responses...');

        const handleResponse = async (response: Response, label: string) => {
            console.log(`🟢 Processing ${label} response`);
            const contentType = response.headers.get('content-type') || '';
            console.log(`🟡 ${label} response content type:`, contentType);

            if (!response.ok) {
                const errorText = contentType.includes('application/json')
                    ? await response.json()
                    : await response.text();
                console.error(`❌ ${label} API error (${response.status}):`, errorText);
                throw svelteError(response.status, errorText.message || errorText);
            }

            if (!contentType.includes('application/json')) {
                console.error(`❌ Unexpected content type for ${label}:`, contentType);
                throw svelteError(500, `Invalid content type in ${label} response`);
            }

            const result = await response.json();
            console.log(`✅ ${label} response processed successfully`, result);
            return result;
        };

        // Process and ensure serializability
        const [userData, userMeta] = await Promise.all([
            handleResponse(userDataResponse, 'user data'),
            handleResponse(userMetaResponse, 'user meta'),
        ]);

        // Serialize data to ensure it's plain JSON
        const serializedData = {
            success: true,
            userId: String(userId), // Ensure userId is a string
            userData: JSON.parse(JSON.stringify(userData)),
            userMeta: JSON.parse(JSON.stringify(userMeta)),
        };

        console.log('✅ Successfully loaded user data and meta:', serializedData);

        return serializedData;
    } catch (err) {
        console.error('💥 Error during load function execution:', {
            message: err?.message,
            status: err?.status || 500,
            stack: err?.stack,
        });

        if (err?.status) throw err;

        throw svelteError(500, 'Failed to load user data and meta.');
    }
};
