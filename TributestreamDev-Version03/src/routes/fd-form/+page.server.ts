import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { generateSecurePassword, setAuthCookies } from '$lib/utils/auth-helpers';
import { validateFuneralDirectorForm } from '$lib/utils/form-validation';
import { createTributeSlug } from '$lib/utils/string-helpers';
import { registerWordPressUser } from '$lib/server/wp-user-service';

/**
 * Parse form data from FormData object
 * @param formData - FormData object from request
 * @returns Parsed form data object
 */
function parseFormData(formData: FormData) {
    return {
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
}

export const actions = {
    default: async ({ request, fetch, cookies }) => {
        console.log('🚀 Starting fd-form action.');
        let slug = '';
        try {
            // Step 1: Parse form data
            console.log('📝 Parsing form data...');
            const formData = await request.formData();
            const data = parseFormData(formData);
            
            // Step 2: Validate form data
            console.log('🔍 Validating form data...');
            const validation = validateFuneralDirectorForm(data);
            if (!validation.isValid) {
                console.error('❌ Validation errors:', validation.errors);
                
                // Map validation errors to form field names for client-side processing
                const fieldErrors: Record<string, string> = {};
                
                validation.errors.forEach(error => {
                    // Map backend field names to form field names
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
                    // Memorial location name is no longer required, but we'll keep the mapping for other error types
                    } else if (error.includes("Memorial location")) {
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
                    // Return the submitted form data to preserve all values
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
            
            // Step 3: Generate a secure random password
            console.log('🔐 Generating a secure password.');
            const password = generateSecurePassword(16);
            console.log('✅ Password generated successfully');
            
            // Step 4: Register the user with graceful error handling
            console.log('🔄 Registering user...');
            let userId: number | undefined;
            let registrationStatusMessage: string | undefined;
            
            // Use our new registerWordPressUser function
            const registrationResult = await registerWordPressUser({
                email: data.email,
                firstName: data.familyMemberFirstName || data.directorFirstName,
                lastName: data.familyMemberLastName || data.directorLastName,
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

            // Step 5: Authenticate the user (only if registration was successful)
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

            // Step 6: Store the JWT token in cookies (only if authentication was successful)
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

            // Step 7: Store user metadata (only if we have a user ID and auth token)
            if (userId && authToken) {
                console.log('📝 Writing user metadata...');
                const metaPayload = {
                    user_id: userId,
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


            // Step 8: Create the tribute record
            console.log('🚀 Creating tribute...');
            
            // Generate the slug
            slug = createTributeSlug(`${data.deceasedFirstName} ${data.deceasedLastName}`);

            // We can create a tribute even without a user ID in some cases
            let tributeCreated = false;
            
            if (authToken) {
                // Prepare the tribute payload
                const tributePayload = {
                    loved_one_name: `${data.deceasedFirstName} ${data.deceasedLastName}`,
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
            
            
            // Send both customer confirmation and internal notification emails
            try {
                console.log('📧 Sending dual emails: customer confirmation and internal notification...');
                
                // Create a comprehensive formData object with all relevant information
                const emailFormData = {
                    // Director information
                    directorFirstName: data.directorFirstName,
                    directorLastName: data.directorLastName,
                    
                    // Family member information
                    familyMemberFirstName: data.familyMemberFirstName,
                    familyMemberLastName: data.familyMemberLastName,
                    familyMemberDOB: data.familyMemberDOB,
                    
                    // Deceased information
                    deceasedFirstName: data.deceasedFirstName,
                    deceasedLastName: data.deceasedLastName,
                    deceasedDOB: data.deceasedDOB,
                    deceasedDOP: data.deceasedDOP,
                    
                    // Contact information
                    email: data.email,
                    phone: data.phone,
                    
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

                // Send both emails using the new API endpoint with dual email functionality
                // Include the registration status message
                const emailResponse = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'dual',
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
            
            // Step 9: Redirect to the appropriate page
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
                                "director-first-name": "",
                                "director-last-name": "",
                                "family-member-first-name": "",
                                "family-member-last-name": "",
                                "family-member-dob": "",
                                "deceased-first-name": "",
                                "deceased-last-name": "",
                                "deceased-dob": "",
                                "deceased-dop": "",
                                "email-address": "",
                                "phone-number": "",
                                "location-name": "",
                                "location-address": "",
                                "memorial-time": "",
                                "memorial-date": ""
                            }
                        });
        }

    }
} satisfies Actions;
