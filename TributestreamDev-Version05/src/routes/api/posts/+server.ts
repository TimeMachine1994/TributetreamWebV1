import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WP_API_URL, WP_API_NAMESPACE } from '$lib/utils/env';
import type { WPPost } from '$lib/types/wordpress.types';

/**
 * Posts API handler
 * 
 * This endpoint proxies requests to the WordPress REST API for posts.
 */
export const GET: RequestHandler = async ({ url, request, cookies }) => {
  try {
    // Get the JWT token from the cookie
    const token = cookies.get('wp_jwt_token');
    
    // Get query parameters
    const page = url.searchParams.get('page') || '1';
    const perPage = url.searchParams.get('per_page') || '10';
    const search = url.searchParams.get('search') || '';
    const categories = url.searchParams.get('categories') || '';
    const tags = url.searchParams.get('tags') || '';
    const author = url.searchParams.get('author') || '';
    const orderBy = url.searchParams.get('orderby') || 'date';
    const order = url.searchParams.get('order') || 'desc';
    const status = url.searchParams.get('status') || 'publish';
    
    // Build the WordPress API URL
    const wpApiUrl = new URL(`${WP_API_URL}/${WP_API_NAMESPACE}/posts`);
    
    // Add query parameters
    wpApiUrl.searchParams.set('page', page);
    wpApiUrl.searchParams.set('per_page', perPage);
    if (search) wpApiUrl.searchParams.set('search', search);
    if (categories) wpApiUrl.searchParams.set('categories', categories);
    if (tags) wpApiUrl.searchParams.set('tags', tags);
    if (author) wpApiUrl.searchParams.set('author', author);
    if (orderBy) wpApiUrl.searchParams.set('orderby', orderBy);
    if (order) wpApiUrl.searchParams.set('order', order);
    if (status) wpApiUrl.searchParams.set('status', status);
    
    // Set up headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    
    // Add authorization header if token exists
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Make the request to the WordPress API
    const response = await fetch(wpApiUrl.toString(), {
      method: 'GET',
      headers
    });
    
    // Get the response data
    const data = await response.json();
    
    // If the response is not OK, return an error
    if (!response.ok) {
      return json({
        success: false,
        message: data.message || 'Failed to fetch posts',
        status: response.status
      }, { status: response.status });
    }
    
    // Get pagination headers
    const totalItems = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');
    
    // Return the response
    return json({
      success: true,
      data,
      pagination: {
        total_items: totalItems ? parseInt(totalItems) : 0,
        total_pages: totalPages ? parseInt(totalPages) : 0,
        current_page: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch posts',
      status: 500
    }, { status: 500 });
  }
};

/**
 * Create a new post
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // Get the JWT token from the cookie
    const token = cookies.get('wp_jwt_token');
    
    // If no token, return unauthorized
    if (!token) {
      return json({
        success: false,
        message: 'Unauthorized',
        status: 401
      }, { status: 401 });
    }
    
    // Get the request body
    const body = await request.json();
    
    // Make the request to the WordPress API
    const response = await fetch(`${WP_API_URL}/${WP_API_NAMESPACE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    // Get the response data
    const data = await response.json();
    
    // If the response is not OK, return an error
    if (!response.ok) {
      return json({
        success: false,
        message: data.message || 'Failed to create post',
        status: response.status
      }, { status: response.status });
    }
    
    // Return the response
    return json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error creating post:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create post',
      status: 500
    }, { status: 500 });
  }
};