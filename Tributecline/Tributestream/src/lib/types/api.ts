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
}

export interface UserMeta {
  meta_key: string;
  meta_value: string;
}

export interface UserRole {
  user_id: number;
  roles: string[];
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  meta?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total_pages: number;
  total_items: number;
  current_page: number;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

export interface Location {
  name: string;
  address: string;
  travelExceedsHour: boolean;
}

export interface CalculatorData {
  package?: string;
  livestreamDate?: string;
  livestreamStartTime?: string;
  allowOverrun?: boolean;
  locations?: Location[];
  duration?: number;
}

export interface FuneralHomeData {
  name?: string;
  directorName?: string;
  address?: string;
  phone?: string;
  email?: string;
}
