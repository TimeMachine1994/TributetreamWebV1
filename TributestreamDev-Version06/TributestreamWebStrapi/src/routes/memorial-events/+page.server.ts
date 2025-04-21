import { error, redirect, fail } from '@sveltejs/kit';
import memorialEventsService from '$lib/api/services/memorial-events.service';
import tributesService from '$lib/api/services/tributes.service';

/**
 * Types for page data
 */
interface PageData {
  memorialEvents: any[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  tributes: any[];
  user: any;
  error?: string;
}

/**
 * Server load function for memorial events page
 */
export async function load({ url, locals }: { url: URL; locals: Record<string, any> }): Promise<PageData> {
  try {
    // Get pagination parameters from URL
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '9');

    // Fetch memorial events with pagination
    const memorialEventsResponse = await memorialEventsService.getAll(page, pageSize);

    // Fetch all tributes for the dropdown (limited to 100 for performance)
    const tributesResponse = await tributesService.getAll(1, 100);

    const defaultPagination = {
      page: 1,
      pageSize: 10,
      pageCount: 0,
      total: 0
    };

    // Return data for the page
    return {
      memorialEvents: memorialEventsResponse.data || [],
      pagination: memorialEventsResponse.meta?.pagination || defaultPagination,
      tributes: tributesResponse.data || [],
      user: locals.user || null,
      error: undefined
    };
  } catch (err) {
    console.error('Error loading memorial events:', err);
    return {
      memorialEvents: [],
      pagination: {
        page: 1,
        pageSize: 9,
        pageCount: 0,
        total: 0
      },
      tributes: [],
      user: locals.user || null,
      error: 'Failed to load memorial events. Please try again later.'
    };
  }
};

/**
 * Actions for the memorial events page
 */
export const actions = {
  /**
   * Create a new memorial event
   */
  create: async ({ request, locals }: { request: Request; locals: Record<string, any> }) => {
    // Check if user is authenticated
    if (!locals.user) {
      throw error(401, 'You must be logged in to create a memorial event');
    }

    try {
      const formData = await request.formData();
      
      // Extract form data
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const eventType = formData.get('eventType') as string;
      const startDate = formData.get('startDate') as string;
      const endDate = formData.get('endDate') as string;
      const location = formData.get('location') as string;
      const city = formData.get('city') as string;
      const state = formData.get('state') as string;
      const zipCode = formData.get('zipCode') as string;
      const tributeId = formData.get('tributeId') as string;

      // Basic validation
      if (!title || !eventType || !startDate || !tributeId) {
        return {
          type: 'failure',
          data: {
            message: 'Title, event type, start date, and tribute are required'
          }
        };
      }
      
      // Create the memorial event
      const eventData = {
        title,
        description,
        eventType,
        startDate,
        endDate: endDate || undefined,
        location,
        city,
        state,
        zipCode,
        tribute: { id: parseInt(tributeId, 10) }
      };

      // Check if tributeId is a valid number
      if (isNaN(eventData.tribute.id)) {
        return {
          type: 'failure',
          data: {
            message: 'Invalid tribute ID. Please select a valid tribute.'
          }
        };
      }

      const response = await memorialEventsService.create(eventData);

      // Redirect to the newly created memorial event's detail page
      throw redirect(303, `/memorial-events/${response.data.id}`);
    } catch (err) {
      console.error('Error creating memorial event:', err);
      
      return {
        type: 'failure',
        data: {
          message: 'Failed to create memorial event. Please try again.'
        }
      };
    }
  }
};