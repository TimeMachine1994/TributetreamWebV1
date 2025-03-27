/**
 * Type definitions for event management
 */

/**
 * Represents an event in the system
 */
export interface Event {
  event_id: string;
  location_id: string;
  stream_html?: string;
  start_time: string;
  end_time: string;
  
  // Additional fields for UI display
  location_name?: string;
  location_address?: string;
  tribute_id?: string;
  tribute_name?: string;
}

/**
 * Response format for event collections
 */
export interface EventCollection {
  events: Event[];
  total_pages: number;
  total_items: number;
  current_page: number;
}

/**
 * Response format when creating a new event
 */
export interface EventCreationResult {
  success: boolean;
  event_id: string;
}

/**
 * Payload for creating a new event
 */
export interface CreateEventPayload {
  location_id: string;
  stream_html?: string;
  start_time: string;
  end_time: string;
}

/**
 * Payload for updating an event
 */
export interface UpdateEventPayload {
  location_id?: string;
  stream_html?: string;
  start_time?: string;
  end_time?: string;
}

/**
 * Helper function to check if an event is currently live
 */
export function isEventLive(event: Event): boolean {
  const now = new Date();
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);
  return now >= startTime && now <= endTime;
}

/**
 * Helper function to check if an event is upcoming
 */
export function isEventUpcoming(event: Event): boolean {
  const now = new Date();
  const startTime = new Date(event.start_time);
  return now < startTime;
}

/**
 * Helper function to check if an event has ended
 */
export function isEventEnded(event: Event): boolean {
  const now = new Date();
  const endTime = new Date(event.end_time);
  return now > endTime;
}

/**
 * Helper function to sort events by status and start time
 * Live events first, then upcoming events sorted by start time
 */
export function sortEventsByStatusAndTime(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    // First sort by live status
    const aIsLive = isEventLive(a);
    const bIsLive = isEventLive(b);
    
    if (aIsLive && !bIsLive) return -1;
    if (!aIsLive && bIsLive) return 1;
    
    // Then sort by start time
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });
}