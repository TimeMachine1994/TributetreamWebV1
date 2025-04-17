/**
 * Event by ID API endpoints for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  formatResponse,
  formatUpdatedResponse,
  formatDeletedResponse,
  ensureAuthenticatedUser,
  createWpApiClient
} from '../../utils';
import { 
  validateDate
} from '../../utils/validation';
import type { 
  Event, 
  EventUpdateRequest, 
  EventResponse 
} from '../../types/events';
import { ApiErrors } from '../../utils/error-handler';

/**
 * GET handler for retrieving an event by ID
 * 
 * @route GET /api/v2/events/:id
 * @param request The request object
 * @returns Response with event data
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
  // Ensure user is authenticated
  const { token } = ensureAuthenticatedUser(cookies);
  
  // Get event ID from params
  const eventId = params.id;
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Get event data from WordPress API
  const eventData = await wpClient.get<Record<string, unknown>>(`wp/v2/events/${eventId}`);
  
  // Check if event exists
  if (!eventData || !eventData.event_id) {
    throw ApiErrors.notFound('Event');
  }
  
  // Get location data to check access
  const locationId = Number(eventData.location_id);
  const locationData = await wpClient.get<Record<string, unknown>>(`wp/v2/locations/${locationId}`);
  
  // Check if location exists
  if (!locationData || !locationData.location_id) {
    throw ApiErrors.notFound('Location');
  }
  
  // Format event data
  const formattedEvent: Event = {
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
  
  // Return response
  return formatResponse<EventResponse['data']>(formattedEvent);
};

/**
 * PUT handler for updating an event by ID
 * 
 * @route PUT /api/v2/events/:id
 * @param request The request object
 * @returns Response with updated event data
 */
export const PUT: RequestHandler = async ({ params, request, cookies }) => {
  // Ensure user is authenticated
  const { token } = ensureAuthenticatedUser(cookies);
  
  // Get event ID from params
  const eventId = params.id;
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Get existing event to check if it exists
  const existingEvent = await wpClient.get<Record<string, unknown> | null>(`wp/v2/events/${eventId}`)
    .catch(() => null);
  
  // Check if event exists
  if (!existingEvent || !existingEvent.event_id) {
    throw ApiErrors.notFound('Event');
  }
  
  // Get location data to check access
  const locationId = Number(existingEvent.location_id);
  const locationData = await wpClient.get<Record<string, unknown>>(`wp/v2/locations/${locationId}`);
  
  // Check if location exists
  if (!locationData || !locationData.location_id) {
    throw ApiErrors.notFound('Location');
  }
  
  // Parse request body
  const data: EventUpdateRequest = await request.json();
  
  // Prepare update data
  const updateData: Record<string, unknown> = {};
  
  // Only include fields that are provided
  if (data.location_id !== undefined) {
    // Verify location exists if location_id is provided
    const newLocationResponse = await wpClient.get<Record<string, unknown> | null>(`wp/v2/locations/${data.location_id}`)
      .catch(() => null);
    
    if (!newLocationResponse) {
      throw ApiErrors.notFound('Location');
    }
    
    updateData.location_id = data.location_id;
  }
  
  if (data.start_time !== undefined) {
    validateDate(data.start_time, 'Start time');
    updateData.start_time = data.start_time;
  }
  
  if (data.end_time !== undefined) {
    validateDate(data.end_time, 'End time');
    updateData.end_time = data.end_time;
  }
  
  if (data.stream_html !== undefined) updateData.stream_html = data.stream_html;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.event_type !== undefined) updateData.event_type = data.event_type;
  
  // Update event in WordPress
  const updatedEvent = await wpClient.put<Record<string, unknown>>(`wp/v2/events/${eventId}`, updateData);
  
  // Format event data
  const formattedEvent: Event = {
    event_id: Number(updatedEvent.event_id),
    location_id: Number(updatedEvent.location_id),
    stream_html: updatedEvent.stream_html ? String(updatedEvent.stream_html) : undefined,
    start_time: String(updatedEvent.start_time || ''),
    end_time: String(updatedEvent.end_time || ''),
    title: updatedEvent.title ? String(updatedEvent.title) : undefined,
    description: updatedEvent.description ? String(updatedEvent.description) : undefined,
    event_type: updatedEvent.event_type ? String(updatedEvent.event_type) : undefined,
    created_at: updatedEvent.created_at ? String(updatedEvent.created_at) : undefined,
    updated_at: updatedEvent.updated_at ? String(updatedEvent.updated_at) : undefined
  };
  
  // Return updated response
  return formatUpdatedResponse<EventResponse['data']>(formattedEvent, 'Event');
};

/**
 * DELETE handler for deleting an event by ID
 * 
 * @route DELETE /api/v2/events/:id
 * @param request The request object
 * @returns Response with deleted event ID
 */
export const DELETE: RequestHandler = async ({ params, cookies }) => {
  // Ensure user is authenticated
  const { token } = ensureAuthenticatedUser(cookies);
  
  // Get event ID from params
  const eventId = params.id;
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Get existing event to check if it exists
  const existingEvent = await wpClient.get<Record<string, unknown> | null>(`wp/v2/events/${eventId}`)
    .catch(() => null);
  
  // Check if event exists
  if (!existingEvent || !existingEvent.event_id) {
    throw ApiErrors.notFound('Event');
  }
  
  // Get location data to check access
  const locationId = Number(existingEvent.location_id);
  const locationData = await wpClient.get<Record<string, unknown>>(`wp/v2/locations/${locationId}`);
  
  // Check if location exists
  if (!locationData || !locationData.location_id) {
    throw ApiErrors.notFound('Location');
  }
  
  // Delete event in WordPress
  await wpClient.delete(`wp/v2/events/${eventId}?force=true`);
  
  // Return deleted response
  return formatDeletedResponse(eventId, 'Event');
};
