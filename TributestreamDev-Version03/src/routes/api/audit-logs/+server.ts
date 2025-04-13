import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { accessControlService } from '$lib/services/access-control-service';
import type { AuditLogEntry } from '$lib/services/audit-log-service';

/**
 * GET handler for fetching audit logs
 * Supports filtering by various parameters
 */
export const GET: RequestHandler = async ({ request, locals, url }) => {
  try {
    // Check if user has admin access
    if (!accessControlService.hasAdminAccess()) {
      return json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 403 });
    }
    
    // Get query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('per_page') || '20');
    const entityType = url.searchParams.get('entity_type');
    const entityId = url.searchParams.get('entity_id') ? parseInt(url.searchParams.get('entity_id') as string) : undefined;
    const userId = url.searchParams.get('user_id') ? parseInt(url.searchParams.get('user_id') as string) : undefined;
    const action = url.searchParams.get('action');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const sortBy = url.searchParams.get('sort_by') || 'timestamp';
    const sortDirection = (url.searchParams.get('sort_direction') || 'desc') as 'asc' | 'desc';
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit') as string) : undefined;
    
    // In a real implementation, you would fetch logs from a database
    // For this MVP, we'll use mock data
    const mockLogs: AuditLogEntry[] = [
      {
        id: 1,
        user_id: 1,
        user_name: 'admin',
        action: 'create',
        entity_type: 'tribute',
        entity_id: 1,
        changes: { status: { from: null, to: 'draft' } },
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        user_id: 1,
        user_name: 'admin',
        action: 'update',
        entity_type: 'tribute',
        entity_id: 1,
        changes: { status: { from: 'draft', to: 'published' } },
        timestamp: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 3,
        user_id: 1,
        user_name: 'admin',
        action: 'create',
        entity_type: 'user',
        entity_id: 2,
        changes: { user: { from: null, to: { id: 2, name: 'John Doe' } } },
        timestamp: new Date(Date.now() - 900000).toISOString()
      },
      {
        id: 4,
        user_id: 1,
        user_name: 'admin',
        action: 'update',
        entity_type: 'user',
        entity_id: 2,
        changes: { role: { from: 'subscriber', to: 'editor' } },
        timestamp: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: 5,
        user_id: 1,
        user_name: 'admin',
        action: 'delete',
        entity_type: 'tribute',
        entity_id: 2,
        changes: { tribute: { from: { id: 2, title: 'Deleted Tribute' }, to: null } },
        timestamp: new Date(Date.now() - 300000).toISOString()
      }
    ];
    
    // Apply filters
    let filteredLogs = [...mockLogs];
    
    if (entityType) {
      filteredLogs = filteredLogs.filter(log => log.entity_type === entityType);
    }
    
    if (entityId) {
      filteredLogs = filteredLogs.filter(log => log.entity_id === entityId);
    }
    
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.user_id === userId);
    }
    
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
    }
    
    // Sort logs
    filteredLogs.sort((a, b) => {
      if (sortBy === 'timestamp') {
        return sortDirection === 'asc'
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      
      // Default sort by ID
      return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
    });
    
    // Apply pagination
    const totalLogs = filteredLogs.length;
    const totalPages = Math.ceil(totalLogs / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    // If limit is specified, return only that many logs
    const paginatedLogs = limit
      ? filteredLogs.slice(0, limit)
      : filteredLogs.slice(startIndex, endIndex);
    
    return json({
      success: true,
      logs: paginatedLogs,
      pagination: {
        page,
        per_page: perPage,
        total_logs: totalLogs,
        total_pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
};

/**
 * POST handler for creating a new audit log entry
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check if user has admin access
    if (!accessControlService.hasAdminAccess()) {
      return json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 403 });
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.action || !body.entity_type || !body.entity_id) {
      return json({
        success: false,
        message: 'Missing required fields: action, entity_type, entity_id'
      }, { status: 400 });
    }
    
    // In a real implementation, you would save the log to a database
    // For this MVP, we'll just return a mock response
    const newLog: AuditLogEntry = {
      id: Date.now(),
      user_id: 1, // In a real implementation, this would be the current user's ID
      user_name: 'admin', // In a real implementation, this would be the current user's name
      action: body.action,
      entity_type: body.entity_type,
      entity_id: body.entity_id,
      changes: body.changes || {},
      timestamp: new Date().toISOString()
    };
    
    return json({
      success: true,
      log: newLog
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
};