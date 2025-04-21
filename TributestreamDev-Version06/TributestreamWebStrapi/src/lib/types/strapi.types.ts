/**
 * Strapi API response types
 */

/**
 * Strapi login credentials
 */
export interface LoginCredentials {
  identifier: string;
  password: string;
}

/**
 * Strapi registration data
 */
export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  contactInfo?: ContactInfo;
}

/**
 * User contact information component
 */
export interface ContactInfo {
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

/**
 * Strapi auth response
 */
export interface AuthResponse {
  jwt: string;
  user: User;
}

/**
 * Strapi user
 */
export interface User {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  contactInfo?: ContactInfo;
}

/**
 * Strapi API response structure
 */
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Strapi data structure for a single entity
 */
export interface StrapiData<T> {
  id: number;
  attributes: T;
}

/**
 * Type for a collection of Strapi data
 */
export type StrapiCollection<T> = StrapiData<T>[];

/**
 * Tribute entity attributes 
 */
export interface TributeAttributes {
  lovedOnesFullName: string;
  lovedOnesDOB?: string;
  dateOfPassing?: string;
  slug?: string;
  priceTotal?: number;
  paymentComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  owner?: {
    data: StrapiData<User> | null;
  };
  funeralHome?: {
    data: StrapiData<FuneralHomeAttributes> | null;
  };
  package?: {
    data: StrapiData<PackageAttributes> | null;
  };
  memorialEvents?: {
    data: StrapiCollection<MemorialEventAttributes> | null;
  };
}

/**
 * Funeral Home entity attributes
 */
export interface FuneralHomeAttributes {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  director?: {
    data: StrapiData<User> | null;
  };
}

/**
 * Package entity attributes
 */
export interface PackageAttributes {
  name: string;
  description?: string;
  price: number;
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

/**
 * Memorial Event entity attributes
 */
export interface MemorialEventAttributes {
  title: string;
  description?: string;
  eventType: string; // e.g., 'funeral', 'viewing', 'celebration-of-life'
  startDate: string;
  endDate?: string;
  location?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  tribute?: {
    data: StrapiData<TributeAttributes> | null;
  };
}

/**
 * Simplified types for creating/updating entities
 */
export interface TributeInput {
  lovedOnesFullName: string;
  lovedOnesDOB?: string;
  dateOfPassing?: string;
  slug?: string;
  priceTotal?: number;
  paymentComplete?: boolean;
  owner?: { id: number };
  funeralHome?: { id: number };
  package?: { id: number };
  memorialEvents?: Array<{ id: number }>;
}

export interface FuneralHomeInput {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  director?: { id: number };
}

export interface PackageInput {
  name: string;
  description?: string;
  price: number;
  features?: string[];
}

export interface MemorialEventInput {
  title: string;
  description?: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  location?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  tribute?: { id: number };
}

/**
 * Aliases for backward compatibility with existing code
 */
export type Tribute = StrapiData<TributeAttributes>;
export type FuneralHome = StrapiData<FuneralHomeAttributes>;
export type Package = StrapiData<PackageAttributes>;
export type MemorialEvent = StrapiData<MemorialEventAttributes>;