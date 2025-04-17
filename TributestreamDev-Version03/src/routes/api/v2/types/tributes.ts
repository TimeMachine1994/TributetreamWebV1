/**
 * Tribute-specific interfaces for the API v2 endpoints
 */
import type { ApiResponse } from './index';

/**
 * Tribute interface representing a tribute page
 */
export interface Tribute {
  id: number;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  featured_image_url?: string;
  status: 'draft' | 'published' | 'private' | 'archived';
  created_at: string;
  updated_at: string;
  published_at?: string;
  author_id: number;
  author_name?: string;
  funeral_director_id?: number;
  funeral_director_name?: string;
  deceased_name: string;
  birth_date?: string;
  death_date?: string;
  funeral_date?: string;
  funeral_location?: string;
  meta_data?: Record<string, unknown>;
  categories?: string[];
  tags?: string[];
}

/**
 * Request for creating a new tribute
 */
export interface TributeCreateRequest {
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  featured_image_url?: string;
  status?: 'draft' | 'published' | 'private' | 'archived';
  author_id?: number;
  funeral_director_id?: number;
  deceased_name: string;
  birth_date?: string;
  death_date?: string;
  funeral_date?: string;
  funeral_location?: string;
  meta_data?: Record<string, unknown>;
  categories?: string[];
  tags?: string[];
}

/**
 * Request for updating an existing tribute
 */
export interface TributeUpdateRequest {
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  featured_image_url?: string;
  status?: 'draft' | 'published' | 'private' | 'archived';
  author_id?: number;
  funeral_director_id?: number;
  deceased_name?: string;
  birth_date?: string;
  death_date?: string;
  funeral_date?: string;
  funeral_location?: string;
  meta_data?: Record<string, unknown>;
  categories?: string[];
  tags?: string[];
}

/**
 * Response for a single tribute
 */
export interface TributeResponse extends ApiResponse {
  data?: Tribute;
}

/**
 * Response for a list of tributes
 */
export interface TributesListResponse extends ApiResponse {
  data?: Tribute[];
}
