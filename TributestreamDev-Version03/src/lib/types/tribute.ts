/**
 * Funeral Home entity
 */
export interface FuneralHome {
  funeral_home_id: number;
  created_by_user_id: number;
  fh_name: string;
  fh_address: string;
  fh_phone_number: string;
}

/**
 * Tribute Page entity
 */
export interface TributePage {
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
 * Location entity
 */
export interface Location {
  location_id: number;
  tribute_id: number;
  location_name: string;
  sort_order: number;
  location_address: string;
}

/**
 * Event entity
 */
export interface Event {
  event_id: number;
  location_id: number;
  stream_html: string;
  start_time: string | null;
  end_time: string | null;
}

/**
 * Schedule entity
 */
export interface Schedule {
  schedule_id: number;
  funeral_director_user_id: number;
  funeral_home_id: number;
  number_of_days: number;
  tribute_id: number;
}

/**
 * Create Tribute Page request
 */
export interface CreateTributePageRequest {
  created_by_user_id: number;
  point_of_contact_user_id: number;
  loved_ones_name: string;
  page_html: string;
  loved_ones_dob?: string;
  loved_ones_dod?: string;
}

/**
 * Create Funeral Home request
 */
export interface CreateFuneralHomeRequest {
  created_by_user_id: number;
  fh_name: string;
  fh_address: string;
  fh_phone_number: string;
}

/**
 * Create Location request
 */
export interface CreateLocationRequest {
  tribute_id: number;
  location_name: string;
  sort_order: number;
  location_address: string;
}

/**
 * Create Event request
 */
export interface CreateEventRequest {
  location_id: number;
  stream_html: string;
  start_time?: string;
  end_time?: string;
}

/**
 * Create Schedule request
 */
export interface CreateScheduleRequest {
  funeral_director_user_id: number;
  funeral_home_id: number;
  number_of_days: number;
  tribute_id: number;
}