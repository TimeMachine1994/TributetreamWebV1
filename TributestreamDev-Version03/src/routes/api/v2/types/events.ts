/**
 * Event-specific interfaces for the API v2 endpoints
 */
import type { ApiResponse } from './index';

/**
 * Event interface representing a scheduled event
 */
export interface Event {
  event_id: number;
  location_id: number;
  stream_html?: string;
  start_time: string;
  end_time: string;
  title?: string;
  description?: string;
  event_type?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Request for creating a new event
 */
export interface EventCreateRequest {
  location_id: number;
  stream_html?: string;
  start_time: string;
  end_time: string;
  title?: string;
  description?: string;
  event_type?: string;
}

/**
 * Request for updating an existing event
 */
export interface EventUpdateRequest {
  location_id?: number;
  stream_html?: string;
  start_time?: string;
  end_time?: string;
  title?: string;
  description?: string;
  event_type?: string;
}

/**
 * Response for a single event
 */
export interface EventResponse extends ApiResponse {
  data?: Event;
}

/**
 * Response for a list of events
 */
export interface EventsListResponse extends ApiResponse {
  data?: Event[];
}

/**
 * Query parameters for listing events
 */
export interface EventListQueryParams {
  page?: number;
  per_page?: number;
  location_id?: number;
  tribute_id?: number;
  active?: boolean; // If true, only returns events that haven't ended yet
  upcoming?: boolean; // If true, only returns events that haven't started yet
  past?: boolean; // If true, only returns events that have already ended
  start_date?: string; // Filter events starting on or after this date
  end_date?: string; // Filter events ending on or before this date
  sort_by?: 'start_time' | 'end_time' | 'title';
  sort_order?: 'asc' | 'desc';
}

/**
 * Event types
 */
export const EVENT_TYPES = {
  VISITATION: 'visitation',
  FUNERAL: 'funeral',
  MEMORIAL: 'memorial',
  RECEPTION: 'reception',
  BURIAL: 'burial',
  OTHER: 'other'
} as const;

/**
 * Event with additional location information
 */
export interface EventWithLocation extends Event {
  location?: {
    location_id: number;
    location_name: string;
    location_address: string;
  };
}

/**
 * Event with additional tribute information
 */
export interface EventWithTribute extends EventWithLocation {
  tribute?: {
    tribute_id: number;
    loved_ones_name: string;
    slugified_name: string;
  };
}