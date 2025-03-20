import { fail, redirect } from '@sveltejs/kit';
import type { Actions, RequestEvent } from './$types';
import { setAuthCookies } from '$lib/utils/auth-helpers';

/**
 * Parse form data from FormData object
 * @param formData - FormData object from request
 * @returns Parsed form data object
 */
function parseFormData(formData: FormData) {
    return {
        username: formData.get('username') as string,
        password: formData.get('password') as string,
        rememberMe: formData.get('remember-me') === 'on'
    };
}

/**
 * Validate required form fields
 * @param data - Form data object
 * @returns Validation result with errors if any
 */
function validateForm(data: ReturnType<typeof parseFormData>) {
    const errors: string[] = [];
    
    if (!data.username || data.username.trim() === '') {
        errors.push('Email address is required');
    } else if (!data.username.includes('@')) {
        errors.push('Please enter a valid email address');
    }
    
    if (!data.password || data.password.trim() === '') {
        errors.push('Password is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

export const actions = {
    login: async ({ request, fetch, cookies }: RequestEvent) => {
        console.log('🚀 Starting login action.');
        
        try {
            // Step 1: Parse form data
            console.log('📝 Parsing form data...');
            const formData = await request.formData();
            const data = parseFormData(formData);
            
            // Step 2: Validate form data
            console.log('🔍 Validating form data...');
            const validation = validateForm(data);
            
            if (!validation.isValid) {
                console.error('❌ Validation errors:', validation.errors);
                
                // Map validation errors to form field names
                const fieldErrors: Record<string, string> = {};
                
                validation.errors.forEach(error => {
                    if (error.includes('Email')) {
                        fieldErrors['username'] = error;
                    } else if (error.includes('Password')) {
                        fieldErrors['password'] = error;
                    }
                });
                
                return fail(400, {
                    error: true,
                    message: validation.errors.join('. '),
                    errors: fieldErrors,
                    formData: {
                        username: data.username,
                        password: '' // Never return passwords
                    }
                });
            }
            
            // Step 3: Authenticate using the auth API
            console.log('🔄 Authenticating user...');
            const authResponse = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: data.username,
                    password: data.password
                })
            });
            
            // Step 4: Handle authentication errors
            if (!authResponse.ok) {
                const authError = await authResponse.json();
                console.error('❌ Authentication failed:', authError);
                
                return fail(authResponse.status, { 
                    error: true, 
                    message: authError.message || 'Invalid email or password. Please try again.',
                    formData: {
                        username: data.username,
                        password: '' // Never return passwords
                    }
                });
            }
            
            // Step 5: Process successful authentication
            const authResult = await authResponse.json();
            console.log('✅ User authenticated successfully.');
            
            // Step 6: Store authentication tokens in cookies
            console.log('🍪 Setting authentication cookies...');
            setAuthCookies(cookies, authResult);
            
            // Step 7: Return success response
            return {
                success: true,
                message: 'Login successful! Redirecting to dashboard...',
                user: {
                    id: authResult.user_id,
                    name: authResult.user_display_name,
                    email: authResult.user_email
                }
            };
            
        } catch (error) {
            console.error('💥 Unexpected error during login:', error);
            
            return fail(500, {
                error: true,
                message: 'An unexpected error occurred. Please try again.',
                formData: {
                    username: '',
                    password: ''
                }
            });
        }
    }
} satisfies Actions;