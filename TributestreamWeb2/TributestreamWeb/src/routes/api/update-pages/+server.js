export async function POST({ request }) {
    try {
        console.log('Starting POST request processing');
        const { slug } = await request.json();
        console.log('Received slug:', slug);

        const user = 'Slug_Creator';
        console.log('Using user:', user);
        console.log('SLUG_CREATOR_LOGIN exists:', !!process.env.SLUG_CREATOR_LOGIN);

        // Login attempt
        console.log('Attempting login to WordPress JWT endpoint');
        const loginResponse = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: process.env.SLUG_CREATOR_LOGIN })
        });

        console.log('Login response status:', loginResponse.status);
        console.log('Login response headers:', Object.fromEntries(loginResponse.headers));

        if (!loginResponse.ok) {
            const errorData = await loginResponse.json();
            console.error('Login failed - Full error details:', {
                status: loginResponse.status,
                statusText: loginResponse.statusText,
                error: errorData
            });
            return new Response(JSON.stringify({ error: 'Authentication failed', details: errorData }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const tokenData = await loginResponse.json();
        console.log('Token received successfully');

        const wpApiUrl = 'https://wp.tributestream.com/wp-json/wp/v2/posts/9047';
        console.log('Attempting WordPress update at:', wpApiUrl);

        const updateResponse = await fetch(wpApiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenData.token}`
            },
            body: JSON.stringify({
                fields: {
                    new_slug: slug
                }
            })
        });

        console.log('Update response status:', updateResponse.status);
        console.log('Update response headers:', Object.fromEntries(updateResponse.headers));

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error('WordPress update failed - Full error details:', {
                status: updateResponse.status,
                statusText: updateResponse.statusText,
                error: errorData,
                requestBody: { fields: { new_slug: slug } }
            });
            return new Response(JSON.stringify({ error: 'Update failed', details: errorData }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Update completed successfully');
        return new Response(JSON.stringify({ message: 'Slug updated successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Critical error in POST handler:', {
            error: error.message,
            stack: error.stack,
            name: error.name
        });
        return new Response(JSON.stringify({ error: 'Server error', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
