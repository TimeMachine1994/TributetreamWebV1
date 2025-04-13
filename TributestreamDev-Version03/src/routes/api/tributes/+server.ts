// src/routes/api/tributes/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTokenFromCookie } from '$lib/utils/cookie-auth';

// Base WordPress API URL - Updated to use tributestream/v1 endpoint
const WP_API_BASE = 'https://wp.tributestream.com/wp-json/tributestream/v1';

/**
 * GET handler for tributes list
 * Forwards the request to the WordPress API and returns the response
 */
export const GET: RequestHandler = async ({ request, cookies, url }) => {
    console.log('🚀 [Tributes API] GET request received.');
    
    try {
        // 1. Extract and validate query parameters
        const searchTerm = url.searchParams.get('search') || '';
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const perPage = parseInt(url.searchParams.get('per_page') || '10', 10);
        const userId = url.searchParams.get('user_id') || '';
        
        console.log(`🔍 [Tributes API] Processing search: "${searchTerm}", page: ${page}, per_page: ${perPage}${userId ? `, user_id: ${userId}` : ''}`);
        
        // 2. Build WordPress API query parameters
        const wpQueryParams = new URLSearchParams();
        
        // Forward all original query parameters to ensure compatibility
        for (const [key, value] of url.searchParams) {
            wpQueryParams.append(key, value);
        }
        
        // Ensure critical parameters are set correctly
        if (searchTerm) {
            // Make sure search parameter is set even if it was passed differently
            wpQueryParams.set('search', searchTerm);
        }
        
        // Ensure page and per_page are set
        wpQueryParams.set('page', page.toString());
        wpQueryParams.set('per_page', perPage.toString());
        
        if (userId) {
            wpQueryParams.set('user_id', userId);
        }
        
        // 3. Get token from cookies for authenticated requests
        const token = getTokenFromCookie(cookies);
        
        // 4. Build the WordPress API URL - Updated to use /tributes endpoint
        const wpApiUrl = `${WP_API_BASE}/tributes${wpQueryParams.toString() ? '?' + wpQueryParams.toString() : ''}`;
        console.log(`🔗 [Tributes API] Requesting: ${wpApiUrl}`);
        
        // 5. Make request to WordPress API
        const response = await fetch(wpApiUrl, {
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        });
        
        // 6. Process the response
        const data = await response.json();
        
        
        // 7. Handle error responses
        if (!response.ok) {
            console.error('❌ [Tributes API] WordPress returned an error:', data);
            return json({
                success: false,
                message: data.message || 'Failed to fetch tributes'
            }, { status: response.status });
        }
        
        // 8. Format the successful response
        // Extract data from the v1 API response
        const tributes = Array.isArray(data.tributes) ? data.tributes : [];
        const totalPages = data.total_pages || 1;
        const currentPage = data.current_page || 1;
        const totalItems = data.total_items || 0;
        
        const result = {
            success: true,
            tributes: tributes,
            total_pages: totalPages,
            current_page: currentPage,
            total_items: totalItems
        };
        
        console.log(`✅ [Tributes API] Found ${result.tributes.length} tributes (page ${result.current_page}/${result.total_pages}, total: ${result.total_items})`);
        
        
        return json(result);
    } catch (error) {
        console.error('🚨 [Tributes API] Error occurred while fetching tributes:', error);
        return json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
};

/**
 * POST handler for creating a new tribute
 * Forwards the request to the WordPress API and returns the response
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
    console.log('🚀 [Tributes API] POST request received.');
    
    try {
        // 1. Get token from cookies for authentication
        const token = getTokenFromCookie(cookies);
        
        // 2. Check if user is authenticated
        if (!token) {
            console.error('❌ [Tributes API] Authentication required for POST request');
            return json({
                success: false,
                message: 'Authentication required'
            }, { status: 401 });
        }
        
        // 3. Parse request body
        const requestBody = await request.json();
        console.log('📦 [Tributes API] Processing tribute creation request');
        
        // 4. Make request to WordPress API - Updated to use v1 endpoint
        const wpApiUrl = `${WP_API_BASE}/tributes`;
        console.log(`🔗 [Tributes API] Posting to: ${wpApiUrl}`);
        
        const response = await fetch(wpApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
        
        // 5. Process the response
        const data = await response.json();
        
        // 6. Handle error responses
        if (!response.ok) {
            console.error('❌ [Tributes API] WordPress returned an error:', data);
            return json({
                success: false,
                message: data.message || 'Failed to create tribute'
            }, { status: response.status });
        }
        
        // 7. Format the successful response for v1 API
        const result = {
            success: true,
            tribute_id: data.id || data.tribute_id || null,
            slugified_name: data.slug || data.slugified_name || null
        };
        
        console.log(`✅ [Tributes API] Tribute created successfully with ID: ${result.tribute_id}`);
        
        return json(result);
    } catch (error) {
        console.error('🚨 [Tributes API] Error occurred while creating tribute:', error);
        return json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
};