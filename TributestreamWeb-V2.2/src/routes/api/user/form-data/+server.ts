import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Using the same users array from auth endpoints
// In a real app, this would be a database
declare global {
    var users: { email: string; password: string; metadata?: any }[];
}

export const GET: RequestHandler = async ({ cookies }) => {
    // Check if user is logged in
    const userEmail = cookies.get('user');
    if (!userEmail) {
        return json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Find user
    const user = global.users.find(u => u.email === userEmail);
    if (!user) {
        return json({ message: 'User not found' }, { status: 404 });
    }

    // Return form data from metadata
    return json({
        formData: user.metadata || {}
    });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
    // Check if user is logged in
    const userEmail = cookies.get('user');
    if (!userEmail) {
        return json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Find user
    const user = global.users.find(u => u.email === userEmail);
    if (!user) {
        return json({ message: 'User not found' }, { status: 404 });
    }

    try {
        // Update user's metadata with form data
        const formData = await request.json();
        user.metadata = formData;

        return json({ message: 'Form data saved successfully' });
    } catch (error) {
        console.error('Error saving form data:', error);
        return json({ message: 'Failed to save form data' }, { status: 500 });
    }
};
