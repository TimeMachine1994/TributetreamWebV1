import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { accessControlService } from '$lib/services/access-control-service';
import { getTokenFromCookie } from '$lib/utils/cookie-auth';
import { auditLogService } from '$lib/services/audit-log-service';

// Base WordPress API URL - Using v2 API consistently
const WP_API_BASE = 'https://wp.tributestream.com/wp-json/funeral/v2';

/**
 * GET handler for fetching tribute HTML content
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
    
    const tributeId = params.id;
    
    // Get WordPress token from cookie
    const token = getTokenFromCookie(cookies);
    
    if (!token) {
      return json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    // Fetch tribute from WordPress API using v2 API
    const response = await fetch(`${WP_API_BASE}/tribute-pages/${tributeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return json({
          success: false,
          message: 'Tribute not found'
        }, { status: 404 });
      }
      
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }
    
    // Parse response data
    const wpTribute = await response.json();
    
    // Extract HTML content - handle both v1 and v2 API field names
    const htmlContent = wpTribute.data?.page_html || wpTribute.data?.custom_html || wpTribute.content?.rendered || '';
    
    // Add id field for backward compatibility
    const tributeIdFromResponse = wpTribute.data?.tribute_id || wpTribute.id;
    
    return json({
      success: true,
      html: htmlContent,
      tribute_id: tributeIdFromResponse,
      id: tributeIdFromResponse // Add id field for backward compatibility
    });
  } catch (error) {
    console.error(`Error fetching tribute HTML ${params.id}:`, error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
};

/**
 * PUT handler for updating tribute HTML content
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
    
    const tributeId = params.id;
    
    // Get request body
    const body = await request.json();
    
    // Validate HTML content
    if (body.html === undefined) {
      return json({
        success: false,
        message: 'Missing required field: html'
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
    
    // Fetch original tribute for audit log using v2 API
    const originalResponse = await fetch(`${WP_API_BASE}/tribute-pages/${tributeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!originalResponse.ok) {
      if (originalResponse.status === 404) {
        return json({
          success: false,
          message: 'Tribute not found'
        }, { status: 404 });
      }
      
      throw new Error(`WordPress API error: ${originalResponse.status} ${originalResponse.statusText}`);
    }
    
    const originalTribute = await originalResponse.json();
    
    // Update tribute in WordPress using v2 API
    const response = await fetch(`${WP_API_BASE}/tribute-pages/${tributeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        page_html: body.html, // v2 API field name
        custom_html: body.html // v1 API field name for compatibility
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `WordPress API error: ${response.status}`);
    }
    
    // Parse response data
    const wpTribute = await response.json();
    
    // Log audit
    await auditLogService.logAction(
      'update',
      'tribute',
      parseInt(tributeId),
      { content: { from: '(HTML content)', to: '(HTML content updated)' } }
    );
    
    // Add id field for backward compatibility
    const updatedTributeId = wpTribute.data?.tribute_id || wpTribute.id;
    
    return json({
      success: true,
      message: 'HTML content updated successfully',
      tribute_id: updatedTributeId,
      id: updatedTributeId // Add id field for backward compatibility
    });
  } catch (error) {
    console.error(`Error updating tribute HTML ${params.id}:`, error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
};