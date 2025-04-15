/**
 * Type definitions for WordPress entities
 */

/**
 * Base interface for WordPress entities
 */
export interface WPEntity {
  id: number;
  date?: string;
  modified?: string;
  slug?: string;
  status?: string;
  link?: string;
}

/**
 * WordPress Post entity
 */
export interface Post extends WPEntity {
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt?: {
    rendered: string;
  };
  author: number;
  featured_media?: number;
  categories?: number[];
  tags?: number[];
}

/**
 * WordPress Page entity
 */
export interface Page extends WPEntity {
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  parent?: number;
  menu_order?: number;
  template?: string;
}

/**
 * Tribute custom post type
 */
export interface Tribute extends WPEntity {
  user_id: number;
  loved_one_name: string;
  phone_number: string;
  custom_html?: string;
  number_of_streams?: number;
  extended_data?: Record<string, any>;
  // Add v2 API fields for compatibility
  tribute_id?: number; // v2 API uses tribute_id instead of id
  slugified_name?: string; // v2 API uses slugified_name instead of slug
  point_of_contact_user_id?: number; // v2 API specific field
  created_by_user_id?: number; // v2 API specific field
  page_html?: string; // v2 API equivalent of custom_html
  loved_ones_name?: string; // v2 API equivalent of loved_one_name
  loved_ones_dob?: string; // v2 API specific field
  loved_ones_dod?: string; // v2 API specific field
}

/**
 * WordPress User entity
 */
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  roles: string[];
  capabilities: Record<string, boolean>;
}

/**
 * Authentication response from WordPress JWT
 */
export interface AuthResponse {
  token: string;
  user_id: number;
  user_display_name: string;
  user_email: string;
  user_nicename: string;
  roles: string[];
  capabilities: Record<string, boolean>;
  meta_result: any;
  message?: string; // Error message when authentication fails
}