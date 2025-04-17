/**
 * Active Events API endpoints for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  formatPaginatedResponse,
  ensureAuthenticatedUser,
  createWpApiClient,
  parseQueryParams,
  getPaginationParams,
  getSortingParams
} from '../../utils';
import { 
  validatePagination
} from '../../utils/validation';
import type { 
  Event, 
  EventsListResponse, 
  EventListQueryParams
} from '../../types/events';

/**
 * GET handler for retrieving a list of active events
 * 
 * @route GET /api/v2/events/active
 * @param request The request object
 * @returns Response with paginated list of active events
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
  // Ensure user is authenticated
  const { token } = ensureAuthenticatedUser(cookies);
  
  // Parse query parameters
  const queryParams = parseQueryParams(url.searchParams) as EventListQueryParams;
  const { page, per_page } = getPaginationParams(queryParams);
  const { sort_by, sort_order } = getSortingParams(queryParams, 'start_time', 'asc');
  
  // Validate pagination parameters
  validatePagination(page, per_page);
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Build query parameters
  const queryString = new URLSearchParams();
  queryString.append('page', String(page));
  queryString.append('per_page', String(per_page));
  queryString.append('sort_by', sort_by);
  queryString.append('sort_order', sort_order);
  queryString.append('active', 'true'); // Only get active events
  
  // Add filters if provided
  if (queryParams.location_id) {
    queryString.append('location_id', String(queryParams.location_id));
  }
  
  if (queryParams.tribute_id) {
    queryString.append('tribute_id', String(queryParams.tribute_id));
  }
  
  // Get active events from WordPress API
  const eventsResponse = await wpClient.get<{
    events: Record<string, unknown>[];
    total?: number;
    headers?: { 'X-WP-Total'?: string };
  }>(`wp/v2/events?${queryString.toString()}`);
  
  // Extract events array and total count
  const events = Array.isArray(eventsResponse) ? eventsResponse : (eventsResponse.events || []);
  const totalEvents = eventsResponse.total || 
                   (eventsResponse.headers && eventsResponse.headers['X-WP-Total'] ? 
                    parseInt(eventsResponse.headers['X-WP-Total'], 10) : 
                    events.length);
  
  // Format event data
  const formattedEvents: Event[] = events.map((eventData: Record<string, unknown>) => {
    return {
      event_id: Number(eventData.event_id),
      location_id: Number(eventData.location_id),
      stream_html: eventData.stream_html ? String(eventData.stream_html) : undefined,
      start_time: String(eventData.start_time || ''),
      end_time: String(eventData.end_time || ''),
      title: eventData.title ? String(eventData.title) : undefined,
      description: eventData.description ? String(eventData.description) : undefined,
      event_type: eventData.event_type ? String(eventData.event_type) : undefined,
      created_at: eventData.created_at ? String(eventData.created_at) : undefined,
      updated_at: eventData.updated_at ? String(eventData.updated_at) : undefined
    };
  });
  
  // Return paginated response
  return formatPaginatedResponse<EventsListResponse['data']>(
    formattedEvents,
    totalEvents,
    page,
    per_page
  );
};
