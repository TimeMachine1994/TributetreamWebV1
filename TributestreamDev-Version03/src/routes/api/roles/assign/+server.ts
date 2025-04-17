import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTokenFromCookie, getUserFromCookie } from '$lib/utils/cookie-auth';

/**
 * Endpoint to assign a role to a user
 * POST /api/roles/assign
 * Body: { userId: "123", role: "editor" }
 * 
 * Requires admin privileges
 */
export const POST: RequestHandler = async ({ request, cookies, fetch }) => {
    console.log('🔄 [Roles Assign API] Assigning user role');
    
    // Get token and user from cookies
    const token = getTokenFromCookie(cookies);
    const currentUser = getUserFromCookie(cookies);
    
    if (!token || !currentUser) {
        console.error('❌ [Roles Assign API] No authentication token found');
        return json({ 
            success: false, 
            message: 'Authentication required' 
        }, { status: 401 });
    }
    
    // Check if current user is an admin
    const isAdmin = currentUser.roles && (
        currentUser.roles.includes('administrator') || 
        (currentUser.capabilities && currentUser.capabilities.manage_options)
    );
    
    if (!isAdmin) {
        console.error('❌ [Roles Assign API] User does not have admin privileges');
        return json({ 
            success: false, 
            message: 'Admin privileges required' 
        }, { status: 403 });
    }
    
    try {
        // Parse request body
        const data = await request.json();
        
        // Validate request data
        if (!data.userId) {
            console.error('❌ [Roles Assign API] Missing userId in request body');
            return json({ 
                success: false, 
                message: 'userId is required' 
            }, { status: 400 });
        }
        
        if (!data.role) {
            console.error('❌ [Roles Assign API] Missing role in request body');
            return json({ 
                success: false, 
                message: 'role is required' 
            }, { status: 400 });
        }
        
        // Make request to WordPress API
        const response = await fetch(`/tributestream/v1/users/${data.userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                role: data.role,
                user_type: data.userType // Optional
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ [Roles Assign API] WordPress API error:', errorData);
            return json({ 
                success: false, 
                message: errorData.message || 'Failed to assign user role' 
            }, { status: response.status });
        }
        
        const responseData = await response.json();
        console.log('✅ [Roles Assign API] Role assigned successfully:', responseData);
        
        return json({ 
            success: true, 
            message: 'Role assigned successfully',
            userId: data.userId,
            role: data.role
        });
        
    } catch (error) {
        console.error('🚨 [Roles Assign API] Error:', error);
        return json({ 
            success: false, 
            message: 'Internal server error' 
        }, { status: 500 });
    }
};