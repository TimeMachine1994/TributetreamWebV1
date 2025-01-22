import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import bcrypt from 'bcrypt';

// In a real app, you'd use a database
let users: { email: string; password: string; metadata?: any }[] = [];

export const POST: RequestHandler = async ({ request }) => {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
        return json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Check if user already exists
    if (users.find(user => user.email === email)) {
        return json({ message: 'User already exists' }, { status: 400 });
    }

    try {
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Store user
        users.push({ email, password: hashedPassword });

        return json({ message: 'Registration successful' }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return json({ message: 'Registration failed' }, { status: 500 });
    }
};
