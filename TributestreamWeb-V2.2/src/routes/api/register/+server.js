import { error, json } from '@sveltejs/kit';

export async function POST({ request }) {
    console.log('POST handler invoked');
    
    try {
        // Parse the incoming JSON
        const { username, email, password, ...optionalFields } = await request.json();
        console.log('Request JSON parsed:', { username, email, password, optionalFields });

        // Validate required fields
        if (!username || !email || !password) {
            console.error('Validation failed: Missing required fields');
            // Throw a SvelteKit error with status 400
            throw error(400, 'Username, email, and password are required.');
        }

        // Construct the WordPress API URL (adjust if needed)
        const apiUrl = process.env.WORDPRESS_API_URL 
            || 'https://wp.tributestream.com/wp-json/tributestream/v1/register';

        // Sending request to WordPress API
        console.log('Sending POST request to API with payload:', {
            username,
            email,
            password
         });

        const wpResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
             })
        });

        console.log('Response status from WP:', wpResponse.status);

        // Check if the WP response is not OK
        if (!wpResponse.ok) {
            console.log('Response not OK. Attempting to parse error data...');
            let errorData;
            try {
                errorData = await wpResponse.json();
            } catch (parseErr) {
                // If JSON parse fails, use the WP response status text
                errorData = { error: wpResponse.statusText };
            }
            console.error('Error response data:', errorData);

            // Throw a SvelteKit error with the WP status code
            // and a readable message from WP (if available).
            throw error(wpResponse.status, errorData.error || 'WordPress API error');
        }

        // Parse the successful response from WP
        const data = await wpResponse.json();
        console.log('User successfully registered:', data);

        // Return a SvelteKit JSON response, with a 201 (Created) status
        return json(data, { status: 201 });
    } catch (err) {
        console.error('Error in registering user:', err.message, err.stack);
        // Throw a 500 if nothing more specific has been thrown already
        throw error(500, err.message || 'Internal Server Error');
    }
}
