import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setAuthCookie } from '$lib/auth/utils';
import { registerUser } from '$lib/api/auth.api';

/**
 * POST handler for user registration endpoint
 * Processes registration requests and creates a new user in Strapi
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        console.log('📝 [Register API] Received request body:', {
            username: body.username,
            email: body.email,
            role: body.role,
            password: body.password ? '********' : undefined
        });
        
        const { username, email, password, role } = body;
        
        // Validate required fields
        if (!username || !email || !password) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Username, email and password are required'
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }
        
        // Validate role if provided
        const validRoles = ['Family Contact', 'Funeral Director', 'Guest'];
        const userRole = role && validRoles.includes(role) ? role : 'Family Contact';
        
        console.log('🔄 [Register API] Attempting registration for:', email, 'with role:', userRole);

        try {
            // Call Strapi registration endpoint
            const data = await registerUser(username, email, password);
            
            // If registration was successful
            if (data.jwt) {
                console.log('✅ [Register API] Registration successful');
                
                // Store JWT token in an HTTP-only cookie
                setAuthCookie(cookies, data.jwt);
                
                // Construct a structured user object with role
                const structuredUser = {
                    id: data.user.id,
                    email: data.user.email,
                    username: data.user.username,
                    name: data.user.username, // Use username as name if not provided
                    role: userRole, // Set the role from form or default
                    authenticated: true
                };
                
                console.log('👤 [Register API] Returning structured user data:', structuredUser);
                
                // TODO: In a production environment, we would need to update the user's role in Strapi
                // This would typically involve a second API call to update the user with the selected role
                // For now, we're just returning the role with the response
                
                return json({
                    success: true,
                    user: structuredUser
                });
            }
            
            // If registration didn't return expected data
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Registration failed - invalid response from server'
                }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
        } catch (error: any) {
            console.error('❌ [Register API] Registration error:', error);
            
            // Handle specific Strapi error messages
            const errorMessage = error.message || 'An error occurred during registration';
            let statusCode = 400;
            
            // Check for specific error types
            if (errorMessage.includes('email') && errorMessage.includes('taken')) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message: 'This email is already registered'
                    }),
                    {
                        status: statusCode,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }
            
            if (errorMessage.includes('username') && errorMessage.includes('taken')) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message: 'This username is already taken'
                    }),
                    {
                        status: statusCode,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }
            
            return new Response(
                JSON.stringify({
                    success: false,
                    message: errorMessage
                }),
                {
                    status: statusCode,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }
    } catch (error) {
        console.error('🔴 [Register API] Server error:', error);
        // Safe error logging for unknown error type
        if (error instanceof Error) {
            console.error('🔴 [Register API] Error details:', {
                name: error.name,
                message: error.message,
                cause: error.cause
            });
        }
        return new Response(
            JSON.stringify({
                success: false,
                message: 'An unexpected error occurred during registration'
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