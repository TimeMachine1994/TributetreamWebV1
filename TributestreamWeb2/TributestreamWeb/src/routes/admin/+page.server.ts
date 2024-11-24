import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies }) => {
  // Retrieve JWT from cookies
  const token = cookies.get('jwt');

  // If no token, redirect to the login page
  if (!token) {
    throw redirect(303, '/login');
  }

  try {
    // Make a GET request to fetch all tributes
    const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tribute', {
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

export const actions: Actions = {
  // Action to create a new tribute
  createTribute: async ({ request, cookies }) => {
    const token = cookies.get('jwt');

    if (!token) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const loved_one_name = formData.get('loved_one_name') as string;
    const slug = formData.get('slug') as string;

    if (!loved_one_name || !slug) {
      return fail(400, { error: 'Loved one name and slug are required' });
    }

    try {
      const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ loved_one_name, slug })
      });

      if (!response.ok) {
        return fail(500, { error: 'Failed to create tribute' });
      }

      return {
        success: true,
        message: 'Tribute created successfully'
      };
    } catch (error) {
      console.error('Error creating tribute:', error);
      return fail(500, { error: 'Server error. Please try again later.' });
    }
  },

  // Action to delete a tribute
  deleteTribute: async ({ request, cookies }) => {
    const token = cookies.get('jwt');

    if (!token) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const tributeId = formData.get('tributeId') as string;

    if (!tributeId) {
      return fail(400, { error: 'Tribute ID is required' });
    }

    try {
      const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tribute/${tributeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return fail(500, { error: 'Failed to delete tribute' });
      }

      return {
        success: true,
        message: 'Tribute deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting tribute:', error);
      return fail(500, { error: 'Server error. Please try again later.' });
    }
  }
};
