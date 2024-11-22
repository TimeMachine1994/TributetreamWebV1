// Import the required libraries
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';

// Helper function to make REST API requests to the WordPress backend
async function fetchFromAPI(endpoint: string, method: string = 'GET', data: object | null = null) {
    const url = `https://wp.tributestream.com/wp-json/tributestream/v1/${endpoint}`;
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            // Include authentication and other headers as needed
        },
        credentials: 'include', // This helps include cookies for session management
        body: data ? JSON.stringify(data) : null
    };
    
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    return response.json();
}

// Fetch function to load the tributes into the admin page
export const load = async () => {
    try {
        // Fetching all tributes from the WordPress database
        const tributes = await fetchFromAPI('tribute');
        return { tributes };
    } catch (e) {
        console.error(e);
        throw error(500, 'Failed to load tributes');
    }
};

// Actions object for CRUD operations (used for form submissions)
export const actions: Actions = {
    // Action to create a new tribute
    createTribute: async ({ request }) => {
        const formData = await request.formData();
        const tribute = {
            user_id: formData.get('user_id'),
            loved_one_name: formData.get('loved_one_name'),
            slug: formData.get('slug')
        };

        try {
            await fetchFromAPI('tribute', 'POST', tribute);
        } catch (e) {
            console.error(e);
            throw error(500, 'Failed to create tribute');
        }

        // Redirect after successful creation
        throw redirect(303, '/admin');
    },

    // Action to update an existing tribute
    updateTribute: async ({ request }) => {
        const formData = await request.formData();
        const tribute_id = formData.get('tribute_id');
        const updatedData = {
            loved_one_name: formData.get('loved_one_name'),
            slug: formData.get('slug'),
            custom_html: formData.get('custom_html')
        };

        try {
            await fetchFromAPI(`tribute/${tribute_id}`, 'PUT', updatedData);
        } catch (e) {
            console.error(e);
            throw error(500, 'Failed to update tribute');
        }

        // Redirect after successful update
        throw redirect(303, '/admin');
    },

    // Action to delete a tribute
    deleteTribute: async ({ request }) => {
        const formData = await request.formData();
        const tribute_id = formData.get('tribute_id');

        try {
            await fetchFromAPI(`tribute/${tribute_id}`, 'DELETE');
        } catch (e) {
            console.error(e);
            throw error(500, 'Failed to delete tribute');
        }

        // Redirect after successful deletion
        throw redirect(303, '/admin');
    }
};
 
