import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTokenFromCookie } from '$lib/utils/cookie-auth';

/**
 * Endpoint to check if a user has a specific role or capability
 * GET /api/roles/check?userId=123&role=administrator
 * or
 * GET /api/roles/check?userId=123&capability=manage_options
 */
export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
    console.log('🔍 [Roles Check API] Checking user role');
    
    // Get token from cookies
    const token = getTokenFromCookie(cookies);
    
    if (!token) {
        console.error('❌ [Roles Check API] No authentication token found');
        return json({ 
            success: false, 
            message: 'Authentication required' 
        }, { status: 401 });
    }
    
    // Get parameters from URL
    const userId = url.searchParams.get('userId');
    const role = url.searchParams.get('role');
    const capability = url.searchParams.get('capability');
    
    // Validate parameters
    if (!userId) {
        console.error('❌ [Roles Check API] Missing userId parameter');
        return json({ 
            success: false, 
            message: 'userId parameter is required' 
        }, { status: 400 });
    }
    
    if (!role && !capability) {
        console.error('❌ [Roles Check API] Missing role or capability parameter');
        return json({ 
            success: false, 
            message: 'Either role or capability parameter is required' 
        }, { status: 400 });
    }
    
    try {
        // Make request to WordPress API
        const response = await fetch(`/tributestream/v1/users/${userId}/role`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ [Roles Check API] WordPress API error:', errorData);
            return json({ 
                success: false, 
                message: errorData.message || 'Failed to check user role' 
            }, { status: response.status });
        }
        
        const data = await response.json();
        console.log('✅ [Roles Check API] Received user role data:', data);
        
        // Check if user has the specified role
        if (role) {
            const hasRole = data.roles && data.roles.includes(role);
            return json({ 
                success: true, 
                hasRole,
                roles: data.roles
            });
        }
        
        // Check if user has the specified capability
        if (capability) {
            const hasCapability = data.capabilities && data.capabilities[capability];
            return json({ 
                success: true, 
                hasCapability,
                capabilities: Object.keys(data.capabilities || {}).filter(cap => data.capabilities[cap])
            });
        }
        
        // This should never happen due to earlier validation
        return json({ 
            success: false, 
            message: 'Invalid request' 
        }, { status: 400 });
        
    } catch (error) {
        console.error('🚨 [Roles Check API] Error:', error);
        return json({ 
            success: false, 
            message: 'Internal server error' 
        }, { status: 500 });
    }
};