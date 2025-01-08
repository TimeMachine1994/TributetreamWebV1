import fetch from 'node-fetch';

export async function registerUser(details) {
    const { username, email, password, ...optionalFields } = details;

    if (!username || !email || !password) {
        throw new Error('Username, email, and password are required.');
    }

    const apiUrl = process.env.WORDPRESS_API_URL || 'https://wp.tributestream.com/wp-json/home/v1/register/';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                password,
                ...optionalFields,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to register user: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in registering user:', error);
        throw new Error(`Error registering user: ${error.message}`);
    }
}
