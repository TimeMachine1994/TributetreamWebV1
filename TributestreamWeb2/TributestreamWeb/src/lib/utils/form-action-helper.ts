import type { UnifiedStore, Tribute } from '$lib/stores/unified-store.svelte';

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

/**
 * @deprecated Use processFormActionResult instead - this function is maintained for backward compatibility
 */
export function processFormActionForBothStores(
  form: FormActionResult | null | undefined,
  masterStore: any,
  tributeStore: any,
  nextPage?: string
): void {
  console.warn('processFormActionForBothStores is deprecated. Please use processFormActionResult with UnifiedStore instead.');
  
  // If running in a browser, get the unified store and use it
  if (typeof window !== 'undefined') {
    try {
      // Try to dynamically import the unified store
      import('$lib/stores/unified-store.svelte').then(({ getUnifiedStoreContext }) => {
        const unifiedStore = getUnifiedStoreContext();
        processFormActionResult(form, unifiedStore, nextPage);
      }).catch(() => {
        console.error('Failed to load UnifiedStore, falling back to legacy behavior');
        // Legacy behavior (will be removed in a future update)
        if (!form?.success || !form?.data) return;
        
        // Update the master store directly
        if (masterStore) {
          const data = form.data;
          
          if (data.directorInfo) masterStore.updateDirectorInfo(data.directorInfo);
          if (data.lovedOneInfo) masterStore.updateLovedOneInfo(data.lovedOneInfo);
          if (data.userInfo) masterStore.updateUserInfo(data.userInfo);
          if (data.memorialInfo) masterStore.updateMemorialInfo(data.memorialInfo);
          if (data.liveStreamInfo) masterStore.updateLiveStreamInfo(data.liveStreamInfo);
          if (data.packageInfo) masterStore.updatePackageInfo(data.packageInfo);
          if (data.billingInfo) masterStore.updateBillingInfo(data.billingInfo);
          if (data.scheduleDays) masterStore.updateScheduleDays(data.scheduleDays);
        }
        
        // Update the tribute store
        if (tributeStore && form.data.tribute) {
          tributeStore.updateCurrentTribute(form.data.tribute);
          // If a new tribute was created, add it to recent tributes
          if (form.data?.tribute?.id && !tributeStore.recentTributes.some((t: Tribute) => t.id === form.data?.tribute.id)) {
            tributeStore.recentTributes = [...tributeStore.recentTributes, form.data.tribute];
            tributeStore.recentTributes = [...tributeStore.recentTributes, form.data.tribute];
          }
        }
      });
    } catch (e) {
      console.error('Error in processFormActionForBothStores:', e);
    }
  }
}