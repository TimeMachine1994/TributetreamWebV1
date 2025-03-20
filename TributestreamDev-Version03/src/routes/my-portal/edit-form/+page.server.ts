import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { validateFuneralDirectorForm } from '$lib/utils/form-validation';

// Load function to fetch the user's form data
export const load: PageServerLoad = async ({ locals, fetch }) => {
  // Check if user is authenticated
  if (!locals.authenticated || !locals.token || !locals.user) {
    throw redirect(302, '/my-portal');
  }

  try {
    console.log('🔄 Fetching user memorial form data...');
    const userId = locals.user.id;

    // Fetch user metadata to get the form data
    const metaResponse = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/user-meta?user_id=${userId}&meta_key=memorial_form_data`, {
      headers: {
        'Authorization': `Bearer ${locals.token}`
      }
    });

    if (!metaResponse.ok) {
      throw error(metaResponse.status, 'Failed to fetch form data');
    }

    const metaData = await metaResponse.json();
    
    console.log('Checking for existing memorial form data...');
    console.log('User ID:', locals.user.id);
    console.log('Meta response status:', metaResponse.status);
    console.log('Meta data:', metaData);

    // Create a default empty form data object when no data exists
    let formData = {
      director: { firstName: '', lastName: '' },
      familyMember: { firstName: '', lastName: '', dob: '' },
      deceased: { firstName: '', lastName: '', dob: '', dop: '' },
      contact: { email: locals.user.email || '', phone: '' },
      memorial: { locationName: '', locationAddress: '', time: '', date: '' }
    };
    
    // If we have metadata, use it instead of the default empty data
    if (metaData && metaData.length && metaData[0]?.meta_value) {
      formData = JSON.parse(metaData[0].meta_value);
      console.log('✅ Found existing memorial form data');
    } else {
      console.log('ℹ️ No existing memorial form data found, using default empty template');
      console.log('Creating new form with default values:', formData);
    }
    
    // Transform the data to match the fd-form format
    const fdFormData = {
      "director-first-name": formData.director?.firstName || '',
      "director-last-name": formData.director?.lastName || '',
      "family-member-first-name": formData.familyMember?.firstName || '',
      "family-member-last-name": formData.familyMember?.lastName || '',
      "family-member-dob": formData.familyMember?.dob || '',
      "deceased-first-name": formData.deceased?.firstName || '',
      "deceased-last-name": formData.deceased?.lastName || '',
      "deceased-dob": formData.deceased?.dob || '',
      "deceased-dop": formData.deceased?.dop || '',
      "email-address": formData.contact?.email || locals.user.email || '',
      "phone-number": formData.contact?.phone || '',
      "location-name": formData.memorial?.locationName || '',
      "location-address": formData.memorial?.locationAddress || '',
      "memorial-time": formData.memorial?.time || '',
      "memorial-date": formData.memorial?.date || ''
    };

    // Fetch tribute data as well
    const tributeResponse = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tributes?user_id=${userId}`, {
      headers: {
        'Authorization': `Bearer ${locals.token}`
      }
    });

    const tributeData = await tributeResponse.json();
    
    return {
      fdForm: fdFormData,
      tribute: tributeData?.length ? tributeData[0] : null
    };
  } catch (error) {
    console.error('Error fetching form data:', error);
    throw error;
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
        directorFirstName: formData.get('director-first-name') as string,
        directorLastName: formData.get('director-last-name') as string,
        familyMemberFirstName: formData.get('family-member-first-name') as string,
        familyMemberLastName: formData.get('family-member-last-name') as string,
        familyMemberDOB: formData.get('family-member-dob') as string,
        deceasedFirstName: formData.get('deceased-first-name') as string,
        deceasedLastName: formData.get('deceased-last-name') as string,
        deceasedDOB: formData.get('deceased-dob') as string,
        deceasedDOP: formData.get('deceased-dop') as string,
        email: formData.get('email-address') as string,
        phone: formData.get('phone-number') as string,
        locationName: formData.get('location-name') as string,
        locationAddress: formData.get('location-address') as string,
        memorialTime: formData.get('memorial-time') as string,
        memorialDate: formData.get('memorial-date') as string,
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
      
      // Step 3: Update user metadata
      console.log('📝 Updating user metadata...');
      const metaPayload = {
        user_id: locals.user.id,
        meta_key: 'memorial_form_data',
        meta_value: JSON.stringify({
          director: {
            firstName: data.directorFirstName,
            lastName: data.directorLastName
          },
          familyMember: {
            firstName: data.familyMemberFirstName,
            lastName: data.familyMemberLastName,
            dob: data.familyMemberDOB
          },
          deceased: {
            firstName: data.deceasedFirstName,
            lastName: data.deceasedLastName,
            dob: data.deceasedDOB,
            dop: data.deceasedDOP
          },
          contact: {
            email: data.email,
            phone: data.phone
          },
          memorial: {
            locationName: data.locationName,
            locationAddress: data.locationAddress,
            time: data.memorialTime,
            date: data.memorialDate
          }
        })
      };
      
      const metaResponse = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/user-meta', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${locals.token}`
        },
        body: JSON.stringify(metaPayload)
      });
      
      // Handle metadata errors
      if (!metaResponse.ok) {
        const metaError = await metaResponse.json();
        console.error('❌ Metadata update failed:', metaError);
        return fail(metaResponse.status, { 
          error: true, 
          message: metaError.message || 'Failed to update user metadata',
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
      
      console.log('✅ Metadata updated successfully.');
      
      // Step 4: Update tribute record if needed
      try {
        console.log('🔄 Fetching tribute data...');
        const tributeResponse = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tributes?user_id=${locals.user.id}`, {
          headers: {
            'Authorization': `Bearer ${locals.token}`
          }
        });
        
        const tributes = await tributeResponse.json();
        
        if (tributes && tributes.length > 0) {
          console.log('🚀 Updating tribute...');
          const tributeId = tributes[0].ID;
          
          // Update the tribute record
          const tributeUpdatePayload = {
            ID: tributeId,
            loved_one_name: `${data.deceasedFirstName} ${data.deceasedLastName}`,
            phone_number: data.phone || '000-000-0000'
          };
          
          const tributeUpdateResponse = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tributes/${tributeId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${locals.token}`
            },
            body: JSON.stringify(tributeUpdatePayload)
          });
          
          if (!tributeUpdateResponse.ok) {
            console.warn('⚠️ Tribute update warning:', await tributeUpdateResponse.text());
          } else {
            console.log('✅ Tribute updated successfully.');
          }
        }
      } catch (tributeError) {
        console.warn('⚠️ Tribute update warning:', tributeError);
        // Continue even if tribute update fails
      }
      
      // Return success response
      return {
        success: true,
        message: 'Your memorial information has been updated successfully.',
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