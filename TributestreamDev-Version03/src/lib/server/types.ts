/**
 * API Type Definitions
 *
 * Contains type definitions for the TributeStream API.
 */

// ============================================================================
// Request Types
// ============================================================================

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  status?: number;
}

/**
 * Auth token response from WordPress
 */
export interface AuthTokenResponse {
  token: string;
  user_display_name: string;
  user_email: string;
  user_nicename: string;
  user_id?: number;
}

/**
 * Auth token validation response from WordPress
 */
export interface AuthValidationResponse {
  code: string;
  data: {
    status: number;
  };
}

/**
 * Authentication login parameters
 */
export interface AuthLoginParams {
  username: string;
  password: string;
}

/**
 * Authentication response (alias of AuthTokenResponse)
 */
export type AuthResponse = AuthTokenResponse;

/**
 * Register user parameters (alias of UserRegistrationRequest)
 */
export type RegisterUserParams = UserRegistrationRequest;

/**
 * Register user response
 */
export type RegisterUserResponse = AuthTokenResponse;

/**
 * User registration request payload
 */
export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  meta?: Record<string, unknown>;
}

/**
 * Tribute data interface
 */
export interface Tribute {
  id: number;
  user_id: number;
  loved_one_name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  custom_html?: string;
  phone_number: string;
  number_of_streams?: number;
  extended_data?: Record<string, unknown>;
}

/**
 * Create tribute parameters (alias for CreateTributeRequest)
 */
export type CreateTributeParams = CreateTributeRequest;

/**
 * Create tribute response
 */
export interface CreateTributeResponse {
  id: number;
  slug: string;
}

/**
 * Paginated tributes response
 */
export type PaginatedTributesResponse = PaginatedResponse<Tribute>;

/**
 * New tribute request payload
 */
export interface CreateTributeRequest {
  user_id: number;
  loved_one_name: string;
  phone_number: string;
  slug?: string;
  custom_html?: string;
  number_of_streams?: number;
  extended_data?: Record<string, unknown>;
}

/**
 * Update tribute parameters (alias for UpdateTributeRequest)
 */
export type UpdateTributeParams = UpdateTributeRequest;

/**
 * Update tribute response
 */
export interface UpdateTributeResponse {
  updated_rows: number;
}

/**
 * Delete tribute response
 */
export interface DeleteTributeResponse {
  deleted_rows: number;
}

/**
 * Update tribute request payload
 */
export interface UpdateTributeRequest {
  loved_one_name?: string;
  slug?: string;
  custom_html?: string;
  phone_number?: string;
  number_of_streams?: number;
  extended_data?: Record<string, unknown>;
}

/**
 * Form data interface
 */
export interface FormData {
  'director-first-name': string;
  'director-last-name': string;
  'family-member-first-name': string;
  'family-member-last-name': string;
  'family-member-dob': string;
  'deceased-first-name': string;
  'deceased-last-name': string;
  'deceased-dob': string;
  'deceased-dop': string;
  'email-address': string;
  'phone-number': string;
  'location-name': string;
  'location-address': string;
  'memorial-time': string;
  'memorial-date': string;
  [key: string]: string;
}

/**
 * Save form data parameters (alias for SaveFormDataRequest)
 */
export type SaveFormDataParams = SaveFormDataRequest;

/**
 * Form data request payload
 */
export interface SaveFormDataRequest {
  user_id: number;
  form_data: FormData;
  tribute_id?: number;
}

/**
 * Create or update user meta parameters (alias for CreateUpdateUserMetaRequest)
 */
export type CreateOrUpdateUserMetaParams = CreateUpdateUserMetaRequest;

/**
 * User metadata request payload
 */
export interface CreateUpdateUserMetaRequest {
  user_id: number;
  meta_key: string;
  meta_value: unknown;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  total_pages: number;
  total_items: number;
  current_page: number;
}

/**
 * Tribute search parameters
 */
export interface TributeSearchParams {
  page?: number;
  perPage?: number;
  search?: string;
}

/**
 * User meta data response
 */
export interface UserMetaResponse {
  meta: Record<string, unknown>;
}

/**
 * User meta single item response
 */
export interface UserMetaSingleResponse {
  key: string;
  value: unknown;
}

/**
 * Generic success response
 */
export interface SuccessResponse {
  success: boolean;
}

/**
 * Tribute data response
 */
export type TributeDataResponse = Record<string, unknown>;

/**
 * Tribute data operation response
 */
export interface TributeDataOperationResponse {
  success: boolean;
}