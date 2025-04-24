import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setAuthCookie } from '$lib/auth/utils';
import { getStrapiUrl } from '$lib/api/client';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        console.log('[Login API] Received request body:', body);
        
        const { email, password } = body;
        
        const strapiUrl = getStrapiUrl('/api/auth/local');
        const strapiUrl2 = getStrapiUrl('');

        console.log('[Login API] Attempting login with URL:', strapiUrl);
        console.log('[Login API] Request payload to Strapi:', {
            identifier: email,
            password: password ? '[REDACTED]' : 'missing'
        });

        // Make request to Strapi auth endpoint
        const response = await fetch(strapiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: email,
                password: password
            })
        });

        const data = await response.json();
        console.log('[Login API] Strapi response status:', response.status);
        console.log('[Login API] Strapi response:', data);

        // If authentication was successful
        if (response.ok && data.jwt) {
            // Store JWT token in an HTTP-only cookie
            setAuthCookie(cookies, data.jwt);
            const userRes = await fetch(`${getStrapiUrl}/api/users/${data.user.id}?populate[0]=role&populate[1]=contactInfo`, {
                headers: {
                  Authorization: `Bearer ${data.jwt}`
                }
              });
              console.log('[Login API] populate response:', userRes);

            return json({
                success: true,
                user: data.user,
                userRes
            });
        }

        // If authentication failed
        return new Response(
            JSON.stringify({
                success: false,
                message: data.error?.message || 'Invalid credentials'
            }),
            {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('[Login API] Login error:', error);
        // Safe error logging for unknown error type
        if (error instanceof Error) {
            console.error('[Login API] Error details:', {
                name: error.name,
                message: error.message,
                cause: error.cause
            });
        }
        return new Response(
            JSON.stringify({
                success: false,
                message: 'An error occurred during login'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
};
