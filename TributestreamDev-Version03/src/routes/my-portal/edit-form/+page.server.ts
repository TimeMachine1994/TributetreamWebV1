import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { validateFuneralDirectorForm } from '$lib/utils/form-validation';
import { TributeApiClient, type FormData as ApiFormData } from '$lib/api/tribute-api-client';
import { tributePersistence } from '$lib/persistence/tribute-persistence';

// Load function to fetch the user's form data
export const load: PageServerLoad = async ({ locals, fetch }) => {
  // Check if user is authenticated
  if (!locals.authenticated || !locals.token || !locals.user) {
    throw redirect(302, '/my-portal');
  }

  try {
    console.log('🔄 Fetching user memorial form data...');
    // Ensure userId is a number for API calls
    const userId = typeof locals.user.id === 'string' 
      ? parseInt(locals.user.id, 10) 
      : locals.user.id;

    // Initialize the persistence layer with the JWT token
    // This ensures proper authentication for API calls
    const apiClient = new TributeApiClient(locals.token);
    tributePersistence.setApiClient(apiClient);

    // Fetch form data using the persistence layer
    console.log('Checking for existing memorial form data...');
    console.log('User ID:', locals.user.id);
    
    const formDataResult = await tributePersistence.getFormData(userId);
    
    // Create a default empty form data object when no data exists
    const defaultFormData = {
      director: { firstName: '', lastName: '' },
      familyMember: { firstName: '', lastName: '', dob: '' },
      deceased: { firstName: '', lastName: '', dob: '', dop: '' },
      contact: { email: locals.user.email || '', phone: '' },
      memorial: { locationName: '', locationAddress: '', time: '', date: '' }
    };
    
    // Initialize form data with default values
    let formData = defaultFormData;
    let fdFormData: ApiFormData = {
      'director-first-name': '',
      'director-last-name': '',
      'family-member-first-name': '',
      'family-member-last-name': '',
      'family-member-dob': '',
      'deceased-first-name': '',
      'deceased-last-name': '',
      'deceased-dob': '',
      'deceased-dop': '',
      'email-address': locals.user.email || '',
      'phone-number': '',
      'location-name': '',
      'location-address': '',
      'memorial-time': '',
      'memorial-date': ''
    };
    
    // If we have form data from the persistence layer, use it
    if (formDataResult.success && formDataResult.data) {
      // Use flat form data structure directly
      fdFormData = formDataResult.data;
      console.log('✅ Found existing memorial form data');
      
      // Convert flat structure to nested for compatibility with existing code
      formData = {
        director: { 
          firstName: fdFormData['director-first-name'] || '',
          lastName: fdFormData['director-last-name'] || ''
        },
        familyMember: {
          firstName: fdFormData['family-member-first-name'] || '',
          lastName: fdFormData['family-member-last-name'] || '',
          dob: fdFormData['family-member-dob'] || ''
        },
        deceased: {
          firstName: fdFormData['deceased-first-name'] || '',
          lastName: fdFormData['deceased-last-name'] || '',
          dob: fdFormData['deceased-dob'] || '',
          dop: fdFormData['deceased-dop'] || ''
        },
        contact: {
          email: fdFormData['email-address'] || locals.user.email || '',
          phone: fdFormData['phone-number'] || ''
        },
        memorial: {
          locationName: fdFormData['location-name'] || '',
          locationAddress: fdFormData['location-address'] || '',
          time: fdFormData['memorial-time'] || '',
          date: fdFormData['memorial-date'] || ''
        }
      };
    } else {
      console.log('ℹ️ No existing memorial form data found, using default empty template');
      console.log('Creating new form with default values:', formData);
    }

    // Fetch tribute data using the persistence layer for better caching and error handling
    const tributesResult = await tributePersistence.getTributesByUser(userId);
    let tribute = null;
    
    if (tributesResult.success && tributesResult.data && tributesResult.data.length > 0) {
      tribute = tributesResult.data[0];
    }
    
    return {
      fdForm: fdFormData,
      tribute: tribute
    };
  } catch (err) {
    console.error('Error fetching form data:', err);
    throw error(500, 'Failed to fetch form data');
  }
};

