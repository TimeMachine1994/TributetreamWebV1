import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';

/**
 * POST /api/login
 * Handles user login
 */
export async function POST(event: RequestEvent) {
  try {
    const { username, password } = await event.request.json();
    
    // Validate required fields
    if (!username || !password) {
      return json({ error: 'Username and password are required' }, { status: 400 });
    }
    
    // In a real application, you would call the WordPress REST API to authenticate
    // For this example, we'll use a mock authentication
    if (username === 'admin' && password === 'password') {
      // Set a cookie with the JWT token
      event.cookies.set('jwt', 'mock-jwt-token', {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: !dev, // Use SvelteKit's dev environment variable
        maxAge: 60 * 60 * 24 // 1 day
      });
      
      return json({ success: true });
    }
    
    return json({ error: 'Invalid username or password' }, { status: 401 });
  } catch (err) {
    console.error('Login error:', err);
    return json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}