/**
 * Utility functions for role-based access control
 */
import { parse } from 'cookie';

/**
 * Parse document.cookie string into a user object
 * @param cookieStr The document.cookie string
 * @returns User object or null
 */
export function parseUserFromCookieString(cookieStr: string): any {
    try {
        const cookies = parse(cookieStr);
        if (!cookies.user) return null;
        
        return JSON.parse(cookies.user);
    } catch (error) {
        console.error('Error parsing user from cookie string:', error);
        return null;
    }
}

/**
 * Interface for role check response
 */
export interface RoleCheckResponse {
    success: boolean;
    hasRole?: boolean;
    hasCapability?: boolean;
    roles?: string[];
    capabilities?: string[];
    message?: string;
}

/**
 * Check if a user has a specific role
 * @param userId The user ID to check
 * @param role The role to check for
 * @param fetchFn Optional fetch function (use event.fetch in server contexts)
 * @returns Promise resolving to a RoleCheckResponse
 */
export async function checkUserRole(
    userId: string | number,
    role: string,
    fetchFn: typeof fetch = fetch
): Promise<RoleCheckResponse> {
    try {
        const response = await fetchFn(`/api/roles/check?userId=${userId}&role=${role}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error checking user role:', errorData);
            return {
                success: false,
                message: errorData.message || 'Failed to check user role'
            };
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error checking user role:', error);
        return {
            success: false,
            message: 'An unexpected error occurred'
        };
    }
}

/**
 * Check if a user has a specific capability
 * @param userId The user ID to check
 * @param capability The capability to check for
 * @param fetchFn Optional fetch function (use event.fetch in server contexts)
 * @returns Promise resolving to a RoleCheckResponse
 */
export async function checkUserCapability(
    userId: string | number,
    capability: string,
    fetchFn: typeof fetch = fetch
): Promise<RoleCheckResponse> {
    try {
        const response = await fetchFn(`/api/roles/check?userId=${userId}&capability=${capability}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error checking user capability:', errorData);
            return {
                success: false,
                message: errorData.message || 'Failed to check user capability'
            };
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error checking user capability:', error);
        return {
            success: false,
            message: 'An unexpected error occurred'
        };
    }
}

/**
 * Assign a role to a user
 * @param userId The user ID to assign the role to
 * @param role The role to assign
 * @param userType Optional user type
 * @param fetchFn Optional fetch function (use event.fetch in server contexts)
 * @returns Promise resolving to the response data
 */
export async function assignUserRole(
    userId: string | number,
    role: string,
    userType?: string,
    fetchFn: typeof fetch = fetch
): Promise<any> {
    try {
        const response = await fetchFn('/api/roles/assign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                role,
                userType
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error assigning user role:', errorData);
            throw new Error(errorData.message || 'Failed to assign user role');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error assigning user role:', error);
        throw error;
    }
}

/**
 * Check if the current user is an administrator
 * @param user The user object from cookies
 * @returns Boolean indicating if the user is an admin
 */
export function isAdmin(user: any): boolean {
    if (!user) return false;
    
    // Check for administrator role
    if (user.roles && user.roles.includes('administrator')) {
        return true;
    }
    
    // Check for admin capabilities
    if (user.capabilities && user.capabilities.manage_options) {
        return true;
    }
    
    // Check for admin user type
    if (user.user_type === 'admin') {
        return true;
    }
    
    return false;
}