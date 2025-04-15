/**
 * Tribute Validation Utilities
 * 
 * This module provides validation functions for tribute data.
 */

import type { Tribute } from '$lib/types/wp-models';

/**
 * Validate tribute data
 * 
 * @param tributeData The tribute data to validate
 * @returns Validation errors or null if valid
 */
export function validateTribute(tributeData: Partial<Tribute>): Record<string, string> | null {
  const errors: Record<string, string> = {};
  
  // Validate loved_one_name (v1 API) or loved_ones_name (v2 API)
  const lovedOneName = tributeData.loved_one_name || tributeData.loved_ones_name;
  if (lovedOneName !== undefined) {
    if (!lovedOneName.trim()) {
      errors.loved_one_name = 'Name is required';
      if (tributeData.loved_ones_name !== undefined) {
        errors.loved_ones_name = 'Name is required';
      }
    } else if (lovedOneName.length > 100) {
      errors.loved_one_name = 'Name must be less than 100 characters';
      if (tributeData.loved_ones_name !== undefined) {
        errors.loved_ones_name = 'Name must be less than 100 characters';
      }
    }
  }
  
  // Validate phone_number
  if (tributeData.phone_number !== undefined) {
    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (tributeData.phone_number && !phoneRegex.test(tributeData.phone_number)) {
      errors.phone_number = 'Invalid phone number format';
    }
  }
  
  // Validate custom_html (v1 API) or page_html (v2 API)
  const htmlContent = tributeData.custom_html || tributeData.page_html;
  if (htmlContent !== undefined) {
    // Basic HTML validation - could be expanded
    if (htmlContent && htmlContent.length > 100000) {
      errors.custom_html = 'HTML content is too large';
      if (tributeData.page_html !== undefined) {
        errors.page_html = 'HTML content is too large';
      }
    }
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
}