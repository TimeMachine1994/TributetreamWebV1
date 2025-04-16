import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { generateSecurePassword } from '$lib/utils/auth-helpers';
import { validateFuneralDirectorForm } from '$lib/utils/form-validation';
import { createTributeSlug } from '$lib/utils/string-helpers';
import { registerWordPressUser } from '$lib/server/wp-user-service';

/*╔══════════════════════════════════════════════════════════════╗
  ║                STEP 1: PARSE FORM DATA                       ║
  ╚══════════════════════════════════════════════════════════════╝*/

/**
 * Parse form data from FormData object
 * @param formData - FormData object from request
 * @returns Parsed form data object
 */
function parseFormData(formData: FormData) {
    return {
        directorName:       formData.get('director-name')       as string,
        familyMemberName:   formData.get('family-member-name')  as string,
        lovedOneName:       formData.get('loved-one-name')      as string,
        email:              formData.get('email-address')       as string,
        phone:              formData.get('phone-number')        as string,
        contactPreference:  formData.get('contact-preference')  as string,
        locationName:       formData.get('location-name')       as string,
        locationAddress:    formData.get('location-address')    as string,
        memorialTime:       formData.get('memorial-time')       as string,
        memorialDate:       formData.get('memorial-date')       as string,
    };
}

export const actions = {
    default: async ({ request, fetch, cookies }) => {
        console.log('🚀 Starting fd-form action.');
        let slug = '';
        try {
            /*═════════════════════════════════════════════════════════
                      STEP 2: PARSE AND VALIDATE FORM DATA
              ═════════════════════════════════════════════════════════*/

            // Parse form data
            console.log('📝 Parsing form data...');
            const formData = await request.formData();
            const data = parseFormData(formData);
            
            // Validate form data
            console.log('🔍 Validating form data...');
            const validation = validateFuneralDirectorForm(data);
            
            if (!validation.isValid) {
                console.error('❌ Validation errors:', validation.errors);
                
                // Map validation errors to form field names for client-side processing
                const fieldErrors: Record<string, string> = {};
                
                validation.errors.forEach(error => {
                    // Map backend field names to form field names
                    if (error.includes("Director's name")) {
                        fieldErrors["director-name"] = error;
                    } else if (error.includes("Loved one's name")) {
                        fieldErrors["loved-one-name"] = error;
                    } else if (error.includes("Email address")) {
                        fieldErrors["email-address"] = error;
                    } else if (error.includes("phone number")) {
                        fieldErrors["phone-number"] = error;
                    // Memorial location name is no longer required, but we'll keep the mapping for other error types
                    } else if (error.includes("Memorial location")) {
                        fieldErrors["location-name"] = error;
                    } else if (error.includes("memorial date")) {
                        fieldErrors["memorial-date"] = error;
                    }
                });
                
                return fail(400, {
                    error: true,
                    message: validation.errors.join('. '),
                    errors: fieldErrors,
                    // Return the submitted form data to preserve all values
                    formData: {
                        "director-name":       data.directorName     || "",
                        "family-member-name":  data.familyMemberName || "",
                        "loved-one-name":      data.lovedOneName     || "",
                        "email-address":            data.email                 || "",
                        "phone-number":             data.phone                 || "",
                        "location-name":            data.locationName          || "",
                        "location-address":         data.locationAddress       || "",
                        "memorial-time":            data.memorialTime          || "",
                        "memorial-date":            data.memorialDate          || ""
                    }
                });
            }
            
            /*═════════════════════════════════════════════════════════
                      STEP 3: GENERATE SECURE PASSWORD
              ═════════════════════════════════════════════════════════*/

            console.log('🔐 Generating a secure password.');
            const password = generateSecurePassword(16);
            console.log('✅ Password generated successfully');
            
            /*═════════════════════════════════════════════════════════
                     STEP 4: REGISTER USER WITH WORDPRESS
              ═════════════════════════════════════════════════════════*/

            console.log('🔄 Registering user...');
            let userId: number | undefined;
            let registrationStatusMessage: string | undefined;
            
            // Use our new registerWordPressUser function
            const registrationResult = await registerWordPressUser({
                email: data.email,
                firstName: (data.familyMemberName || data.directorName).split(" ")[0],
                lastName: (data.familyMemberName || data.directorName).split(" ").slice(1).join(" "),
                username: data.email,
                password: password
            });
            
            if (registrationResult.success) {
                // Registration successful
                userId = registrationResult.userId;
                registrationStatusMessage = `User ${data.email} registered successfully in WordPress (User ID: ${userId || 'N/A'}).`;
                console.log('✅ User registered with ID:', userId);
            } else if (registrationResult.isDuplicate) {
                // Duplicate user - continue with the process
                // We'll still log the actual status for debugging, but won't show it to the user
                console.warn(`Note: User ${data.email} could not be registered because they already exist in WordPress. Form data processed normally.`);
                
                // Need to get the user ID for the existing user
                try {
                    // Attempt to authenticate with the existing user to get their ID
                    const authResponse = await fetch('/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: data.email,
                            password: password // This will likely fail, but we'll handle that
                        })
                    });
                    
                    if (authResponse.ok) {
                        const authResult = await authResponse.json();
                        userId = authResult.user_id;
                    } else {
                        // If authentication fails, we need to fetch the user ID another way
                        // For now, we'll use a placeholder and continue the process
                        console.warn('⚠️ Could not authenticate existing user to get ID');
                        userId = undefined; // We'll handle this case below
                    }
                } catch (authError) {
                    console.warn('⚠️ Error during authentication of existing user:', authError);
                }
                
                // If we couldn't get the user ID, we'll show a message but continue
                if (!userId) {
                    console.warn('⚠️ Proceeding without user ID for duplicate user');
                }
            } else {
                // Other registration error - show warning but continue
                registrationStatusMessage = `Warning: WordPress registration failed for ${data.email}. Reason: ${registrationResult.message}. Form data still processed.`;
                console.error(registrationStatusMessage);
            }

            /*═════════════════════════════════════════════════════════
                     STEP 5: AUTHENTICATE THE USER
              ═════════════════════════════════════════════════════════*/

            let authToken: string | undefined;
            let userDisplayName: string | undefined;
            
            if (registrationResult.success) {
                console.log('🔄 Authenticating user...');
                try {
                    const authResponse = await fetch('/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: data.email,
                            password: password
                        })
                    });
    
                    if (authResponse.ok) {
                        const authResult = await authResponse.json();
                        authToken = authResult.token;
                        userDisplayName = authResult.user_display_name;
                        console.log('✅ User authenticated. JWT token received');
                    } else {
                        const authError = await authResponse.json();
                        console.error('❌ Authentication failed:', authError);
                        registrationStatusMessage += ' However, automatic login failed.';
                    }
                } catch (authError) {
                    console.error('❌ Authentication error:', authError);
                    registrationStatusMessage += ' However, automatic login failed due to an error.';
                }
            } else {
                console.log('⏩ Skipping authentication for duplicate or failed registration');
            }

            /*═════════════════════════════════════════════════════════
                     STEP 6: STORE JWT TOKEN IN COOKIES
              ═════════════════════════════════════════════════════════*/

            if (authToken) {
                console.log('🔐 Storing authentication tokens...');
                cookies.set('jwt_token', authToken, { // Using jwt_token to match hooks.server.ts
                    httpOnly: true,
                    secure: true,
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                });
                
                // Also store user data in cookie for client-side access
                cookies.set('user', JSON.stringify({
                    id: userId,
                    name: userDisplayName || data.email,
                    email: data.email
                }), {
                    httpOnly: false, // Client accessible
                    secure: true,
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                });
            } else {
                console.log('⏩ Skipping cookie storage due to missing authentication token');
            }

            /*═════════════════════════════════════════════════════════
                     STEP 7: STORE USER METADATA 
              ═════════════════════════════════════════════════════════*/

            if (userId && authToken) {
                console.log('📝 Writing user metadata...');
                const metaPayload = {
                    user_id: userId,
                    meta_key: 'memorial_form_data',
                    meta_value: JSON.stringify({
                        director: {
                            fullName: data.directorName
                        },
                        familyMember: {
                            fullName: data.familyMemberName
                        },
                        lovedOne: {
                            fullName: data.lovedOneName
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
                
                try {
                    const metaResponse = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/user-meta', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify(metaPayload)
                    });
                    
                    if (metaResponse.ok) {
                        console.log('✅ Metadata written successfully.');
                    } else {
                        const metaError = await metaResponse.json();
                        console.error('❌ Metadata write failed:', metaError);
                        registrationStatusMessage += ' However, user metadata could not be saved.';
                    }
                } catch (metaError) {
                    console.error('❌ Error during metadata write:', metaError);
                    registrationStatusMessage += ' However, user metadata could not be saved due to an error.';
                }
            } else {
                console.log('⏩ Skipping metadata write due to missing user ID or auth token');
            }


            /*═════════════════════════════════════════════════════════
                     STEP 8: CREATE THE TRIBUTE RECORD
              ═════════════════════════════════════════════════════════*/

            console.log('🚀 Creating tribute...');
            
            // Generate the slug
            slug = createTributeSlug(data.lovedOneName);

            // We can create a tribute even without a user ID in some cases
            let tributeCreated = false;
            
            if (authToken) {
                // Prepare the tribute payload
                const tributePayload = {
                    loved_one_name: data.lovedOneName,
                    slug,
                    user_id: userId, // This might be undefined for duplicate users
                    phone_number: data.phone || '000-000-0000' // Ensure we have a phone number
                };
                
                console.log('📦 Sending tribute payload:', tributePayload);
                
                try {
                    const tributeResponse = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tributes', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify(tributePayload)
                    });
                    
                    if (tributeResponse.ok) {
                        const tributeResult = await tributeResponse.json();
                        console.log('✅ Tribute created successfully:', tributeResult);
                        tributeCreated = true;
                    } else {
                        const tributeError = await tributeResponse.json();
                        console.error('❌ Tribute creation failed:', tributeError);
                        registrationStatusMessage += ' However, tribute record could not be created.';
                    }
                } catch (tributeError) {
                    console.error('❌ Error during tribute creation:', tributeError);
                    registrationStatusMessage += ' However, tribute record could not be created due to an error.';
                }
            } else {
                console.log('⏩ Skipping tribute creation due to missing auth token');
                registrationStatusMessage += ' Tribute record could not be created due to missing authentication.';
            }
            
            /*═════════════════════════════════════════════════════════
                     STEP 9: SEND CONFIRMATION EMAILS
              ═════════════════════════════════════════════════════════*/
            
            // Send both customer confirmation and internal notification emails
            try {
                console.log('📧 Sending dual emails: customer confirmation and internal notification...');
                
                // Create a comprehensive formData object with all relevant information
                const emailFormData = {
                    // Director information
                    directorName: data.directorName,
                    
                    // Family member information
                    familyMemberName: data.familyMemberName,
                    
                    // Loved one information
                    lovedOneName: data.lovedOneName,
                    
                    // Contact information
                    email: data.email,
                    phone: data.phone,
                    contactPreference: data.contactPreference || 'follow-up',
                    
                    // Memorial information
                    locationName: data.locationName,
                    locationAddress: data.locationAddress,
                    memorialTime: data.memorialTime,
                    memorialDate: data.memorialDate,
                    
                    // Account information (for internal use only)
                    username: data.email,
                    password: password,
                    
                    // Generated tribute information
                    slug: slug,
                    tributeLink: `https://tributestream.com/celebration-of-life-for-${slug}`,
                    
                    // Metadata
                    submissionDate: new Date().toISOString(),
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    
                    // Add the isDuplicate flag from the registration result
                    isDuplicate: registrationResult.isDuplicate || false
                };

                // Determine email type based on contact preference
                const emailType = data.contactPreference === 'do-not-contact' ? 'internal-only' : 'dual';
                
                // Send the appropriate emails based on contact preference
                const emailResponse = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: emailType,
                        formData: {
                            ...emailFormData,
                            registrationStatus: registrationStatusMessage
                        }
                    })
                });
                
                const emailResult = await emailResponse.json();
                
                if (emailResult.success) {
                    console.log('✅ Emails sent successfully');
                } else {
                    console.warn('⚠️ Email sending partial success or failure:', emailResult);
                }
            } catch (emailError) {
                console.warn('⚠️ Email notification failed, but process continues:', emailError);
            }
            
            /*═════════════════════════════════════════════════════════
                     STEP 10: REDIRECT TO APPROPRIATE PAGE
              ═════════════════════════════════════════════════════════*/

            if (tributeCreated) {
                // Redirect to the newly created tribute page
                console.log('🔀 Redirecting to created tribute page...');
                console.log('🔍 DEBUG: Slug value at redirect:', slug);
                
                // Use redirect in the success path inside the try block
                throw redirect(303, `/celebration-of-life-for-${slug}`);
            } else {
                // If tribute wasn't created but we still processed the form, show a success message
                console.log('🔀 Redirecting to success page without tribute...');
                
                // Return success with the standardized message for duplicate users
                return {
                    success: true,
                    message: "Your form was submitted successfully. Our team will contact you shortly.",
                    // Not including registrationStatus so it won't be displayed
                    isPartialSuccess: true // Flag to indicate this is a partial success (for styling)
                };
            }
            
        } catch (error) {
            // Check for SvelteKit redirect objects - improved detection
            if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
                console.log('🚀 Detected redirect, re-throwing:', error);
                throw error; // Re-throw redirects
            }
            
            console.error('💥 Unexpected error:', error);
            return fail(500, {
                error: true,
                message: 'An unexpected error occurred. Please try again.',
                // For generic errors, we just return a message without form data
                // since we can't guarantee data is available in the catch block
                formData: {
                    "director-name":       "",
                    "family-member-name":  "",
                    "loved-one-name":      "",
                    "email-address":       "",
                    "phone-number":        "",
                    "location-name":       "",
                    "location-address":    "",
                    "memorial-time":       "",
                    "memorial-date":       ""
                }
            });
        }
    }
} satisfies Actions;
