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

// ============================================================================
// Tribute Pages Types
// ============================================================================

/**
 * Tribute page data interface
 */
export interface TributePage {
  tribute_id: number;
  created_by_user_id: number;
  point_of_contact_user_id: number;
  loved_ones_name: string;
  slugified_name: string;
  page_html?: string;
  loved_ones_dob?: string;
  loved_ones_dod?: string;
}

/**
 * Create tribute page parameters
 */
export interface CreateTributePageParams {
  created_by_user_id: number;
  point_of_contact_user_id?: number;
  loved_ones_name: string;
  slugified_name?: string;
  page_html?: string;
  loved_ones_dob?: string;
  loved_ones_dod?: string;
}

/**
 * Create tribute page response
 */
export interface CreateTributePageResponse {
  tribute_id: number;
  slugified_name: string;
}

/**
 * Update tribute page parameters
 */
export interface UpdateTributePageParams {
  created_by_user_id?: number;
  point_of_contact_user_id?: number;
  loved_ones_name?: string;
  slugified_name?: string;
  page_html?: string;
  loved_ones_dob?: string;
  loved_ones_dod?: string;
}

/**
 * Paginated tribute pages response
 */
export interface PaginatedTributePagesResponse {
  tributes: TributePage[];
  total_items: number;
  total_pages: number;
  current_page: number;
}

// ============================================================================
// Locations Types
// ============================================================================

/**
 * Location data interface
 */
export interface Location {
  location_id: number;
  tribute_id: number;
  location_name: string;
  location_address?: string;
  sort_order: number;
}

/**
 * Create location parameters
 */
export interface CreateLocationParams {
  tribute_id: number;
  location_name: string;
  location_address?: string;
  sort_order?: number;
}

/**
 * Create location response
 */
export interface CreateLocationResponse {
  location_id: number;
  tribute_id: number;
}

/**
 * Update location parameters
 */
export interface UpdateLocationParams {
  tribute_id?: number;
  location_name?: string;
  location_address?: string;
  sort_order?: number;
}

/**
 * Paginated locations response
 */
export interface PaginatedLocationsResponse {
  locations: Location[];
  total_items: number;
  total_pages: number;
  current_page: number;
}

// ============================================================================
// Events Types
// ============================================================================

/**
 * Event data interface
 */
export interface Event {
  event_id: number;
  location_id: number;
  stream_html?: string;
  start_time: string;
  end_time: string;
}

/**
 * Create event parameters
 */
export interface CreateEventParams {
  location_id: number;
  stream_html?: string;
  start_time: string;
  end_time: string;
}

/**
 * Create event response
 */
export interface CreateEventResponse {
  event_id: number;
  location_id: number;
}

/**
 * Update event parameters
 */
export interface UpdateEventParams {
  location_id?: number;
  stream_html?: string;
  start_time?: string;
  end_time?: string;
}

/**
 * Paginated events response
 */
export interface PaginatedEventsResponse {
  events: Event[];
  total_items: number;
  total_pages: number;
  current_page: number;
}

// ============================================================================
// Users Types
// ============================================================================

/**
 * User data interface
 */
export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
  roles: string[];
  registered: string;
  user_type: string;
}

/**
 * Create user parameters
 */
export interface CreateUserParams {
  email_address: string;
  password: string;
  user_type: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
}

/**
 * Create user response
 */
export interface CreateUserResponse {
  user_id: number;
  email: string;
  user_type: string;
}

/**
 * Update user parameters
 */
export interface UpdateUserParams {
  email_address?: string;
  password?: string;
  user_type?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
}

/**
 * Paginated users response
 */
export interface PaginatedUsersResponse {
  users: User[];
  total_items: number;
  total_pages: number;
  current_page: number;
}

// ============================================================================
// Funeral Homes Types
// ============================================================================

/**
 * Funeral home data interface
 */
export interface FuneralHome {
  funeral_home_id: number;
  name: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
}

/**
 * Create funeral home parameters
 */
export interface CreateFuneralHomeParams {
  name: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
}

/**
 * Create funeral home response
 */
export interface CreateFuneralHomeResponse {
  funeral_home_id: number;
}

/**
 * Update funeral home parameters
 */
export interface UpdateFuneralHomeParams {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

/**
 * Paginated funeral homes response
 */
export interface PaginatedFuneralHomesResponse {
  funeral_homes: FuneralHome[];
  total_items: number;
  total_pages: number;
  current_page: number;
}

// ============================================================================
// Schedule Types
// ============================================================================

/**
 * Schedule data interface
 */
export interface Schedule {
  schedule_id: number;
  funeral_director_user_id: number;
  tribute_id: number;
  number_of_days: number;
}

/**
 * Create schedule parameters
 */
export interface CreateScheduleParams {
  funeral_director_user_id: number;
  tribute_id: number;
  number_of_days: number;
}

/**
 * Create schedule response
 */
export interface CreateScheduleResponse {
  schedule_id: number;
  tribute_id: number;
}

/**
 * Update schedule parameters
 */
export interface UpdateScheduleParams {
  funeral_director_user_id?: number;
  tribute_id?: number;
  number_of_days?: number;
}

/**
 * Paginated schedules response
 */
export interface PaginatedSchedulesResponse {
  schedules: Schedule[];
  total_items: number;
  total_pages: number;
  current_page: number;
}

// ============================================================================
// Legacy Types (Kept for backward compatibility)
// ============================================================================

/**
 * Tribute data interface (legacy)
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