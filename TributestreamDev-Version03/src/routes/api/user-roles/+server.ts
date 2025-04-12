// src/routes/api/user-roles/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, fetch }) => {
  const userId = url.searchParams.get('user_id');
  
  if (!userId) {
    return json({ error: 'User ID is required' }, { status: 400 });
  }
  
  try {
    // Forward the request to WordPress REST API
    const response = await fetch(`https://wp.tributestream.com/wp-json/wp/v2/users/${userId}`);
    
    if (!response.ok) {
      return json({ error: 'Failed to fetch user data' }, { status: response.status });
    }
    
    const userData = await response.json();
    
    return json({
      roles: userData.roles || []
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};