import funeralHomesService from '$lib/api/services/funeral-homes.service';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Server load function for funeral home detail page
 */
export const load = async ({ params }) => {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      throw error(400, 'Invalid funeral home ID');
    }
    
    // Fetch funeral home with associated tributes
    const response = await funeralHomesService.getWithTributes(id);
    
    if (!response.data) {
      throw error(404, 'Funeral home not found');
    }
    
    return {
      funeralHome: response.data
    };
  } catch (err: any) {
    if (err.status === 404) {
      throw error(404, 'Funeral home not found');
    }
    
    console.error('Error loading funeral home:', err);
    throw error(500, 'Failed to load funeral home');
  }
};