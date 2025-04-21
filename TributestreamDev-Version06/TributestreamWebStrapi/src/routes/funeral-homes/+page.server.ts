import funeralHomesService from '$lib/api/services/funeral-homes.service';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Server load function for funeral homes list page
 */
export const load = async ({ url }) => {
  try {
    // Get pagination parameters from URL or use defaults
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    // Fetch funeral homes from API
    const response = await funeralHomesService.getAll(page, pageSize);
    
    return {
      funeralHomes: response.data || [],
      pagination: response.meta.pagination
    };
  } catch (err: any) {
    console.error('Error loading funeral homes:', err);
    throw error(500, 'Failed to load funeral homes');
  }
};