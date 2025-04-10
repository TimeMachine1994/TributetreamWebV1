import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
  const token = cookies.get('jwt_token');
  
  if (!token) {
    throw redirect(302, '/login');
  }
  
  try {
    // Verify user is admin
    const userResponse = await fetch('https://wp.tributestream.com/wp-json/wp/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!userResponse.ok) {
      throw redirect(302, '/login');
    }
    
    const user = await userResponse.json();
    if (!user.roles.includes('administrator')) {
      throw redirect(302, '/login');
    }
    
    return {
      user
    };
  } catch (error) {
    throw redirect(302, '/login');
  }
};