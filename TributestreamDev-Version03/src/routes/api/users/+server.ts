import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { accessControlService } from '$lib/services/access-control-service';
import { getTokenFromCookie } from '$lib/utils/cookie-auth';

/**
 * GET handler for fetching users
 * Supports filtering, pagination, and sorting
 */
export const GET: RequestHandler = async ({ request, cookies, url }) => {
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
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || '';
    const status = url.searchParams.get('status') || '';
    const sortBy = url.searchParams.get('sort_by') || 'id';
    const sortDirection = (url.searchParams.get('sort_direction') || 'asc') as 'asc' | 'desc';
    const countOnly = url.searchParams.get('count_only') === 'true';
    
    // Get WordPress token from cookie
    const token = getTokenFromCookie(cookies);
    
    if (!token) {
      return json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    // Build WordPress API URL with query parameters
    let wpApiUrl = `${process.env.WP_API_URL}/wp/v2/users?`;
    
    // Add pagination
    wpApiUrl += `page=${page}&per_page=${perPage}`;
    
    // Add search if provided
    if (search) {
      wpApiUrl += `&search=${encodeURIComponent(search)}`;
    }
    
    // Add role filter if provided
    if (role) {
      wpApiUrl += `&role=${encodeURIComponent(role)}`;
    }
    
    // Add ordering
    wpApiUrl += `&orderby=${sortBy}&order=${sortDirection}`;
    
    // If count only, we just need the headers
    if (countOnly) {
      wpApiUrl += '&per_page=1';
    }
    
    // Fetch users from WordPress API
    const response = await fetch(wpApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }
    
    // Get total counts from headers
    const totalUsers = parseInt(response.headers.get('X-WP-Total') || '0');
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');
    
    // If count only, return counts
    if (countOnly) {
      // Get active/inactive counts (this would require additional API calls in a real implementation)
      // For now, we'll use mock data
      const activeCount = Math.floor(totalUsers * 0.8); // 80% active as an example
      const inactiveCount = totalUsers - activeCount;
      
      return json({
        success: true,
        total: totalUsers,
        active: activeCount,
        inactive: inactiveCount
      });
    }
    
    // Parse response data
    const wpUsers = await response.json();
    
    // Transform WordPress user data to our format
    const users = wpUsers.map((wpUser: any) => ({
      id: wpUser.id,
      username: wpUser.username,
      name: wpUser.name || '',
      display_name: wpUser.name || wpUser.username,
      email: wpUser.email,
      roles: wpUser.roles || [],
      status: wpUser.status || 'active',
      created_at: wpUser.registered_date || new Date().toISOString(),
      last_login: wpUser.last_login || null
    }));
    
    return json({
      success: true,
      users,
      pagination: {
        page,
        per_page: perPage,
        total_users: totalUsers,
        total_pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
};

/**
 * POST handler for creating a new user
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
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
    if (!body.username || !body.email || !body.password) {
      return json({
        success: false,
        message: 'Missing required fields: username, email, password'
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
    
    // Prepare data for WordPress API
    const wpUserData = {
      username: body.username,
      email: body.email,
      password: body.password,
      name: body.name || '',
      roles: body.roles || ['subscriber']
    };
    
    // Create user in WordPress
    const response = await fetch(`${process.env.WP_API_URL}/wp/v2/users`, {
      method: 'POST',
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
      last_login: null
    };
    
    return json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
};