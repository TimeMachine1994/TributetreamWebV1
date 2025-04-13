import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { accessControlService } from '$lib/services/access-control-service';
import { getTokenFromCookie } from '$lib/utils/cookie-auth';
import { auditLogService } from '$lib/services/audit-log-service';

/**
 * POST handler for resetting a user's password
 */
export const POST: RequestHandler = async ({ params, request, cookies }) => {
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
    
    // Validate password
    if (!body.password || body.password.length < 8) {
      return json({
        success: false,
        message: 'Password must be at least 8 characters long'
      }, { status: 400 });
    }
    
    // Get WordPress token from cookie
    const token = getTokenFromCookie(cookies);
    
    if (!token) {
      return json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    // Update password in WordPress
    const response = await fetch(`${process.env.WP_API_URL}/wp/v2/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: body.password
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `WordPress API error: ${response.status}`);
    }
    
    // Log audit (don't include actual password in the log)
    await auditLogService.logAction(
      'update',
      'user',
      parseInt(userId),
      { password: { from: '********', to: '********' } }
    );
    
    return json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error(`Error resetting password for user ${params.id}:`, error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
};