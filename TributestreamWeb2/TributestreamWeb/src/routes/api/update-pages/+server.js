export async function POST({ request }) {
    const { slug } = await request.json();

    const user = 'Slug_Creator';
    

    // Login to get the JWT token
    const loginResponse = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: process.env.SLUG_CREATOR_LOGIN })
    });

    if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        console.error('Login failed:', errorData);
        return { status: 401, body: 'Unauthorized' };
    }

    const tokenData = await loginResponse.json();

    const wpApiUrl = 'https://wp.tributestream.com/wp-json/wp/v2/posts/9047'; // Use the actual post ID

    try {
        const response = await fetch(wpApiUrl, {
            method: 'PUT', // Use PUT for updating an existing post
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenData.token}` // Use the token for authentication
            },
            body: JSON.stringify({
                fields: {
                    new_slug: slug
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error updating WordPress:', errorData);
            return { status: 500, body: 'Failed to update WordPress' };
        }

        return { status: 200, body: 'Slug updated successfully' };
    } catch (error) {
        console.error('Unexpected error:', error);
        return { status: 500, body: 'Unexpected server error' };
    }
}
