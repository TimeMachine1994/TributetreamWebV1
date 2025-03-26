import { error } from '@sveltejs/kit';

/**
 * Handles API errors consistently
 * @param err The error to handle
 */
export function handleApiError(err: unknown): never {
  // Check if this is already a SvelteKit error
  if (typeof err === 'object' && err !== null && 'status' in err && 'body' in err) {
    throw err;
  }
  
  console.error('API Error:', err);
  
  // Default error
  throw error(500, 'An unexpected error occurred');
}

/**
 * Creates a validation error
 * @param message The error message
 * @param details Optional error details
 */
export function createValidationError(message: string, details?: Record<string, unknown>): never {
  console.error('Validation Error:', message, details);
  throw error(400, message);
}