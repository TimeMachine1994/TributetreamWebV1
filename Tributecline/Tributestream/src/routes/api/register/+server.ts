import { json } from '@sveltejs/kit';
import type { RegisterData } from '$lib/types/api';
import { wpFetch, ApiError } from '$lib/utils/api';

export async function POST({ request }) {
  try {
    const data = await request.json() as RegisterData;
    
    // Basic validation
    if (!data.username || !data.email || !data.password) {
      return json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    try {
      const result = await wpFetch<{ user_id: number }>(
        '/register',
        {
          method: 'POST',
          body: JSON.stringify({
            username: data.username,
            email: data.email,
            password: data.password,
            meta: data.meta
          })
        }
      );

      return json({ success: true, user_id: result.user_id }, { status: 201 });
    } catch (error) {
      console.error('WordPress registration error:', error);
      return json(
        { 
          error: true, 
          message: error instanceof Error ? error.message : 'Registration failed'
        }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Registration endpoint error:', error);
    return json(
      { 
        error: true, 
        message: 'An unexpected error occurred during registration'
      }, 
      { status: 500 }
    );
  }
}
