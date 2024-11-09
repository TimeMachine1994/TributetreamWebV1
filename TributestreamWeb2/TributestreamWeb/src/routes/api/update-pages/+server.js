// src/routes/api/update-pages/+server.js

import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    const { slug } = await request.json();
    const token = request.headers.get('Authorization'); // Extract the token

    const wpApiUrl = 'https://wp.tributestream.com/wp-json/wp/v2/posts/{9047}'; // Replace {post_id} with the actual post ID

    try {
        const response = await fetch(wpApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token // Use the token for authentication
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
            return json({ success: false, error: 'Failed to update WordPress' }, { status: 500 });
        }

        return json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ success: false, error: 'Unexpected server error' }, { status: 500 });
    }
}
