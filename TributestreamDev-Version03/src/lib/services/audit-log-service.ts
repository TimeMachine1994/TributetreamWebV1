/**
 * Audit Log Service
 * 
 * This service provides functionality for logging and retrieving audit logs
 * of administrative actions in the system.
 */

import { authStore } from './auth-service';
import { get } from 'svelte/store';

/**
 * Interface for an audit log entry
 */
export interface AuditLogEntry {
  id: number;
  user_id: number;
  user_name: string;
  action: 'create' | 'update' | 'delete' | string;
  entity_type: string;
  entity_id: number;
  changes: Record<string, { from: any; to: any }>;
  timestamp: string;
}

/**
 * Interface for audit log query parameters
 */
export interface AuditLogQueryParams {
  page?: number;
  per_page?: number;
  entity_type?: string;
  entity_id?: number;
  user_id?: number;
  action?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export const auditLogService = {
  /**
   * Log an administrative action
   * @param action The action performed (create, update, delete)
   * @param entityType The type of entity affected (user, tribute, etc.)
   * @param entityId The ID of the entity affected
   * @param changes The changes made to the entity
   * @returns Promise resolving to the created audit log entry
   */
  logAction: async (
    action: string,
    entityType: string,
    entityId: number,
    changes: Record<string, { from: any; to: any }>
  ): Promise<AuditLogEntry | null> => {
    try {
      // Get current user from auth store
      const authState = get(authStore);
      const user = authState.user;
      
      if (!user) {
        console.error('Cannot log action: No authenticated user');
        return null;
      }
      
      // Create audit log entry
      const response = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          entity_type: entityType,
          entity_id: entityId,
          changes
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to log action: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to log action');
      }
      
      return result.log;
    } catch (error) {
      console.error('Error logging action:', error);
      return null;
    }
  },
  
  /**
   * Get audit logs with optional filtering
   * @param params Query parameters for filtering logs
   * @returns Promise resolving to an array of audit log entries
   */
  getAuditLogs: async (params: AuditLogQueryParams = {}): Promise<AuditLogEntry[]> => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params.entity_type) queryParams.append('entity_type', params.entity_type);
      if (params.entity_id) queryParams.append('entity_id', params.entity_id.toString());
      if (params.user_id) queryParams.append('user_id', params.user_id.toString());
      if (params.action) queryParams.append('action', params.action);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);
      
      // Fetch audit logs
      const response = await fetch(`/api/audit-logs?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch audit logs');
      }
      
      return result.logs || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  },
  
  /**
   * Get a single audit log entry by ID
   * @param id The ID of the audit log entry to retrieve
   * @returns Promise resolving to the audit log entry
   */
  getAuditLog: async (id: number): Promise<AuditLogEntry | null> => {
    try {
      // Fetch audit log
      const response = await fetch(`/api/audit-logs/${id}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audit log: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch audit log');
      }
      
      return result.log || null;
    } catch (error) {
      console.error(`Error fetching audit log ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Delete an audit log entry
   * @param id The ID of the audit log entry to delete
   * @returns Promise resolving to a boolean indicating success
   */
  deleteAuditLog: async (id: number): Promise<boolean> => {
    try {
      // Delete audit log
      const response = await fetch(`/api/audit-logs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete audit log: ${response.status}`);
      }
      
      const result = await response.json();
      
      return result.success || false;
    } catch (error) {
      console.error(`Error deleting audit log ${id}:`, error);
      return false;
    }
  },
  
  /**
   * Clear all audit logs
   * @returns Promise resolving to a boolean indicating success
   */
  clearAuditLogs: async (): Promise<boolean> => {
    try {
      // Clear all audit logs
      const response = await fetch('/api/audit-logs/clear', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to clear audit logs: ${response.status}`);
      }
      
      const result = await response.json();
      
      return result.success || false;
    } catch (error) {
      console.error('Error clearing audit logs:', error);
      return false;
    }
  }
};