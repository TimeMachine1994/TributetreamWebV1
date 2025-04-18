/**
 * WordPress REST API type definitions
 * 
 * This file contains TypeScript interfaces for WordPress REST API entities.
 */

/**
 * WordPress REST API response with pagination
 */
export interface WPPaginatedResponse<T> {
  data: T[];
  total_items: number;
  total_pages: number;
  current_page: number;
}

/**
 * WordPress REST API success response
 */
export interface WPSuccessResponse<T> {
  success: boolean;
  data: T;
}

/**
 * WordPress REST API error response
 */
export interface WPErrorResponse {
  success: boolean;
  error: boolean;
  message: string;
  status: number;
}

/**
 * WordPress post status
 */
export const PostStatus = {
  PUBLISH: 'publish',
  DRAFT: 'draft',
  PENDING: 'pending',
  PRIVATE: 'private',
  TRASH: 'trash'
} as const;

export type PostStatusType = typeof PostStatus[keyof typeof PostStatus];

/**
 * WordPress post
 */
export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: PostStatusType;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: Record<string, any>;
  categories: number[];
  tags: number[];
  _links: Record<string, any>;
}

/**
 * WordPress page
 */
export interface WPPage extends Omit<WPPost, 'categories' | 'tags'> {
  parent: number;
  menu_order: number;
}

/**
 * WordPress media
 */
export interface WPMedia {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: PostStatusType;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  author: number;
  comment_status: string;
  ping_status: string;
  template: string;
  meta: Record<string, any>;
  description: {
    rendered: string;
  };
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: Record<string, {
      file: string;
      width: number;
      height: number;
      mime_type: string;
      source_url: string;
    }>;
    image_meta: Record<string, any>;
  };
  post: number;
  source_url: string;
  _links: Record<string, any>;
}

/**
 * WordPress user
 */
export interface WPUser {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: Record<string, string>;
  meta: Record<string, any>;
  _links: Record<string, any>;
}

/**
 * WordPress comment
 */
export interface WPComment {
  id: number;
  post: number;
  parent: number;
  author: number;
  author_name: string;
  author_url: string;
  date: string;
  date_gmt: string;
  content: {
    rendered: string;
  };
  link: string;
  status: string;
  type: string;
  author_avatar_urls: Record<string, string>;
  meta: Record<string, any>;
  _links: Record<string, any>;
}

/**
 * WordPress category
 */
export interface WPCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
  meta: Record<string, any>;
  _links: Record<string, any>;
}

/**
 * WordPress tag
 */
export interface WPTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  meta: Record<string, any>;
  _links: Record<string, any>;
}

/**
 * Tribute page
 */
export interface Tribute {
  tribute_id: number;
  created_by_user_id: number;
  point_of_contact_user_id: number;
  loved_ones_name: string;
  slugified_name: string;
  page_html: string;
  loved_ones_dob: string | null;
  loved_ones_dod: string | null;
}

/**
 * Tribute page create input
 */
export interface TributeCreateInput {
  created_by_user_id: number;
  point_of_contact_user_id?: number;
  loved_ones_name: string;
  slugified_name?: string;
  page_html?: string;
  loved_ones_dob?: string;
  loved_ones_dod?: string;
}

/**
 * Tribute page update input
 */
export interface TributeUpdateInput {
  created_by_user_id?: number;
  point_of_contact_user_id?: number;
  loved_ones_name?: string;
  slugified_name?: string;
  page_html?: string;
  loved_ones_dob?: string;
  loved_ones_dod?: string;
}

/**
 * Location
 */
export interface Location {
  location_id: number;
  tribute_id: number;
  location_name: string;
  location_address: string;
  sort_order: number;
}

/**
 * Location create input
 */
export interface LocationCreateInput {
  tribute_id: number;
  location_name: string;
  location_address: string;
  sort_order?: number;
}

/**
 * Location update input
 */
export interface LocationUpdateInput {
  tribute_id?: number;
  location_name?: string;
  location_address?: string;
  sort_order?: number;
}

/**
 * Event
 */
export interface Event {
  event_id: number;
  location_id: number;
  stream_html: string;
  start_time: string;
  end_time: string;
}

/**
 * Event create input
 */
export interface EventCreateInput {
  location_id: number;
  stream_html?: string;
  start_time: string;
  end_time: string;
}

/**
 * Event update input
 */
export interface EventUpdateInput {
  location_id?: number;
  stream_html?: string;
  start_time?: string;
  end_time?: string;
}

/**
 * Schedule
 */
export interface Schedule {
  schedule_id: number;
  funeral_director_user_id: number;
  tribute_id: number;
  number_of_days: number;
}

/**
 * Schedule create input
 */
export interface ScheduleCreateInput {
  funeral_director_user_id?: number;
  tribute_id: number;
  number_of_days?: number;
}

/**
 * Schedule update input
 */
export interface ScheduleUpdateInput {
  funeral_director_user_id?: number;
  tribute_id?: number;
  number_of_days?: number;
}

/**
 * Funeral home
 */
export interface FuneralHome {
  funeral_home_id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

/**
 * Funeral home create input
 */
export interface FuneralHomeCreateInput {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
}

/**
 * Funeral home update input
 */
export interface FuneralHomeUpdateInput {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}