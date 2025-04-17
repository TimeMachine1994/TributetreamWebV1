/**
 * Error handling utilities for the API v2 endpoints
 */
import { json } from '@sveltejs/kit';
import type { ApiError } from '../types';

/**
 * Error codes for standardized error responses
 */
export const ErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  CONFLICT: 'CONFLICT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
} as const;

/**
 * Custom API exception class for standardized error handling
 */
export class ApiException extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(code: string, message: string, status: number = 500, details?: any) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    this.name = 'ApiException';
  }

  /**
   * Convert the exception to a JSON-serializable object
   */
  toJSON(): ApiError {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      details: this.details
    };
  }
}

/**
 * Handle API errors and return standardized responses
 * @param error The error to handle
 * @returns A standardized JSON response
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  // Handle ApiException
  if (error instanceof ApiException) {
    return json({
      success: false,
      error: error.toJSON()
    }, { status: error.status });
  }
  
  // Handle WordPress API errors
  if (error instanceof Response) {
    return json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'WordPress API error',
        status: error.status
      }
    }, { status: error.status });
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: error.message || 'An unexpected error occurred',
        status: 500
      }
    }, { status: 500 });
  }
  
  // Handle unknown errors
  return json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unknown error occurred',
      status: 500
    }
  }, { status: 500 });
}

/**
 * Create common error responses
 */
export const ApiErrors = {
  /**
   * Create an unauthorized error response
   * @param message Custom error message
   * @param details Additional error details
   */
  unauthorized: (message = 'Authentication required', details?: any) => 
    new ApiException(ErrorCode.UNAUTHORIZED, message, 401, details),
  
  /**
   * Create a forbidden error response
   * @param message Custom error message
   * @param details Additional error details
   */
  forbidden: (message = 'You do not have permission to perform this action', details?: any) => 
    new ApiException(ErrorCode.FORBIDDEN, message, 403, details),
  
  /**
   * Create a not found error response
   * @param resource The resource that was not found
   * @param details Additional error details
   */
  notFound: (resource = 'Resource', details?: any) => 
    new ApiException(ErrorCode.NOT_FOUND, `${resource} not found`, 404, details),
  
  /**
   * Create a validation error response
   * @param message Custom error message
   * @param details Additional error details
   */
  validation: (message = 'Validation failed', details?: any) => 
    new ApiException(ErrorCode.VALIDATION_ERROR, message, 400, details),
  
  /**
   * Create a bad request error response
   * @param message Custom error message
   * @param details Additional error details
   */
  badRequest: (message = 'Bad request', details?: any) => 
    new ApiException(ErrorCode.BAD_REQUEST, message, 400, details),
  
  /**
   * Create a conflict error response
   * @param message Custom error message
   * @param details Additional error details
   */
  conflict: (message = 'Resource already exists', details?: any) => 
    new ApiException(ErrorCode.CONFLICT, message, 409, details),
  
  /**
   * Create a service unavailable error response
   * @param message Custom error message
   * @param details Additional error details
   */
  serviceUnavailable: (message = 'Service temporarily unavailable', details?: any) => 
    new ApiException(ErrorCode.SERVICE_UNAVAILABLE, message, 503, details)
};