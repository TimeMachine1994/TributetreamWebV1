import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { accessControlService } from '$lib/services/access-control-service';
import { getTokenFromCookie } from '$lib/utils/cookie-auth';
import { auditLogService } from '$lib/services/audit-log-service';

/**
 * GET handler for fetching a specific user
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
  try {
    // Check if user has admin access
    if (!accessControlService.hasAdminAccess()) {
      return json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 403 });
    }
    
    const userId = params.id;
    
    // Get WordPress token from cookie
    const token = getTokenFromCookie(cookies);
    
    if (!token) {
      return json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    // Fetch user from WordPress API
    const response = await fetch(`${process.env.WP_API_URL}/wp/v2/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return json({
          success: false,
          message: 'User not found'
        }, { status: 404 });
      }
      
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }
    
    // Parse response data
    const wpUser = await response.json();
    
    // Transform WordPress user data to our format
    const user = {
      id: wpUser.id,
      username: wpUser.username,
      name: wpUser.name || '',
      display_name: wpUser.name || wpUser.username,
      email: wpUser.email,
      roles: wpUser.roles || [],
      status: wpUser.status || 'active',
      created_at: wpUser.registered_date || new Date().toISOString(),
      last_login: wpUser.last_login || null
    };
    
    return json({
      success: true,
      user
    });
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
};

/**
 * PUT handler for updating a user
 */
export const PUT: RequestHandler = async ({ params, request, cookies }) => {
  try {
    // Check if user has admin access
    if (!accessControlService.hasAdminAccess()) {
      return json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 403 });
    }
    
    const userId = params.id;
    
    // Get request body
    const body = await request.json();
    
    // Get WordPress token from cookie
    const token = getTokenFromCookie(cookies);
    
    if (!token) {
      return json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    // Fetch original user for audit log
    const originalResponse = await fetch(`${process.env.WP_API_URL}/wp/v2/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!originalResponse.ok) {
      if (originalResponse.status === 404) {
        return json({
          success: false,
          message: 'User not found'
        }, { status: 404 });
      }
      
      throw new Error(`WordPress API error: ${originalResponse.status} ${originalResponse.statusText}`);
    }
    
    const originalUser = await originalResponse.json();
    
    // Prepare data for WordPress API
    const wpUserData: Record<string, any> = {};
    
    // Only include fields that are provided in the request
    if (body.name !== undefined) wpUserData.name = body.name;
    if (body.email !== undefined) wpUserData.email = body.email;
    if (body.roles !== undefined) wpUserData.roles = body.roles;
    if (body.status !== undefined) wpUserData.status = body.status;
    
    // Update user in WordPress
    const response = await fetch(`${process.env.WP_API_URL}/wp/v2/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(wpUserData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `WordPress API error: ${response.status}`);
    }
    
    // Parse response data
    const wpUser = await response.json();
    
    // Transform WordPress user data to our format
    const user = {
      id: wpUser.id,
      username: wpUser.username,
      name: wpUser.name || '',
      display_name: wpUser.name || wpUser.username,
      email: wpUser.email,
      roles: wpUser.roles || [],
      status: wpUser.status || 'active',
      created_at: wpUser.registered_date || new Date().toISOString(),
      last_login: wpUser.last_login || null
    };
    
    // Prepare changes for audit log
    const changes: Record<string, { from: any; to: any }> = {};
    
    // Compare original and updated values
    if (body.name !== undefined && originalUser.name !== body.name) {
      changes.name = { from: originalUser.name, to: body.name };
    }
    
    if (body.email !== undefined && originalUser.email !== body.email) {
      changes.email = { from: originalUser.email, to: body.email };
    }
    
    if (body.roles !== undefined) {
      const originalRoles = originalUser.roles || [];
      const newRoles = body.roles || [];
      
      if (JSON.stringify(originalRoles) !== JSON.stringify(newRoles)) {
        changes.roles = { from: originalRoles, to: newRoles };
      }
    }
    
    if (body.status !== undefined && originalUser.status !== body.status) {
      changes.status = { from: originalUser.status, to: body.status };
    }
    
    // Log audit if there are changes
    if (Object.keys(changes).length > 0) {
      await auditLogService.logAction(
        'update',
        'user',
        parseInt(userId),
        changes
      );
    }
    
    return json({
      success: true,
      user
    });
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
};

/**
 * DELETE handler for deleting a user
 */
export const DELETE: RequestHandler = async ({ params, cookies }) => {
  try {
    // Check if user has admin access
    if (!accessControlService.hasAdminAccess()) {
      return json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 403 });
    }
    
    const userId = params.id;
    
    // Get WordPress token from cookie
    const token = getTokenFromCookie(cookies);
    
    if (!token) {
      return json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    // Fetch original user for audit log
    const originalResponse = await fetch(`${process.env.WP_API_URL}/wp/v2/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!originalResponse.ok) {
      if (originalResponse.status === 404) {
        return json({
          success: false,
          message: 'User not found'
        }, { status: 404 });
      }
      
      throw new Error(`WordPress API error: ${originalResponse.status} ${originalResponse.statusText}`);
    }
    
    const originalUser = await originalResponse.json();
    
    // Delete user in WordPress
    const response = await fetch(`${process.env.WP_API_URL}/wp/v2/users/${userId}?force=true&reassign=1`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `WordPress API error: ${response.status}`);
    }
    
    // Log audit
    await auditLogService.logAction(
      'delete',
      'user',
      parseInt(userId),
      { user: { from: originalUser, to: null } }
    );
    
    return json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
};