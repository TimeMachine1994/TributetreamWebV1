import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { generateSecurePassword, setAuthCookies } from '$lib/utils/auth-helpers';
import { validateFuneralDirectorForm } from '$lib/utils/form-validation';

/**
 * Generates a slug from the deceased's name
 * @param firstName - First name of the deceased
 * @param lastName - Last name of the deceased
 * @returns Formatted slug
 */
function generateSlug(firstName: string, lastName: string): string {
    return `${firstName.trim().toLowerCase()}_${lastName.trim().toLowerCase()}`.replace(/\s+/g, '_');
}

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
            
            // Step 4: Register the user
            console.log('🔄 Registering user...');
            const registerResponse = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.email,
                    email: data.email,
                    password: password
                })
            });

            // Handle registration errors
            if (!registerResponse.ok) {
                const registerError = await registerResponse.json();
                console.error('❌ Registration failed:', registerError);
                
                // Handle specific error scenarios
                if (registerError.message?.includes('email already exists')) {
                    return fail(400, {
                        error: true,
                        message: 'An account with this email already exists. Please use a different email address.',
                        errors: {
                            "email-address": 'An account with this email already exists. Please use a different email address.'
                        },
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
                
                return fail(registerResponse.status, {
                    error: true,
                    message: registerError.message || 'Registration failed',
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
            
            const registerResult = await registerResponse.json();
            const userId = registerResult.user_id;
            console.log('✅ User registered with ID:', userId);

            // Step 5: Authenticate the user
            console.log('🔄 Authenticating user...');
            const authResponse = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.email,
                    password: password
                })
            });

            // Handle authentication errors
            if (!authResponse.ok) {
                const authError = await authResponse.json();
                console.error('❌ Authentication failed:', authError);
                return fail(authResponse.status, { 
                    error: true, 
                    message: authError.message || 'Authentication failed after registration',
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

            const authResult = await authResponse.json();
            console.log('✅ User authenticated. JWT token received');

            // Step 6: Store the JWT token in cookies
            console.log('🔐 Storing authentication tokens...');
            cookies.set('jwt_token', authResult.token, { // Using jwt_token to match hooks.server.ts
                httpOnly: true, 
                secure: true, 
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days 
            });
            
            // Also store user data in cookie for client-side access
            cookies.set('user', JSON.stringify({
                id: userId,
                name: authResult.user_display_name || data.email,
                email: data.email
            }), {
                httpOnly: false, // Client accessible
                secure: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });

            // Step 7: Store user metadata
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
            
            const metaResponse = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/user-meta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authResult.token}`
                },
                body: JSON.stringify(metaPayload)
            });

            // Handle metadata errors
            if (!metaResponse.ok) {
                const metaError = await metaResponse.json();
                console.error('❌ Metadata write failed:', metaError);
                return fail(metaResponse.status, { 
                    error: true, 
                    message: metaError.message || 'Failed to save user metadata',
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

            console.log('✅ Metadata written successfully.');

            // Step 8: Create the tribute record
            console.log('🚀 Creating tribute...');
            
            // Generate the slug
             slug = generateSlug(data.deceasedFirstName, data.deceasedLastName);

            // Prepare the tribute payload
            const tributePayload = {
                loved_one_name: `${data.deceasedFirstName} ${data.deceasedLastName}`,
                slug,
                user_id: userId,
                phone_number: data.phone || '000-000-0000' // Ensure we have a phone number
            };
            
            console.log('📦 Sending tribute payload:', tributePayload);
            
            const tributeResponse = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tributes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authResult.token}`
                },
                body: JSON.stringify(tributePayload)
            });
            
            // Handle tribute creation errors
            if (!tributeResponse.ok) {
                const tributeError = await tributeResponse.json();
                console.error('❌ Tribute creation failed:', tributeError);
                return fail(tributeResponse.status, { 
                    error: true, 
                    message: tributeError.message || 'Failed to create tribute',
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
            
            const tributeResult = await tributeResponse.json();
            console.log('✅ Tribute created successfully:', tributeResult);
            
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
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
                };

                // Send both emails using the new API endpoint with dual email functionality
                const emailResponse = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'dual',
                        formData: emailFormData
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
            
            // Step 9: Redirect to the newly created tribute page
            console.log('🔀 Redirecting to created tribute page...');
            
        } catch (error) {
            // Check for SvelteKit redirect objects
            if (error instanceof Error && 'status' in error && 'location' in error) {
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
        throw redirect(303, `/celebration-of-life-for-${slug}`);

    }
} satisfies Actions;
