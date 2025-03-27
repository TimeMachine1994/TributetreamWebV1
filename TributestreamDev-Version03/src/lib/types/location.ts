/**
 * Type definitions for location management
 */

/**
 * Represents a location in the system
 */
export interface Location {
  location_id: string;
  tribute_id: string;
  location_name: string;
  location_address?: string;
  sort_order: number;
}

/**
 * Response format for location collections
 */
export interface LocationCollection {
  locations: Location[];
  total_pages: number;
  total_items: number;
  current_page: number;
}

/**
 * Response format when creating a new location
 */
export interface LocationCreationResult {
  success: boolean;
  location_id: string;
}

/**
 * Payload for creating a new location
 */
export interface CreateLocationPayload {
  tribute_id: string;
  location_name: string;
  location_address?: string;
  sort_order?: number;
}

/**
 * Payload for updating a location
 */
export interface UpdateLocationPayload {
  tribute_id?: string;
  location_name?: string;
  location_address?: string;
  sort_order?: number;
}