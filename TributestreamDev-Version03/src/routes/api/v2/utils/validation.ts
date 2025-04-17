/**
 * Validation utilities for the API v2 endpoints
 */
import { ApiErrors } from './error-handler';

/**
 * Validate that required fields are present in an object
 * @param obj The object to validate
 * @param fields The required fields
 * @throws ApiException if any required fields are missing
 */
export function validateRequired(obj: any, fields: string[]): void {
  const missing = fields.filter(field => {
    const value = obj[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missing.length > 0) {
    throw ApiErrors.validation(
      `Missing required fields: ${missing.join(', ')}`,
      { missing }
    );
  }
}

/**
 * Validate that fields are numeric
 * @param obj The object to validate
 * @param fields The fields to validate as numeric
 * @throws ApiException if any fields are not numeric
 */
export function validateNumeric(obj: any, fields: string[]): void {
  const invalid = fields.filter(field => {
    const value = obj[field];
    if (value === undefined || value === null) return false;
    return !/^-?\d+(\.\d+)?$/.test(String(value));
  });
  
  if (invalid.length > 0) {
    throw ApiErrors.validation(
      `Fields must be numeric: ${invalid.join(', ')}`,
      { invalid }
    );
  }
}

/**
 * Validate that fields are integers
 * @param obj The object to validate
 * @param fields The fields to validate as integers
 * @throws ApiException if any fields are not integers
 */
export function validateInteger(obj: any, fields: string[]): void {
  const invalid = fields.filter(field => {
    const value = obj[field];
    if (value === undefined || value === null) return false;
    return !/^-?\d+$/.test(String(value));
  });
  
  if (invalid.length > 0) {
    throw ApiErrors.validation(
      `Fields must be integers: ${invalid.join(', ')}`,
      { invalid }
    );
  }
}

/**
 * Validate that fields are positive numbers
 * @param obj The object to validate
 * @param fields The fields to validate as positive numbers
 * @throws ApiException if any fields are not positive numbers
 */
export function validatePositive(obj: any, fields: string[]): void {
  const invalid = fields.filter(field => {
    const value = obj[field];
    if (value === undefined || value === null) return false;
    return parseFloat(String(value)) <= 0;
  });
  
  if (invalid.length > 0) {
    throw ApiErrors.validation(
      `Fields must be positive numbers: ${invalid.join(', ')}`,
      { invalid }
    );
  }
}

/**
 * Validate that a string is a valid email address
 * @param email The email address to validate
 * @throws ApiException if the email is invalid
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw ApiErrors.validation('Invalid email format');
  }
}

/**
 * Validate that a string meets minimum length requirements
 * @param value The string to validate
 * @param minLength The minimum length
 * @param fieldName The name of the field (for error messages)
 * @throws ApiException if the string is too short
 */
export function validateMinLength(value: string, minLength: number, fieldName: string = 'Field'): void {
  if (value.length < minLength) {
    throw ApiErrors.validation(
      `${fieldName} must be at least ${minLength} characters long`
    );
  }
}

/**
 * Validate that a string does not exceed maximum length
 * @param value The string to validate
 * @param maxLength The maximum length
 * @param fieldName The name of the field (for error messages)
 * @throws ApiException if the string is too long
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string = 'Field'): void {
  if (value.length > maxLength) {
    throw ApiErrors.validation(
      `${fieldName} must not exceed ${maxLength} characters`
    );
  }
}

/**
 * Validate that a date string is in a valid format
 * @param dateStr The date string to validate
 * @param fieldName The name of the field (for error messages)
 * @throws ApiException if the date is invalid
 */
export function validateDate(dateStr: string, fieldName: string = 'Date'): void {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw ApiErrors.validation(`Invalid ${fieldName} format`);
  }
}

/**
 * Validate that a value is one of a set of allowed values
 * @param value The value to validate
 * @param allowedValues The allowed values
 * @param fieldName The name of the field (for error messages)
 * @throws ApiException if the value is not allowed
 */
export function validateEnum(value: any, allowedValues: any[], fieldName: string = 'Field'): void {
  if (!allowedValues.includes(value)) {
    throw ApiErrors.validation(
      `Invalid ${fieldName}. Must be one of: ${allowedValues.join(', ')}`
    );
  }
}

/**
 * Validate that a password meets security requirements
 * @param password The password to validate
 * @param minLength The minimum length (default: 8)
 * @throws ApiException if the password is not secure
 */
export function validatePassword(password: string, minLength: number = 8): void {
  if (password.length < minLength) {
    throw ApiErrors.validation(
      `Password must be at least ${minLength} characters long`
    );
  }
  
  // Optional: Add more password security checks
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumbers = /\d/.test(password);
  // const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  // if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars)) {
  //   throw ApiErrors.validation(
  //     'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
  //   );
  // }
}

/**
 * Validate pagination parameters
 * @param page The page number
 * @param perPage The number of items per page
 * @throws ApiException if the pagination parameters are invalid
 */
export function validatePagination(page?: number, perPage?: number): void {
  if (page !== undefined && (isNaN(page) || page < 1)) {
    throw ApiErrors.validation('Page must be a positive integer');
  }
  
  if (perPage !== undefined && (isNaN(perPage) || perPage < 1)) {
    throw ApiErrors.validation('Per page must be a positive integer');
  }
}