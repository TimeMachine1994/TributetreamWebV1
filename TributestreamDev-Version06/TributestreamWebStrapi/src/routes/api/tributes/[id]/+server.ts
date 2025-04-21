import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import tributesService from '$lib/api/services/tributes.service';

/**
 * GET handler for retrieving a specific tribute by ID
 */
export async function GET({ params }: RequestEvent) {
  try {
    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return json(
        { error: 'Invalid tribute ID' },
        { status: 400 }
      );
    }
    
    const response = await tributesService.getById(parseInt(id));
    
    if (!response.data) {
      return json(
        { error: 'Tribute not found' },
        { status: 404 }
      );
    }
    
    return json(response);
  } catch (error) {
    console.error(`Error fetching tribute ${params.id}:`, error);
    
    return json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tribute' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating a specific tribute by ID
 * Requires authentication and ownership
 */
export async function PUT({ params, request, locals }: RequestEvent) {
  // Check if user is authenticated
  if (!locals.user) {
    return json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return json(
        { error: 'Invalid tribute ID' },
        { status: 400 }
      );
    }
    
    // Get the tribute to check ownership
    const tributeId = parseInt(id);
    const existingTribute = await tributesService.getById(tributeId);
    
    if (!existingTribute.data) {
      return json(
        { error: 'Tribute not found' },
        { status: 404 }
      );
    }
    
    // Check ownership - allow funeral home directors and tribute owners
    const isOwner = existingTribute.data.attributes?.owner?.data?.id === locals.user.id;
    const isFuneralHomeDirector = existingTribute.data.attributes?.funeralHome?.data?.attributes?.director?.data?.id === locals.user.id;
    
    if (!isOwner && !isFuneralHomeDirector) {
      return json(
        { error: 'You do not have permission to update this tribute' },
        { status: 403 }
      );
    }
    
    // Update the tribute
    const body = await request.json();
    const response = await tributesService.update(tributeId, body);
    
    return json(response);
  } catch (error) {
    console.error(`Error updating tribute ${params.id}:`, error);
    
    return json(
      { error: error instanceof Error ? error.message : 'Failed to update tribute' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing a specific tribute by ID
 * Requires authentication and ownership
 */
export async function DELETE({ params, locals }: RequestEvent) {
  // Check if user is authenticated
  if (!locals.user) {
    return json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return json(
        { error: 'Invalid tribute ID' },
        { status: 400 }
      );
    }
    
    // Get the tribute to check ownership
    const tributeId = parseInt(id);
    const existingTribute = await tributesService.getById(tributeId);
    
    if (!existingTribute.data) {
      return json(
        { error: 'Tribute not found' },
        { status: 404 }
      );
    }
    
    // Only the tribute owner can delete it
    const isOwner = existingTribute.data.attributes?.owner?.data?.id === locals.user.id;
    
    if (!isOwner) {
      return json(
        { error: 'You do not have permission to delete this tribute' },
        { status: 403 }
      );
    }
    
    // Delete the tribute
    const response = await tributesService.delete(tributeId);
    
    return json(response);
  } catch (error) {
    console.error(`Error deleting tribute ${params.id}:`, error);
    
    return json(
      { error: error instanceof Error ? error.message : 'Failed to delete tribute' },
      { status: 500 }
    );
  }
}