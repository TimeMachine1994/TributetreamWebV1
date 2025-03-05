import type { UnifiedStore } from '$lib/stores/unified-store.svelte';
import type { FormActionResult } from './form-action-helper';

/**
 * Process a form action response to update the unified store
 * This should be used in page components when handling form action results
 *
 * @param form The form result from the action
 * @param store The unified store instance
 * @param nextPage Optional URL to navigate to on success (not needed if using server redirects)
 */
export function processFormActionResult(
  form: FormActionResult | null | undefined,
  store: UnifiedStore,
  nextPage?: string
): void {
  // If form is not successful or has no data, don't proceed
  if (!form?.success || !form?.data) return;

  const data = form.data;
  
  // Update different sections of the unified store based on the data
  if (data.directorInfo) {
    store.updateDirectorInfo(data.directorInfo);
  }

  if (data.lovedOneInfo) {
    store.updateLovedOneInfo(data.lovedOneInfo);
  }

  if (data.userInfo) {
    store.updateUserInfo(data.userInfo);
  }

  if (data.memorialInfo) {
    store.updateMemorialInfo(data.memorialInfo);
  }

  if (data.liveStreamInfo) {
    store.updateLiveStreamInfo(data.liveStreamInfo);
  }

  if (data.packageInfo) {
    store.updatePackageInfo(data.packageInfo);
  }

  if (data.billingInfo) {
    store.updateBillingInfo(data.billingInfo);
  }
  
  if (data.scheduleDays) {
    store.updateScheduleDays(data.scheduleDays);
  }

  // Handle tribute-specific data
  if (data.tribute) {
    store.updateCurrentTribute(data.tribute);
    
    // If a new tribute was created, add it to recent tributes
    if (data.tribute.id && !store.recentTributes.some(t => t.id === data.tribute.id)) {
      store.recentTributes = [...store.recentTributes, data.tribute];
    }
  }

  // Ensure data is saved to localStorage
  store.saveToLocalStorage();
}

/**
 * Validate form data against required fields and update the form action result
 * @param formData Form data to validate
 * @param requiredFields Array of required field names
 * @returns Form action result object
 */
export function validateFormData(
  formData: FormData,
  requiredFields: string[]
): FormActionResult {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = formData.get(field) as string;
    if (!value || !value.trim()) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return {
      success: false,
      error: true,
      message: `The following fields are required: ${missingFields.join(', ')}`,
      data: { missingFields }
    };
  }

  return {
    success: true,
    data: {}
  };
}

/**
 * Extract form data into a structured object
 * Useful for processing form data before updating the store
 * 
 * @param formData Form data from the request
 * @param fields Object mapping form field names to destination property paths
 * @returns Structured data object
 */
export function extractFormData(
  formData: FormData,
  fields: Record<string, string>
): Record<string, any> {
  const result: Record<string, any> = {};

  // Process each field mapping
  Object.entries(fields).forEach(([formField, propPath]) => {
    const value = formData.get(formField);
    if (value !== null) {
      // Split the property path (e.g., "directorInfo.firstName")
      const pathParts = propPath.split('.');
      
      // Create nested objects if needed
      let current = result;
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      // Set the value at the final path
      const lastPart = pathParts[pathParts.length - 1];
      current[lastPart] = value;
    }
  });

  return result;
}

/**
 * Create a form handling function to process form submissions
 * and update the unified store with the results
 * 
 * @param store The unified store instance
 * @param options Options for form processing
 * @returns Function to handle form submission
 */
export function createFormHandler(
  store: UnifiedStore,
  options: {
    requiredFields?: string[];
    fieldMappings?: Record<string, string>;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  } = {}
) {
  return async (e: Event) => {
    e.preventDefault();
    
    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);
    
    // Validate required fields if specified
    if (options.requiredFields?.length) {
      const validationResult = validateFormData(formData, options.requiredFields);
      if (!validationResult.success) {
        if (options.onError) {
          options.onError(validationResult);
        }
        return;
      }
    }
    
    // Extract structured data if field mappings are provided
    let data = {};
    if (options.fieldMappings) {
      data = extractFormData(formData, options.fieldMappings);
    } else {
      // Simple object conversion if no mappings
      formData.forEach((value, key) => {
        // @ts-ignore
        data[key] = value;
      });
    }
    
    // Process the data and update the store
    const result: FormActionResult = {
      success: true,
      data
    };
    
    processFormActionResult(result, store);
    
    if (options.onSuccess) {
      options.onSuccess(data);
    }
  };
}