import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import bcrypt from 'bcrypt';

// Using the same users array from register endpoint
// In a real app, this would be a database
declare global {
    var users: { email: string; password: string; metadata?: any }[];
}

if (!global.users) {
    global.users = [];
}

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
        return json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Find user
    const user = global.users.find(u => u.email === email);
    if (!user) {
        return json({ message: 'Invalid credentials' }, { status: 401 });
    }

    try {
        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return json({ message: 'Invalid credentials' }, { status: 401 });
        }

        // Set session cookie
        const sessionId = crypto.randomUUID();
        cookies.set('session', sessionId, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        // Store user email in session
        cookies.set('user', email, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        return json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        return json({ message: 'Login failed' }, { status: 500 });
    }
};
