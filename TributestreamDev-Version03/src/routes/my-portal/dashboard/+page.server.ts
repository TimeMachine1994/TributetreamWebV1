import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { tributeApiV2 } from '$lib/api/tribute-api-client-v2';
import { tributePersistence } from '$lib/persistence/tribute-persistence';
import { eventsPersistence } from '$lib/persistence/events-persistence';
import { eventsApi } from '$lib/api/events-api';
import { UserRoles } from '$lib/types/user-roles';

export const load: PageServerLoad = async ({ locals, fetch }) => {
  // Check if user is authenticated
  if (!locals.authenticated || !locals.token || !locals.user) {
    throw redirect(302, '/my-portal');
  }

  try {
    // Initialize the API clients with the JWT token and SvelteKit's fetch
    tributeApiV2.setToken(locals.token);
    tributeApiV2.setFetch(fetch); // Use SvelteKit's fetch for server-side requests
    eventsApi.setFetch(fetch); // Also set fetch for events API
    
    // Ensure userId is a number for API calls and not undefined
    const userId = locals.user?.id
      ? (typeof locals.user.id === 'string' ? parseInt(locals.user.id, 10) : locals.user.id)
      : 0; // Use 0 as a fallback if id is undefined
    
    // Check if user is an admin
    const isAdmin = locals.user?.user_type === UserRoles.ADMIN;
    
    // 1. Fetch tributes - all tributes for admins, user tributes for others
    console.log(`Fetching tributes for ${isAdmin ? 'admin' : 'user'}:`, userId);
    
    // Validate that we have a valid user ID before proceeding
    if (!userId && !isAdmin) {
      console.error('User ID is missing or invalid:', locals.user);
      throw new Error('User ID is required to fetch tributes');
    }
    
    let tributesResult;
    if (isAdmin) {
      tributesResult = await eventsPersistence.getAllTributes();
    } else {
      tributesResult = await tributePersistence.getTributesByUser(userId, { fetch });
    }
    
    if (!tributesResult.success) {
      console.error('Failed to fetch tributes:', tributesResult.error);
      throw new Error(`Failed to fetch tributes: ${tributesResult.error}`);
    }
    
    // Use optional chaining and provide a fallback empty array
    // Transform tributes to match the expected format in the +page.svelte file
    const tributes = (tributesResult.data || []).map(tribute => ({
      ID: tribute.id,
      loved_one_name: tribute.loved_one_name,
      slug: tribute.slug,
      created_at: tribute.created_at,
      updated_at: tribute.updated_at,
      custom_html: tribute.custom_html,
      phone_number: tribute.phone_number,
      number_of_streams: tribute.number_of_streams
    }));

    // 2. Fetch additional detailed tribute data
    // The persistence layer already provides detailed tributes, but we'll
    // maintain the detailed tributes array for compatibility with existing code
    const detailedTributes = [];
    
    if (tributes && tributes.length > 0) {
      for (const tribute of tributes) {
        if (!tribute || !tribute.ID) {
          console.warn('Warning: Invalid tribute object found in results');
          continue;
        }
        
        try {
          // Get detailed tribute data using the persistence layer
          const detailedResult = await tributePersistence.getTributeById(tribute.ID, { fetch });
          
          if (detailedResult.success && detailedResult.data) {
            // Transform the detailed tribute to match the expected format
            detailedTributes.push({
              ID: detailedResult.data.id,
              loved_one_name: detailedResult.data.loved_one_name,
              slug: detailedResult.data.slug,
              created_at: detailedResult.data.created_at,
              updated_at: detailedResult.data.updated_at,
              custom_html: detailedResult.data.custom_html,
              phone_number: detailedResult.data.phone_number,
              number_of_streams: detailedResult.data.number_of_streams
            });
          } else {
            // If we can't get detailed data, use the basic tribute
            console.warn(`Warning: Could not fetch detailed data for tribute ${tribute.ID}:`, detailedResult.error);
            detailedTributes.push(tribute);
          }
        } catch (tributeError) {
          console.warn(`Warning: Could not fetch detailed data for tribute ${tribute.ID}:`, tributeError);
          detailedTributes.push(tribute);
        }
      }
    }
    
    // 3. Fetch active events
    const eventsResult = await eventsPersistence.getActiveEvents();
    const activeEvents = eventsResult.success ? eventsResult.data : [];
    
    // 3. Fetch user form data to check if they have memorial form data
    const formDataResult = await tributePersistence.getFormData(userId, { fetch });
    
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
      isAdmin: isAdmin,
      tributes: tributes,
      detailedTributes: detailedTributes,
      hasMemorialData,
      memorialData,
      activeEvents: activeEvents
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    const isAdmin = locals.user?.user_type === UserRoles.ADMIN;
    return {
      user: locals.user,
      isAdmin: isAdmin,
      tributes: [],
      detailedTributes: [],
      hasMemorialData: false,
      activeEvents: [],
      error: error instanceof Error
        ? `Error loading dashboard data: ${error.message}`
        : 'Error loading dashboard data. Please try again later.'
    };
  }
};