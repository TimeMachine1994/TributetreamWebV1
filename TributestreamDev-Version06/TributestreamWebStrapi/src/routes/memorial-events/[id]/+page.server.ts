import { error } from '@sveltejs/kit';
import memorialEventsService from '$lib/api/services/memorial-events.service';
import type { MemorialEvent } from '$lib/types/strapi.types';

/**
 * Types for page data
 */
interface PageData {
  memorialEvent: MemorialEvent;
  tribute?: any;
  error?: string;
}

/**
 * Server load function for memorial event detail page
 */
export async function load({ params }: { params: { id: string } }): Promise<PageData> {
  const { id } = params;
  
  if (!id || isNaN(parseInt(id))) {
    throw error(400, 'Invalid memorial event ID');
  }
  
  try {
    // Fetch memorial event with related tribute
    const eventResponse = await memorialEventsService.getWithTribute(parseInt(id));
    
    if (!eventResponse.data) {
      throw error(404, 'Memorial event not found');
    }
    
    // Get the tribute data if it exists
    const tribute = (eventResponse.data.attributes as any).tribute?.data || null;
    
    return {
      memorialEvent: eventResponse.data,
      tribute
    };
  } catch (err: any) {
    console.error('Error loading memorial event:', err);
    
    // Check for specific error types and handle accordingly
    if (err.status === 404) {
      throw error(404, 'Memorial event not found');
    }
    
    throw error(500, err instanceof Error ? err.message : 'Failed to load memorial event');
  }
}