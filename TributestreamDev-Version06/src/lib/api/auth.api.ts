/**
 * Authentication API utilities for Strapi integration
 * Provides functions to handle user auth operations with the Strapi backend
 */

import { getStrapiUrl } from './client';

/**
 * Interface for the Strapi user registration response
 */
export interface RegistrationResponse {
    jwt: string;
    user: {
        id: number;
        username: string;
        email: string;
        provider?: string;
        confirmed?: boolean;
        blocked?: boolean;
        createdAt?: string;
        updatedAt?: string;
    }
}

/**
 * Interface for the Strapi login response
 */
export interface LoginResponse {
    jwt: string;
    user: {
        id: number;
        username: string;
        email: string;
        provider?: string;
        confirmed?: boolean;
        blocked?: boolean;
        createdAt?: string;
        updatedAt?: string;
    }
}

/**
 * Register a new user with Strapi
 * 
 * @param username - Username for the new account
 * @param email - Email address for the new account
 * @param password - Password for the new account
 * @returns Promise resolving to the Strapi registration response
 * @throws Error if registration fails
 */
export async function registerUser(username: string, email: string, password: string): Promise<RegistrationResponse> {
    console.log('🔐 Registering new user:', { username, email });
    
    try {
        const response = await fetch(getStrapiUrl('/api/auth/local/register'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Registration failed:', errorData);
            
            // Extract and format error message from Strapi
            let errorMessage = 'Registration failed';
            
            if (errorData.error) {
                if (typeof errorData.error === 'string') {
                    errorMessage = errorData.error;
                } else if (errorData.error.message) {
                    errorMessage = errorData.error.message;
                } else if (errorData.error.details?.errors?.length > 0) {
                    errorMessage = errorData.error.details.errors
                        .map((err: any) => err.message)
                        .join('. ');
                }
            }
            
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('✅ Registration successful for:', data.user.email);
        
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw error; // Re-throw the already formatted error
        }
        throw new Error('An unexpected error occurred during registration');
    }
}

/**
 * Login user with Strapi
 * 
 * @param identifier - Email or username
 * @param password - User password
 * @returns Promise resolving to the Strapi login response
 * @throws Error if login fails
 */
export async function loginUser(identifier: string, password: string): Promise<LoginResponse> {
    console.log('🔑 Logging in user:', { identifier });
    
    try {
        const response = await fetch(getStrapiUrl('/api/auth/local'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier,
                password
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Login failed:', errorData);
            
            // Extract and format error message from Strapi
            let errorMessage = 'Login failed';
            
            if (errorData.error) {
                if (typeof errorData.error === 'string') {
                    errorMessage = errorData.error;
                } else if (errorData.error.message) {
                    errorMessage = errorData.error.message;
                }
            }
            
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('✅ Login successful for:', data.user.email);
        
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw error; // Re-throw the already formatted error
        }
        throw new Error('An unexpected error occurred during login');
    }
}

/**
 * Updates a user's role in Strapi
 * Note: This functionality would require permissions in Strapi
 * Currently implemented as a placeholder for future implementation
 * 
 * @param userId - The user ID to update
 * @param role - The role to assign to the user
 * @param token - JWT token for authenticated access
 * @returns Promise resolving to the updated user data
 */
export async function updateUserRole(userId: number, role: string, token: string): Promise<any> {
    console.log('🔄 Updating role for user:', { userId, role });
    
    // This is a placeholder implementation
    // In a real implementation, this would make an API call to Strapi
    // to update the user's role using the admin API
    
    console.log('ℹ️ User role update functionality not implemented yet');
    return { success: false, message: 'Role update not implemented' };
    
    /* Real implementation would look something like:
    try {
        const response = await fetch(getStrapiUrl(`/api/users/${userId}`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                role: role
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Role update failed:', errorData);
            throw new Error(errorData.error?.message || 'Role update failed');
        }
        
        const data = await response.json();
        console.log('✅ Role updated successfully for user:', userId);
        
        return data;
    } catch (error) {
        console.error('❌ Role update error:', error);
        throw error;
    }
    */
}