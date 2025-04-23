import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { strapi } from '@strapi/client';
const client = strapi({ baseURL: 'http://localhost:1338/api' });


export const POST: RequestHandler = async ({ request }) => {
    const { email, password } = await request.json();

    // TODO: Add actual authentication logic here
    // This is a placeholder implementation
    if (email === 'test@example.com' && password === 'password') {
        const result = await client.fetch('baseURL')
           
    
    }

    return new Response(
        JSON.stringify({ message: 'Invalid credentials' }), 
        { 
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
};
