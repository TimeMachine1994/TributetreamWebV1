/**
 * Location-specific interfaces for the API v2 endpoints
 */
import type { ApiResponse } from './index';

/**
 * Location interface representing a physical location for events
 */
export interface Location {
  location_id: number;
  tribute_id: number;
  location_name: string;
  location_address: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Request for creating a new location
 */
export interface LocationCreateRequest {
  tribute_id: number;
  location_name: string;
  location_address: string;
  sort_order?: number;
}

/**
 * Request for updating an existing location
 */
export interface LocationUpdateRequest {
  tribute_id?: number;
  location_name?: string;
  location_address?: string;
  sort_order?: number;
}

/**
 * Response for a single location
 */
export interface LocationResponse extends ApiResponse {
  data?: Location;
}

/**
 * Response for a list of locations
 */
export interface LocationsListResponse extends ApiResponse {
  data?: Location[];
}

/**
 * Query parameters for listing locations
 */
export interface LocationListQueryParams {
  page?: number;
  per_page?: number;
  tribute_id?: number;
  sort_by?: 'location_name' | 'sort_order';
  sort_order?: 'asc' | 'desc';
}

/**
 * Geocoded location data (for future use with maps)
 */
export interface GeocodedLocation {
  latitude: number;
  longitude: number;
  formatted_address: string;
  place_id?: string;
}

/**
 * Extended location with geocoding information
 */
export interface LocationWithGeocoding extends Location {
  geocoded?: GeocodedLocation;
}

/**
 * Request to geocode a location
 */
export interface GeocodeLocationRequest {
  location_id: number;
  address?: string; // If not provided, uses the location's address
}

/**
 * Response for a geocoded location
 */
export interface GeocodeLocationResponse extends ApiResponse {
  data?: GeocodedLocation;
}