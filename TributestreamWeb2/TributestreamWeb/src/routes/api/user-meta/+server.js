import { error, json } from '@sveltejs/kit';

export const POST = async ({ request, cookies }) => {

    let token = cookies.get('jwt')
    try {
        const body = await request.json();
        console.log('Received payload at /api/user-meta:', body);

        const { user_id, meta_key, meta_value } = body;

        // Validate input
        if (!user_id || !meta_key || !meta_value) {
            console.error('Validation failed. Missing fields:', { user_id, meta_key, meta_value });
            throw error(400, 'user_id, meta_key, and meta_value are required.');
        }

        const apiUrl = 'https://wp.tributestream.com/wp-json/tributestream/v1/user-meta';

        const wpResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Corrected "Authorizaiton" typo and properly interpolated token
            },
            body: JSON.stringify({ user_id, meta_key, meta_value }) // Properly formatted JSON payload
        });

        if (!wpResponse.ok) {
            const errorData = await wpResponse.json();
            console.error('Error from WordPress API:', errorData);
            throw error(wpResponse.status, errorData.message || 'Failed to create meta entry.');
        }

        const responseData = await wpResponse.json();
        console.log('Meta entry successfully created:', responseData);
        return json(responseData, { status: 201 });
    } catch (err) {
        console.error('Error in POST:', err);
        throw error(500, err.message || 'Internal Server Error');
    }
};


/**
 * READ (GET) - Retrieve meta entries for a specific user
 */
export const GET = async ({ url }) => {
    try {
        const user_id = url.searchParams.get('user_id');
        if (!user_id) {
            throw error(400, 'user_id is required as a query parameter.');
        }

        const apiUrl = `https://wp.tributestream.com/wp-json/meta-write/v1/meta/${user_id}`;

        const wpResponse = await fetch(apiUrl);
        if (!wpResponse.ok) {
            const errorData = await wpResponse.json();
            throw error(wpResponse.status, errorData.message || 'Failed to fetch meta entries.');
        }

        const responseData = await wpResponse.json();
        return json(responseData);
    } catch (err) {
        console.error('Error in GET:', err);
        throw error(500, err.message || 'Internal Server Error');
    }
};

/**
 * UPDATE (PUT) - Update a meta entry
 */
export const PUT = async ({ request }) => {
    try {
        const { umeta_id, meta_key, meta_value } = await request.json();

        // Validate input
        if (!umeta_id || !meta_key || !meta_value) {
            throw error(400, 'umeta_id, meta_key, and meta_value are required.');
        }

        const apiUrl = `https://wp.tributestream.com/wp-json/meta-write/v1/meta/${umeta_id}`;

        const wpResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ meta_key, meta_value }),
        });

        if (!wpResponse.ok) {
            const errorData = await wpResponse.json();
            throw error(wpResponse.status, errorData.message || 'Failed to update meta entry.');
        }

        const responseData = await wpResponse.json();
        return json(responseData);
    } catch (err) {
        console.error('Error in PUT:', err);
        throw error(500, err.message || 'Internal Server Error');
    }
};

/**
 * DELETE - Remove a meta entry
 */
export const DELETE = async ({ request }) => {
    try {
        const { umeta_id } = await request.json();

        // Validate input
        if (!umeta_id) {
            throw error(400, 'umeta_id is required.');
        }

        const apiUrl = `https://wp.tributestream.com/wp-json/meta-write/v1/meta/${umeta_id}`;

        const wpResponse = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!wpResponse.ok) {
            const errorData = await wpResponse.json();
            throw error(wpResponse.status, errorData.message || 'Failed to delete meta entry.');
        }

        const responseData = await wpResponse.json();
        return json(responseData);
    } catch (err) {
        console.error('Error in DELETE:', err);
        throw error(500, err.message || 'Internal Server Error');
    }
};
