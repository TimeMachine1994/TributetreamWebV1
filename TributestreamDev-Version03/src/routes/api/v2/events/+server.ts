/**
 * Events API endpoints for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  formatPaginatedResponse,
  formatCreatedResponse,
  ensureAuthenticatedUser,
  createWpApiClient,
  parseQueryParams,
  getPaginationParams,
  getSortingParams
} from '../utils';
import { 
  validateRequired,
  validatePagination,
  validateDate
} from '../utils/validation';
import type { 
  Event, 
  EventCreateRequest, 
  EventsListResponse, 
  EventResponse,
  EventListQueryParams
} from '../types/events';
import { ApiErrors } from '../utils/error-handler';

/**
 * GET handler for retrieving a list of events
 * 
 * @route GET /api/v2/events
 * @param request The request object
 * @returns Response with paginated list of events
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
  
  // Add filters if provided
  if (queryParams.location_id) {
    queryString.append('location_id', String(queryParams.location_id));
  }
  
  if (queryParams.tribute_id) {
    queryString.append('tribute_id', String(queryParams.tribute_id));
  }
  
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

/**
 * POST handler for creating a new event
 * 
 * @route POST /api/v2/events
 * @param request The request object
 * @returns Response with created event data
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  // Ensure user is authenticated
  const { token } = ensureAuthenticatedUser(cookies);
  
  // Parse request body
  const data: EventCreateRequest = await request.json();
  
  // Validate required fields
  validateRequired(data, ['location_id', 'start_time', 'end_time']);
  
  // Validate date formats
  validateDate(data.start_time, 'Start time');
  validateDate(data.end_time, 'End time');
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Verify location exists
  const locationResponse = await wpClient.get<Record<string, unknown> | null>(`wp/v2/locations/${data.location_id}`)
    .catch(() => null);
  
  if (!locationResponse) {
    throw ApiErrors.notFound('Location');
  }
  
  // Get tribute ID from location to check access
  const tributeId = Number(locationResponse.tribute_id);
  
  // Verify tribute exists
  const tributeResponse = await wpClient.get<Record<string, unknown> | null>(`wp/v2/tributes/${tributeId}`)
    .catch(() => null);
  
  if (!tributeResponse) {
    throw ApiErrors.notFound('Tribute');
  }
  
  // Prepare create data
  const createData: Record<string, unknown> = {
    location_id: data.location_id,
    start_time: data.start_time,
    end_time: data.end_time
  };
  
  // Add optional fields if provided
  if (data.stream_html !== undefined) {
    createData.stream_html = data.stream_html;
  }
  
  if (data.title !== undefined) {
    createData.title = data.title;
  }
  
  if (data.description !== undefined) {
    createData.description = data.description;
  }
  
  if (data.event_type !== undefined) {
    createData.event_type = data.event_type;
  }
  
  // Create event in WordPress
  const createdEvent = await wpClient.post<Record<string, unknown>>('wp/v2/events', createData);
  
  // Format event data
  const formattedEvent: Event = {
    event_id: Number(createdEvent.event_id),
    location_id: Number(createdEvent.location_id),
    stream_html: createdEvent.stream_html ? String(createdEvent.stream_html) : undefined,
    start_time: String(createdEvent.start_time || ''),
    end_time: String(createdEvent.end_time || ''),
    title: createdEvent.title ? String(createdEvent.title) : undefined,
    description: createdEvent.description ? String(createdEvent.description) : undefined,
    event_type: createdEvent.event_type ? String(createdEvent.event_type) : undefined,
    created_at: createdEvent.created_at ? String(createdEvent.created_at) : undefined,
    updated_at: createdEvent.updated_at ? String(createdEvent.updated_at) : undefined
  };
  
  // Return created response
  return formatCreatedResponse<EventResponse['data']>(formattedEvent, 'Event');
};
