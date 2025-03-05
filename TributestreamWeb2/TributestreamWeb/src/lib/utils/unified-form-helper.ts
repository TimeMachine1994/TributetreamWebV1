import type { UnifiedStore, DirectorInfo, LovedOneInfo, UserInfo, MemorialInfo, LiveStreamInfo, PackageInfo, BillingInfo, Tribute } from '$lib/stores/unified-store.svelte';

/**
 * Type for common form action response
 */
export interface FormActionResult {
  success?: boolean;
  error?: boolean;
  message?: string;
  data?: Record<string, any>;
  redirectTo?: string;
  values?: Record<string, any>;
}

/**
 * Generic validation function for required fields
 * @param formData Form data to validate
 * @param requiredFields Array of required field names
 * @returns Validation result with error message if any fields are missing
 */
export function validateRequiredFields(
  formData: FormData,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = formData.get(field) as string;
    if (!value || !value.trim()) {
      missingFields.push(field);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

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
      store.recentTributes = [...store.recentTributes, data.tribute as Tribute];
    }
  }

  // No longer persisting here - let the layout's coordinated persistence handle it
  // store.saveToLocalStorage();
}