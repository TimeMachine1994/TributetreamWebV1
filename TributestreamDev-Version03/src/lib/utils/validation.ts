/**
 * Validation Utilities
 * 
 * This module provides validation functions for various data models.
 * It replaces the previous Backbone-based validation system.
 */

import type { Tribute, CreateTributePayload } from '$lib/types/tribute';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate a tribute
 * 
 * @param tribute The tribute data to validate
 * @returns Validation result with isValid flag and errors object
 */
export function validateTribute(tribute: Partial<Tribute> | CreateTributePayload): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Validate loved_one_name
  if (!tribute.loved_one_name || tribute.loved_one_name.trim() === '') {
    errors.loved_one_name = 'Name is required';
  } else if (tribute.loved_one_name.length > 100) {
    errors.loved_one_name = 'Name must be less than 100 characters';
  }
  
  // Validate phone_number
  if (!tribute.phone_number || tribute.phone_number.trim() === '') {
    errors.phone_number = 'Phone number is required';
  } else if (!/^\+?[0-9\s\-()]+$/.test(tribute.phone_number)) {
    errors.phone_number = 'Invalid phone number format';
  }
  
  // Validate user_id if provided
  if ('user_id' in tribute && tribute.user_id !== undefined) {
    if (typeof tribute.user_id !== 'number' || tribute.user_id <= 0) {
      errors.user_id = 'Invalid user ID';
    }
  }
  
  // Validate custom_html if provided
  if (tribute.custom_html && tribute.custom_html.length > 50000) {
    errors.custom_html = 'Custom HTML must be less than 50,000 characters';
  }
  
  // Validate slug if provided
  if ('slug' in tribute && tribute.slug) {
    if (!/^[a-z0-9-]+$/.test(tribute.slug)) {
      errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    } else if (tribute.slug.length > 100) {
      errors.slug = 'Slug must be less than 100 characters';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate an email address
 * 
 * @param email The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a password
 * 
 * @param password The password to validate
 * @returns Validation result with isValid flag and error message
 */
export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  return { isValid: true, message: '' };
}
