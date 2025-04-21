import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import strapiClient from '$lib/api/strapi-client';
import type { RegistrationData } from '$lib/types/strapi.types';

/**
 * POST handler for user registration
 */
export async function POST({ request, cookies }: RequestEvent) {
  try {
    const body = await request.json() as RegistrationData;
    
    // Validate required fields
    if (!body.username || !body.email || !body.password) {
      return json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (body.password.length < 8) {
      return json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Attempt registration with Strapi
    const response = await strapiClient.register(body);
    
    // Store JWT in secure, httpOnly cookie (expires in 30 days)
    cookies.set('jwt', response.jwt, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'strict'
    });
    
    // Don't send the JWT in the response body for security
    return json({
      user: response.user
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    return json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    );
  }
}