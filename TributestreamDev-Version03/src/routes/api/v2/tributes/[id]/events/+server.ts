/**
 * Events by Tribute API endpoints for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  formatPaginatedResponse,
  ensureAuthenticatedUser,
  createWpApiClient,
  parseQueryParams,
  getPaginationParams,
  getSortingParams
} from '../../../utils';
import { 
  validatePagination
} from '../../../utils/validation';
import type { 
  Event, 
  EventsListResponse, 
  EventListQueryParams
} from '../../../types/events';
import { ApiErrors } from '../../../utils/error-handler';

/**
 * GET handler for retrieving a list of events by tribute
 * 
 * @route GET /api/v2/tributes/:id/events
 * @param request The request object
 * @returns Response with paginated list of events for a tribute
 */
export const GET: RequestHandler = async ({ params, url, cookies }) => {
  // Ensure user is authenticated
  const { token } = ensureAuthenticatedUser(cookies);
  
  // Get tribute ID from params
  const tributeId = params.id;
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Get tribute data to check access
  const tributeData = await wpClient.get<Record<string, unknown> | null>(`wp/v2/tributes/${tributeId}`)
    .catch(() => null);
  
  // Check if tribute exists
  if (!tributeData || !tributeData.tribute_id) {
    throw ApiErrors.notFound('Tribute');
  }
  
  // Parse query parameters
  const queryParams = parseQueryParams(url.searchParams) as EventListQueryParams;
  const { page, per_page } = getPaginationParams(queryParams);
  const { sort_by, sort_order } = getSortingParams(queryParams, 'start_time', 'asc');
  
  // Validate pagination parameters
  validatePagination(page, per_page);
  
  // Build query parameters
  const queryString = new URLSearchParams();
  queryString.append('page', String(page));
  queryString.append('per_page', String(per_page));
  queryString.append('sort_by', sort_by);
  queryString.append('sort_order', sort_order);
  queryString.append('tribute_id', tributeId);
  
  // Add filters if provided
  if (queryParams.active !== undefined) {
    queryString.append('active', String(queryParams.active));
  }
  
  if (queryParams.upcoming !== undefined) {
    queryString.append('upcoming', String(queryParams.upcoming));
  }
  
  if (queryParams.past !== undefined) {
    queryString.append('past', String(queryParams.past));
  }
  
  if (queryParams.start_date) {
    queryString.append('start_date', queryParams.start_date);
  }
  
  if (queryParams.end_date) {
    queryString.append('end_date', queryParams.end_date);
  }
  
  // Get events from WordPress API
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
