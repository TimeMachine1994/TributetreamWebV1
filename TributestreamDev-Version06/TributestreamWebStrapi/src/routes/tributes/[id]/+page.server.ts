import { error } from '@sveltejs/kit';
import tributesService from '$lib/api/services/tributes.service';
import memorialEventsService from '$lib/api/services/memorial-events.service';

// Define types manually since SvelteKit type generation might not be working
interface PageParams {
  id: string;
}

/**
 * Server load function for tribute detail page
 */
export const load = async ({ params }: { params: PageParams }) => {
  const tributeId = parseInt(params.id);
  
  if (isNaN(tributeId)) {
    throw error(400, 'Invalid tribute ID');
  }
  
  try {
    // Fetch tribute details
    const tributeResponse = await tributesService.getById(tributeId);
    
    if (!tributeResponse.data) {
      throw error(404, 'Tribute not found');
    }
    
    // Fetch memorial events related to this tribute
    const memorialEventsResponse = await memorialEventsService.getByTribute(tributeId);
    
    return {
      tribute: tributeResponse.data,
      memorialEvents: memorialEventsResponse.data || []
    };
  } catch (err: any) { // Type assertion for error handling
    console.error('Error loading tribute details:', err);
    
    if (err.status === 404) {
      throw error(404, 'Tribute not found');
    }
    
    throw error(500, 'Failed to load tribute details');
  }
};