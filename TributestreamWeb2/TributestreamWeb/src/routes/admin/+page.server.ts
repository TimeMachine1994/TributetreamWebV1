import type { PageServerLoad } from './$types';
 import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies }) => {
  // Retrieve JWT from cookies
  const token = cookies.get('jwt');

  // If token doesn't exist, redirect to login
  if (!token) {
    throw redirect(303, '/login');
  }

  try {
    // Make a GET request to fetch tributes
    const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/get-tributes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tributes');
    }

    const tributes = await response.json();
    return {
      tributes
    };
  } catch (error) {
    console.error('Error fetching tributes:', error);
    return {
      tributes: []
    };
  }
};
