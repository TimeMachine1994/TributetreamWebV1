import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { STRAPI_URL,} from '$lib/config';
import type { LoginCredentials, LoginResponse, AuthError } from '$lib/types/auth.types';

export const POST = async ({ request, cookies }: RequestEvent) => {
  try {
    // Get credentials from request body
    const credentials: LoginCredentials = await request.json();

    // Make request to Strapi authentication endpoint
    const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: credentials.identifier,
        password: credentials.password
      })
    });

    // Parse the response
    const data = await response.json();

    // If the response was not successful, throw an error
    if (!response.ok) {
      const error = data.error as AuthError;
      return json({ 
        success: false, 
        error: error.message || 'Authentication failed'
      }, { status: error.status || 400 });
    }

    // Extract JWT and user info from successful response
    const { jwt, user } = data as LoginResponse;

    // Store JWT in an HttpOnly cookie
    cookies.set('jwt', jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    // Return success response with minimal user information
    return json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return json({ 
      success: false, 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
};