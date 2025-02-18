// src/routes/api/me/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, cookies, fetch }) => {
    // Check for Authorization header first
    const authHeader = request.headers.get('Authorization');
    let token = authHeader?.split(' ')[1];
console.log('Authorization Header:', authHeader);

    // Only check cookies if no Authorization header token exists
    if (!token) {
        token = cookies.get('jwt');
    }

    // Single check for token existence
    if (!token) {
        return json({ error: 'Not authenticated' }, { status: 401 });
    }


  try {
    // Call the WordPress endpoint to get current user details.
    // Update the URL to match your WordPress domain.
    const wpResponse = await fetch('http://localhost:80/wp-json/wp/v2/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!wpResponse.ok) {
      // Forward the error from WordPress if token is invalid or expired.
      return json({ error: 'Invalid token' }, { status: 403 });
    }

    const wpData = await wpResponse.json();
    // WordPress should return the current user object which contains an "id" field.
    return json({ user_id: wpData.id });
  } catch (error) {
    console.error('Error fetching WordPress user data:', error);
    return json({ error: 'Error fetching user data' }, { status: 500 });
  }
};