export const actions = {
  default: async ({ request, locals, fetch }) => {
    console.log('🚀 Starting fd-form update action.');
    
    // Check if user is authenticated
    if (!locals.authenticated || !locals.token || !locals.user) {
      return fail(401, {
        error: true,
        message: 'You must be logged in to update your form.'
      });
    }
    
    try {
      // Step 1: Parse form data
      console.log('📝 Parsing form data...');
      const formData = await request.formData();
      const data = {
        directorFirstName: formData.get('director-first-name')?.toString() || '',
        directorLastName: formData.get('director-last-name')?.toString() || '',
        familyMemberFirstName: formData.get('family-member-first-name')?.toString() || '',
        familyMemberLastName: formData.get('family-member-last-name')?.toString() || '',
        familyMemberDOB: formData.get('family-member-dob')?.toString() || '',
        deceasedFirstName: formData.get('deceased-first-name')?.toString() || '',
        deceasedLastName: formData.get('deceased-last-name')?.toString() || '',
        deceasedDOB: formData.get('deceased-dob')?.toString() || '',
        deceasedDOP: formData.get('deceased-dop')?.toString() || '',
        email: formData.get('email-address')?.toString() || '',
        phone: formData.get('phone-number')?.toString() || '',
        locationName: formData.get('location-name')?.toString() || '',
        locationAddress: formData.get('location-address')?.toString() || '',
        memorialTime: formData.get('memorial-time')?.toString() || '',
        memorialDate: formData.get('memorial-date')?.toString() || '',
      };
      
      // Step 2: Validate form data
      console.log('🔍 Validating form data...');
      const validation = validateFuneralDirectorForm(data);
      if (!validation.isValid) {
        console.error('❌ Validation errors:', validation.errors);
        
        // Map validation errors to form field names for client-side processing
        const fieldErrors: Record<string, string> = {};
        
        validation.errors.forEach(error => {
          if (error.includes("Director's first name")) {
            fieldErrors["director-first-name"] = error;
          } else if (error.includes("Director's last name")) {
            fieldErrors["director-last-name"] = error;
          } else if (error.includes("Deceased's first name")) {
            fieldErrors["deceased-first-name"] = error;
          } else if (error.includes("Deceased's last name")) {
            fieldErrors["deceased-last-name"] = error;
          } else if (error.includes("Email address")) {
            fieldErrors["email-address"] = error;
          } else if (error.includes("phone number")) {
            fieldErrors["phone-number"] = error;
          } else if (error.includes("Memorial location name")) {
            fieldErrors["location-name"] = error;
          } else if (error.includes("deceased date of birth")) {
            fieldErrors["deceased-dob"] = error;
          } else if (error.includes("deceased date of passing")) {
            fieldErrors["deceased-dop"] = error;
          } else if (error.includes("memorial date")) {
            fieldErrors["memorial-date"] = error;
          }
        });
        
        return fail(400, {
          error: true,
          message: validation.errors.join('. '),
          errors: fieldErrors,
          formData: {
            "director-first-name": data.directorFirstName || "",
            "director-last-name": data.directorLastName || "",
            "family-member-first-name": data.familyMemberFirstName || "",
            "family-member-last-name": data.familyMemberLastName || "",
            "family-member-dob": data.familyMemberDOB || "",
            "deceased-first-name": data.deceasedFirstName || "",
            "deceased-last-name": data.deceasedLastName || "",
            "deceased-dob": data.deceasedDOB || "",
            "deceased-dop": data.deceasedDOP || "",
            "email-address": data.email || "",
            "phone-number": data.phone || "",
            "location-name": data.locationName || "",
            "location-address": data.locationAddress || "",
            "memorial-time": data.memorialTime || "",
            "memorial-date": data.memorialDate || ""
          }
        });
      }

      // Step 3: Initialize the persistence layer
      const apiClient = new TributeApiClient(locals.token);
      tributePersistence.setApiClient(apiClient);
      
      // Ensure userId is a number for API calls
      const userId = typeof locals.user.id === 'string' 
        ? parseInt(locals.user.id, 10) 
        : locals.user.id;
      
      // Format the form data for our API
      const apiFormData: ApiFormData = {
        'director-first-name': data.directorFirstName || '',
        'director-last-name': data.directorLastName || '',
        'family-member-first-name': data.familyMemberFirstName || '',
        'family-member-last-name': data.familyMemberLastName || '',
        'family-member-dob': data.familyMemberDOB || '',
        'deceased-first-name': data.deceasedFirstName || '',
        'deceased-last-name': data.deceasedLastName || '',
        'deceased-dob': data.deceasedDOB || '',
        'deceased-dop': data.deceasedDOP || '',
        'email-address': data.email || '',
        'phone-number': data.phone || '',
        'location-name': data.locationName || '',
        'location-address': data.locationAddress || '',
        'memorial-time': data.memorialTime || '',
        'memorial-date': data.memorialDate || ''
      };
      
      // Step 4: Find if the user has an existing tribute to update
      let tributeId: number | undefined;
      
      try {
        const tributesResult = await tributePersistence.getTributesByUser(userId, { forceRefresh: true });
        if (tributesResult.success && tributesResult.data && tributesResult.data.length > 0) {
          tributeId = tributesResult.data[0].id;
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch tributes:', error);
        // Continue with form data update even if we can't get tributes
      }
      
      // Step 5: Update form data using the persistence layer
      console.log('📝 Updating form data...');
      const saveResult = await tributePersistence.saveFormData(userId, apiFormData, tributeId);
      
      if (!saveResult.success) {
        console.error('❌ Form data update failed:', saveResult.error);
        return fail(500, { 
          error: true, 
          message: saveResult.error || 'Failed to update form data',
          formData: apiFormData
        });
      }
      
      console.log('✅ Form data updated successfully.');
      
      // If we don't have a tribute but have enough information to create one, do so
      if (!tributeId && data.deceasedFirstName && data.deceasedLastName) {
        try {
          console.log('🚀 Creating new tribute record...');
          const createResult = await tributePersistence.createTribute({
            user_id: userId,
            loved_one_name: `${data.deceasedFirstName} ${data.deceasedLastName}`,
            phone_number: data.phone || '000-000-0000' 
          });
          
          if (createResult.success) {
            console.log('✅ New tribute created successfully:', createResult.tributeId);
          } else {
            console.warn('⚠️ Tribute creation warning:', createResult.error);
          }
        } catch (tributeError) {
          console.warn('⚠️ Tribute creation error:', tributeError);
          // Continue even if tribute creation fails
        }
      }
      
      // Return success response
      return {
        success: true,
        message: 'Your memorial information has been updated successfully.',
        formData: apiFormData
      };
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      return fail(500, {
        error: true,
        message: 'An unexpected error occurred. Please try again.'
      });
    }
  }
} satisfies Actions;