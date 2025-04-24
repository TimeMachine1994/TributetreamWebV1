import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

/**
 * Registration form validation error interface
 */
export interface RegistrationErrors {
    username?: string;
    email?: string;
    password?: string;
    role?: string;
}

/**
 * Action data interface for the registration form
 */
export interface ActionData {
    success?: boolean;
    message?: string;
    username?: string;
    email?: string;
    role?: string;
    errors?: RegistrationErrors;
    user?: any;
}

/**
 * Validates user registration input
 * 
 * @param username - User's desired username
 * @param email - User's email address
 * @param password - User's password
 * @param role - User's selected role
 * @returns RegistrationErrors object or null if validation passes
 */
export function validateRegistration(
    username: string, 
    email: string, 
    password: string,
    role: string
): RegistrationErrors | null {
    const errors: RegistrationErrors = {};
    let hasErrors = false;

    // Username validation
    if (!username || username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
        hasErrors = true;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.email = 'Please enter a valid email address';
        hasErrors = true;
    }

    // Password validation
    if (!password || password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
        hasErrors = true;
    }
    
    // Role validation
    const validRoles = ['Family Contact', 'Funeral Director', 'Guest'];
    if (!role || !validRoles.includes(role)) {
        errors.role = 'Please select a valid role';
        hasErrors = true;
    }

    return hasErrors ? errors : null;
}

export const actions = {
    /**
     * Default action handler for the registration form
     * Validates form data and calls the API endpoint to register the user
     */
    default: async ({ request, fetch }) => {
        console.log('🔵 Processing registration form submission');
        
        // Get form data
        const formData = await request.formData();
        const username = formData.get('username')?.toString() || '';
        const email = formData.get('email')?.toString() || '';
        const password = formData.get('password')?.toString() || '';
        const role = formData.get('role')?.toString() || '';
        
        console.log('📝 Registration form data received:', { 
            username, 
            email, 
            role,
            passwordLength: password ? password.length : 0 
        });
        
        // Client-side validation should already handle this, but we double-check
        const validationErrors = validateRegistration(username, email, password, role);
        if (validationErrors) {
            console.log('⚠️ Registration validation failed:', validationErrors);
            return fail(400, {
                username,
                email,
                role,
                errors: validationErrors,
                message: 'Please fix the errors in the form'
            });
        }
        
        try {
            console.log('🔄 Sending registration request to Strapi via API endpoint');
            
            // Use our internal API route which handles cookies and auth
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, role })
            });

            const data = await response.json();

            // If registration failed
            if (!response.ok) {
                console.error('❌ Registration failed:', data);
                
                // Handle specific error types
                if (data.message?.includes('email') && data.message?.includes('taken')) {
                    return fail(response.status, {
                        username,
                        email,
                        role,
                        errors: { 
                            email: 'This email is already registered' 
                        },
                        message: 'This email is already registered'
                    });
                }
                
                if (data.message?.includes('username') && data.message?.includes('taken')) {
                    return fail(response.status, {
                        username,
                        email,
                        role,
                        errors: { 
                            username: 'This username is already taken' 
                        },
                        message: 'This username is already taken'
                    });
                }
                
                return fail(response.status, {
                    username,
                    email,
                    role,
                    message: data.message || 'Registration failed'
                });
            }

            console.log('✅ Registration successful with Strapi');
            
            // Return successful response
            // The JWT cookie is already set by the API endpoint
            return {
                success: true,
                user: data.user
            };
        } catch (error) {
            console.error('🔴 Unexpected registration error:', error);
            return fail(500, {
                username,
                email,
                role,
                message: 'An unexpected error occurred during registration. Please try again later.'
            });
        }
    }
} satisfies Actions;