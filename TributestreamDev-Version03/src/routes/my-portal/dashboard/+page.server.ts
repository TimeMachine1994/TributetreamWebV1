import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { TributeApiClient } from '$lib/api/tribute-api-client';
import { tributePersistence } from '$lib/persistence/tribute-persistence';

export const load: PageServerLoad = async ({ locals, fetch }) => {
  // Check if user is authenticated
  if (!locals.authenticated || !locals.token || !locals.user) {
    throw redirect(302, '/my-portal');
  }

  try {
    // Initialize the persistence layer with the JWT token
    const apiClient = new TributeApiClient(locals.token);
    tributePersistence.setApiClient(apiClient);
    
    // Ensure userId is a number for API calls
    const userId = typeof locals.user.id === 'string' 
      ? parseInt(locals.user.id, 10) 
      : locals.user.id;
    
    // 1. Fetch the user's tributes using the persistence layer
    console.log('Fetching tributes for user:', userId);
    
    const tributesResult = await tributePersistence.getTributesByUser(userId);
    
    if (!tributesResult.success) {
      console.error('Failed to fetch tributes:', tributesResult.error);
      throw new Error(`Failed to fetch tributes: ${tributesResult.error}`);
    }
    
    // Use optional chaining and provide a fallback empty array
    const tributes = tributesResult.data || [];

    // 2. Fetch additional detailed tribute data
    // The persistence layer already provides detailed tributes, but we'll
    // maintain the detailed tributes array for compatibility with existing code
    const detailedTributes = [];
    
    if (tributes && tributes.length > 0) {
      for (const tribute of tributes) {
        if (!tribute || !tribute.id) {
          console.warn('Warning: Invalid tribute object found in results');
          continue;
        }
        
        try {
          // Get detailed tribute data using the persistence layer
          const detailedResult = await tributePersistence.getTributeById(tribute.id);
          
          if (detailedResult.success && detailedResult.data) {
            detailedTributes.push(detailedResult.data);
          } else {
            // If we can't get detailed data, use the basic tribute
            console.warn(`Warning: Could not fetch detailed data for tribute ${tribute.id}:`, detailedResult.error);
            detailedTributes.push(tribute);
          }
        } catch (tributeError) {
          console.warn(`Warning: Could not fetch detailed data for tribute ${tribute.id}:`, tributeError);
          detailedTributes.push(tribute);
        }
      }
    }
    
    // 3. Fetch user form data to check if they have memorial form data
    const formDataResult = await tributePersistence.getFormData(userId);
    
    let hasMemorialData = false;
    let memorialData = null;
    
    if (formDataResult.success && formDataResult.data) {
      // Transform form data from flat structure to structured format
      const formData = formDataResult.data;
      
      // Check if we have enough data to consider it "has memorial data"
      // We consider the user having memorial data if they have at least a deceased name
      if (formData['deceased-first-name'] || formData['deceased-last-name']) {
        hasMemorialData = true;
        
        // Transform the flat form data to the structured format expected by the template
        memorialData = {
          director: {
            firstName: formData['director-first-name'] || '',
            lastName: formData['director-last-name'] || '',
          },
          familyMember: {
            firstName: formData['family-member-first-name'] || '',
            lastName: formData['family-member-last-name'] || '',
            dob: formData['family-member-dob'] || '',
          },
          deceased: {
            firstName: formData['deceased-first-name'] || '',
            lastName: formData['deceased-last-name'] || '',
            dob: formData['deceased-dob'] || '',
            dop: formData['deceased-dop'] || '',
          },
          contact: {
            email: formData['email-address'] || '',
            phone: formData['phone-number'] || '',
          },
          memorial: {
            locationName: formData['location-name'] || '',
            locationAddress: formData['location-address'] || '',
            time: formData['memorial-time'] || '',
            date: formData['memorial-date'] || '',
          }
        };
      }
    }
    
    // 4. Return data to the client
    return {
      user: locals.user,
      tributes: tributes,
      detailedTributes: detailedTributes,
      hasMemorialData,
      memorialData
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return {
      user: locals.user,
      tributes: [],
      detailedTributes: [],
      hasMemorialData: false,
      error: error instanceof Error 
        ? `Error loading dashboard data: ${error.message}` 
        : 'Error loading dashboard data. Please try again later.'
    };
  }
};