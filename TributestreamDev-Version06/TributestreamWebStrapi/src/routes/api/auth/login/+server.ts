import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import strapiClient from '$lib/api/strapi-client';
import type { LoginCredentials } from '$lib/types/strapi.types';

/**
 * POST handler for user login
 */
export async function POST({ request, cookies }: RequestEvent) {
  try {
    const body = await request.json() as LoginCredentials;
    
    // Validate required fields
    if (!body.identifier || !body.password) {
      return json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      );
    }
    
    // Attempt login with Strapi
    const response = await strapiClient.login(body);
    
    // Store JWT in secure, httpOnly cookie (expires in 30 days)
    cookies.set('jwt', response.jwt, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD, // Use import.meta.env instead of process.env
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'strict'
    });
    
    // Don't send the JWT in the response body for security
    return json({
      user: response.user
    });
  } catch (error) {
    console.error('Login error:', error);
    
    return json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 401 }
    );
  }
}