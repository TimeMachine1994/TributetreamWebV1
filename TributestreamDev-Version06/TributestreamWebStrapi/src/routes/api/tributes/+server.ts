import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import tributesService from '$lib/api/services/tributes.service';
import type { Tribute } from '$lib/types/strapi.types';

/**
 * GET handler for retrieving multiple tributes
 * Can be filtered by query parameters
 */
export async function GET({ url, locals }: RequestEvent) {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const userId = url.searchParams.get('userId');
    const funeralHomeId = url.searchParams.get('funeralHomeId');
    
    let response;
    
    if (userId) {
      // Get tributes by user ID
      response = await tributesService.getByUser(parseInt(userId), page, pageSize);
    } else if (funeralHomeId) {
      // Get tributes by funeral home ID
      response = await tributesService.getByFuneralHome(parseInt(funeralHomeId), page, pageSize);
    } else {
      // Get all tributes
      response = await tributesService.getAll(page, pageSize);
    }
    
    return json(response);
  } catch (error) {
    console.error('Error fetching tributes:', error);
    
    return json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tributes' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new tribute
 * Requires authentication
 */
export async function POST({ request, locals }: RequestEvent) {
  // Check if user is authenticated
  if (!locals.user) {
    return json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.lovedOnesFullName) {
      return json(
        { error: 'Loved one\'s full name is required' },
        { status: 400 }
      );
    }
    
    // Set the owner to the current user
    body.owner = { id: locals.user.id };
    
    // Create the tribute
    const response = await tributesService.create(body);
    
    return json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating tribute:', error);
    
    return json(
      { error: error instanceof Error ? error.message : 'Failed to create tribute' },
      { status: 500 }
    );
  }
}