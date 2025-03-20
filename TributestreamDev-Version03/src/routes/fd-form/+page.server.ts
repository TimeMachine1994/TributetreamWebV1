import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { validateFuneralDirectorForm } from '$lib/utils/form-validation';
import { createTributeSlug } from '$lib/utils/string-helpers';
import { TributeApiClient } from '$lib/api/tribute-api-client';
import type { FormData as ApiFormData } from '$lib/api/tribute-api-client';
import { tributePersistence } from '$lib/persistence/tribute-persistence';

export const load: PageServerLoad = async ({ locals, fetch }) => {
  // Initialize empty form data for new submissions
  const formData = {
    director: { firstName: '', lastName: '' },
    familyMember: { firstName: '', lastName: '', dob: '' },
    deceased: { firstName: '', lastName: '', dob: '', dop: '' },
    contact: { email: '', phone: '' },
    memorial: { locationName: '', locationAddress: '', time: '', date: '' }
  };
  
  // If the user is authenticated, we can pre-fill some information
  if (locals.authenticated && locals.user) {
    formData.contact.email = locals.user.email || '';
  }
  
  return { formData };
};

export const actions = {
  default: async ({ request, locals, fetch }) => {
    console.log('🚀 Starting fd-form action.');
    
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
          }
        });
        
        return fail(400, {
          error: true,
          message: validation.errors.join('. '),
          errors: fieldErrors,
          formData: {
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
          }
        });
      }
      
      // Step 3: Initialize our persistence layer
      // If user is authenticated, use their token
      if (locals.authenticated && locals.token) {
        const apiClient = new TributeApiClient(locals.token);
        tributePersistence.setApiClient(apiClient);
      }
      
      // Step 4: Format the form data for our API
      const apiFormData: ApiFormData = {
        'director-first-name': data.directorFirstName,
        'director-last-name': data.directorLastName,
        'family-member-first-name': data.familyMemberFirstName,
        'family-member-last-name': data.familyMemberLastName,
        'family-member-dob': data.familyMemberDOB,
        'deceased-first-name': data.deceasedFirstName,
        'deceased-last-name': data.deceasedLastName,
        'deceased-dob': data.deceasedDOB,
        'deceased-dop': data.deceasedDOP,
        'email-address': data.email,
        'phone-number': data.phone,
        'location-name': data.locationName,
        'location-address': data.locationAddress,
        'memorial-time': data.memorialTime,
        'memorial-date': data.memorialDate
      };
      
      // Step 5: Determine if user is logged in and save accordingly
      let tributeId: number | undefined;
      let userId: number;
      
      if (locals.authenticated && locals.user) {
        // User is logged in, save form data to their account
        console.log('👤 User is authenticated, saving to their account');
        
        userId = typeof locals.user.id === 'string'
          ? parseInt(locals.user.id, 10)
          : locals.user.id;
          
        // Save form data
        const saveResult = await tributePersistence.saveFormData(userId, apiFormData);
        
        if (!saveResult.success) {
          console.error('❌ Form data save failed:', saveResult.error);
          return fail(500, {
            error: true,
            message: 'Failed to save your information. Please try again.',
            formData: {
              director: { firstName: data.directorFirstName, lastName: data.directorLastName },
              familyMember: { firstName: data.familyMemberFirstName, lastName: data.familyMemberLastName, dob: data.familyMemberDOB },
              deceased: { firstName: data.deceasedFirstName, lastName: data.deceasedLastName, dob: data.deceasedDOB, dop: data.deceasedDOP },
              contact: { email: data.email, phone: data.phone },
              memorial: { locationName: data.locationName, locationAddress: data.locationAddress, time: data.memorialTime, date: data.memorialDate }
            }
          });
        }
        
        // Check for existing tribute or create a new one
        try {
          const tributesResult = await tributePersistence.getTributesByUser(userId, { forceRefresh: true });
          
          if (tributesResult.success && tributesResult.data && tributesResult.data.length > 0) {
            // Update existing tribute
            tributeId = tributesResult.data[0].id;
            console.log('ℹ️ Found existing tribute:', tributeId);
            
            const updateResult = await tributePersistence.updateTribute(tributeId, {
              loved_one_name: `${data.deceasedFirstName} ${data.deceasedLastName}`,
              phone_number: data.phone
            });
            
            if (!updateResult.success) {
              console.warn('⚠️ Tribute update warning:', updateResult.error);
            }
          } else {
            // Create new tribute
            console.log('🆕 Creating new tribute');
            const slug = createTributeSlug(`${data.deceasedFirstName}-${data.deceasedLastName}`);
            
            const createResult = await tributePersistence.createTribute({
              user_id: userId,
              loved_one_name: `${data.deceasedFirstName} ${data.deceasedLastName}`,
              phone_number: data.phone,
              slug: slug
            });
            
            if (createResult.success) {
              tributeId = createResult.tributeId;
              console.log('✅ Created new tribute with ID:', tributeId);
            } else {
              console.warn('⚠️ Failed to create tribute:', createResult.error);
            }
          }
        } catch (error) {
          console.warn('⚠️ Tribute operation warning:', error);
        }
      } else {
        // User is not logged in, they'll need to create an account
        // We still send an email summary of their form
        console.log('👤 User is not authenticated, sending email only');
      }
      
      // Step 7: Send email confirmation
      try {
        console.log('📧 Sending email confirmation...');
        const emailData = {
          // Format the data for both customer and internal emails
          directorName: `${data.directorFirstName} ${data.directorLastName}`,
          familyMemberName: `${data.familyMemberFirstName} ${data.familyMemberLastName}`,
          familyMemberDOB: data.familyMemberDOB,
          deceasedName: `${data.deceasedFirstName} ${data.deceasedLastName}`,
          deceasedDOB: data.deceasedDOB,
          deceasedDOP: data.deceasedDOP,
          email: data.email,
          phone: data.phone,
          locationName: data.locationName,
          locationAddress: data.locationAddress,
          memorialTime: data.memorialTime,
          memorialDate: data.memorialDate,
          submissionDate: new Date().toISOString(),
          familyMemberLastName: data.familyMemberLastName || data.deceasedLastName // Used by the email service
        };
        
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'fd-form',
            formData: emailData
          })
        });
        
        const emailResult = await emailResponse.json();
        
        if (!emailResult.success) {
          console.warn('⚠️ Email sending warning:', emailResult.message);
        } else {
          console.log('✅ Email sent successfully');
        }
      } catch (emailError) {
        console.warn('⚠️ Email sending error:', emailError);
      }
      
      // Step 8: Return success response with appropriate redirect
      if (locals.authenticated) {
        // Return tribute URL for authenticated users
        const tributeSlug = tributeId 
          ? createTributeSlug(`${data.deceasedFirstName}-${data.deceasedLastName}`)
          : '';
        
        return {
          success: true,
          message: 'Your memorial information has been saved.',
          tributeId,
          tributeSlug,
          redirect: tributeSlug ? `/celebration-of-life-for-${tributeSlug}` : '/my-portal/dashboard'
        };
      } else {
        // For non-authenticated users, redirect to account creation
        return {
          success: true,
          message: 'Your memorial information has been submitted.',
          redirect: '/create-account?formSubmitted=true'
        };
      }
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      return fail(500, {
        error: true,
        message: 'An unexpected error occurred. Please try again.'
      });
    }
  }
} satisfies Actions;
