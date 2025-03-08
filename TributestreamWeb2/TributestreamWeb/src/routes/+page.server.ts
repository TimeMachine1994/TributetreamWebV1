import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createTributeSlug, createTributeUrl } from '$lib/utils/string-helper';
import { saveTribute } from '$lib/utils/api-helpers';
import {
    generateSecurePassword,
    setAuthCookies,
    sendWelcomeEmail,
    storeMasterDataInUserMeta,
    convertMasterStoreToUserMeta
} from '$lib/utils/auth-helpers';
import type { Tribute } from '$lib/stores/unified-store.svelte';

export const actions = {
    createTribute: async ({ request, fetch, cookies }) => {
        let tributeUrl = '';
        try {
            console.log('🔄 Starting createTribute action with unified store...');
            
            // Parse form data
            const formData = await request.formData();
            
            // Debug: Log all form entries
            console.log('🔍 Form data entries:');
            for (const [key, value] of formData.entries()) {
                console.log(`   ${key}: ${value}`);
            }
            
            // Extract form data
            const lovedOneFullName = formData.get('lovedOneInfo.fullName') as string;
            const userFullName = formData.get('userInfo.fullName') as string;
            const userEmail = formData.get('userInfo.emailAddress') as string;
            const userPhone = formData.get('userInfo.phoneNumber') as string;
            
            // Additional fields from the unified store
            const memorialDate = formData.get('memorialInfo.date') as string || new Date().toISOString().split('T')[0];
            const memorialLocation = formData.get('memorialInfo.locations[0].name') as string || '';
            const memorialAddress = formData.get('memorialInfo.locations[0].address') as string || '';
            const memorialStartTime = formData.get('memorialInfo.startTime') as string || '';
            const notes = formData.get('tribute.notes') as string || '';
            
            // Debug: Log extracted values
            console.log('🔍 Extracted form values:');
            console.log(`   lovedOneFullName: "${lovedOneFullName}"`);
            console.log(`   userFullName: "${userFullName}"`);
            console.log(`   userEmail: "${userEmail}"`);
            console.log(`   userPhone: "${userPhone}"`);
            console.log(`   memorialDate: "${memorialDate}"`);
            console.log(`   memorialLocation: "${memorialLocation}"`);
            
            // Validate required fields
            if (!lovedOneFullName || !userFullName || !userEmail || !userPhone) {
                console.error('❌ Missing required fields:', {
                    lovedOneFullName: !lovedOneFullName ? 'MISSING' : 'ok',
                    userFullName: !userFullName ? 'MISSING' : 'ok',
                    userEmail: !userEmail ? 'MISSING' : 'ok',
                    userPhone: !userPhone ? 'MISSING' : 'ok'
                });
                return fail(400, {
                    error: true,
                    message: 'All fields are required to create a tribute.'
                });
            }
            
            // Generate tribute slug
            const tributeSlug = createTributeSlug(lovedOneFullName);
            tributeUrl = createTributeUrl(tributeSlug);
            
            console.log('✅ Generated tribute slug:', tributeSlug);
            console.log('✅ Generated tribute URL:', tributeUrl);
            
            // Generate secure password for user registration
            const password = generateSecurePassword();
            
            console.log('🔄 Registering user...');
            
            // Prepare the registration data
            const registrationData = {
                username: userEmail,
                email: userEmail,
                password: password,
                // All additional data goes in meta object
                meta: {
                    name: userFullName,
                    phone: userPhone,
                    fullName: userFullName,
                    lovedOne: lovedOneFullName
                }
            };
            
            // Debug the exact JSON being sent - with additional tracking
            console.log('📦 Registration payload:', JSON.stringify(registrationData, null, 2));
            
            // Register the user
            const registerResponse = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData)
            });
            
            if (!registerResponse.ok) {
                try {
                    const errorData = await registerResponse.json();
                    console.error('❌ Registration failed with status:', registerResponse.status);
                    console.error('❌ Error details:', JSON.stringify(errorData, null, 2));
                    return fail(registerResponse.status, {
                        error: true,
                        message: errorData.message || 'User registration failed',
                        details: errorData
                    });
                } catch (parseError) {
                    // If we can't parse the error response as JSON
                    console.error('❌ Registration failed with status:', registerResponse.status);
                    console.error('❌ Could not parse error response:', await registerResponse.text());
                    return fail(registerResponse.status, {
                        error: true,
                        message: `User registration failed: ${registerResponse.statusText}`,
                        parseError: true
                    });
                }
            }
            
            const registerResult = await registerResponse.json();
            const userId = registerResult.user_id;
            
            console.log('✅ User registered successfully. User ID:', userId);
            
            // Send welcome email with login credentials
            try {
                console.log('🔄 Sending welcome email...');
                const emailResult = await sendWelcomeEmail(userEmail, userEmail, password, fetch);
                console.log('✅ Welcome email sent successfully');
            } catch (emailError) {
                // Don't fail the registration if email sending fails
                console.warn('⚠️ Failed to send welcome email, but continuing:', emailError);
            }
            
            console.log('🔄 Authenticating user...');
            
            // Authenticate the user
            const authResponse = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: userEmail,
                    password: password
                })
            });
            
            if (!authResponse.ok) {
                console.error('❌ Authentication failed with status:', authResponse.status);
                return fail(authResponse.status, {
                    error: true,
                    message: 'Authentication failed'
                });
            }
            
            const authResult = await authResponse.json();
            console.log('✅ User authenticated successfully.');
            
            // Set authentication cookies
            setAuthCookies(cookies, authResult);
            
            // Store data in user metadata - now using the unified store structure
            const unifiedData = {
                lovedOneInfo: { fullName: lovedOneFullName },
                userInfo: {
                    fullName: userFullName,
                    emailAddress: userEmail,
                    phoneNumber: userPhone
                },
                memorialInfo: {
                    date: memorialDate,
                    startTime: memorialStartTime,
                    locations: [{
                        name: memorialLocation,
                        address: memorialAddress
                    }]
                }
            };
            
            // Use the conversion function to ensure all required fields are present
            const completeUserMetaData = convertMasterStoreToUserMeta(unifiedData);
            console.log('🔄 Complete user meta data structure:', JSON.stringify(completeUserMetaData, null, 2));
            
            await storeMasterDataInUserMeta(userId, completeUserMetaData, authResult.token, fetch);
            console.log('✅ User data stored in user meta.');
            
            // Enhanced tribute data that satisfies both:
            // 1. The TypeScript TributeData interface (which requires user_phone)
            // 2. The API requirements (which needs loved_one_name, slug, user_id, phone_number)
            console.log('🔄 Preparing tribute data with format matching API requirements...');
            const tributeData = {
                // Fields required by TributeData interface
                title: lovedOneFullName,
                slug: tributeSlug,
                user_name: userFullName,
                user_email: userEmail,
                user_phone: userPhone, // Keep this for TypeScript compatibility
                
                // Fields required by the WordPress API
                loved_one_name: lovedOneFullName,
                user_id: userId,
                phone_number: userPhone.replace(/[^0-9]/g, ''), // Strip non-numeric characters
                
                // Optional fields that our unified store uses
                description: `Memorial tribute for ${lovedOneFullName}`,
                memorial_date: memorialDate,
                memorial_location: memorialLocation,
                memorial_address: memorialAddress,
                memorial_time: memorialStartTime,
                notes: notes,
                created_at: new Date().toISOString(),
                
                // Add optional custom_html field and streams count
                custom_html: null, // This can be populated later
                number_of_streams: 1
            };
            
            console.log('🔄 Sending tribute data to API endpoint...');
            console.log('🔍 Tribute data payload:', JSON.stringify(tributeData, null, 2));
            console.log('🔍 Required fields check:');
            console.log('   - loved_one_name:', Boolean(tributeData.loved_one_name));
            console.log('   - slug:', Boolean(tributeData.slug));
            console.log('   - user_id:', Boolean(tributeData.user_id));
            console.log('   - phone_number:', Boolean(tributeData.phone_number));
            console.log('   - title:', Boolean(tributeData.title));
            console.log('   - user_name:', Boolean(tributeData.user_name));
            console.log('   - user_email:', Boolean(tributeData.user_email));
            console.log('   - user_phone:', Boolean(tributeData.user_phone));
            
            // First, directly send the data to the API endpoint using fetch
            // This ensures we're using the server context's fetch implementation
            const apiResponse = await fetch('/api/tributes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authResult.token}`
                },
                body: JSON.stringify(tributeData)
            });
            
            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                console.error('❌ API call failed:', errorData);
                return fail(apiResponse.status, {
                    error: true,
                    message: errorData.error || apiResponse.statusText,
                    details: errorData
                });
            }
            
            // Parse the response from the API
            const apiResult = await apiResponse.json();
            console.log('✅ Tribute API response:', apiResult);
            
            // Get the tribute ID from the API response
            let tributeId;
            
            if (apiResult.tribute && apiResult.tribute.id) {
                // Standard format: { tribute: { id: 123, ... } }
                tributeId = apiResult.tribute.id;
                console.log('✅ Retrieved tribute ID from API response (standard format):', tributeId);
            } else if (apiResult.id) {
                // Direct format: { id: 123, ... }
                tributeId = apiResult.id;
                console.log('✅ Retrieved tribute ID from API response (direct format):', tributeId);
            } else {
                // If we don't have the ID from the direct API call, try the helper function as a fallback
                console.log('⚠️ API response missing tribute ID, trying helper function as fallback');
                const tributeResponse = await saveTribute(tributeData, authResult.token, fetch);
                
                if (!tributeResponse.success) {
                    console.error('❌ Tribute creation failed:', tributeResponse);
                    return fail(500, {
                        error: true,
                        message: tributeResponse.error || 'Failed to create tribute. Please try again.'
                    });
                }
                
                // Try to extract the ID from tributeResponse
                if (tributeResponse.tribute && tributeResponse.tribute.id) {
                    tributeId = tributeResponse.tribute.id;
                    console.log('✅ Retrieved tribute ID from helper function:', tributeId);
                } else if (tributeResponse.tribute && typeof tributeResponse.tribute === 'object') {
                    // Maybe the ID is directly in the tribute object
                    tributeId = tributeResponse.tribute.id || Object.values(tributeResponse.tribute)[0];
                    console.log('✅ Retrieved potential tribute ID from helper function object:', tributeId);
                } else {
                    // Generate a temporary ID (this won't be persistent but prevents errors)
                    tributeId = `temp-${Date.now()}`;
                    console.warn('⚠️ No tribute ID found, using temporary ID:', tributeId);
                }
            }
            
            console.log('✅ Tribute created successfully with ID:', tributeId);
            
            // Include tribute data in form result to update UnifiedStore
            // This would be caught by use:enhance in the component and used to update the store
            const tribute: Partial<Tribute> = {
                ...tributeData,
                id: tributeId
            };
            
            // Structure result to include data for unified store
            const result = {
                success: true,
                data: {
                    // User and loved one info
                    lovedOneInfo: { fullName: lovedOneFullName },
                    userInfo: {
                        fullName: userFullName,
                        emailAddress: userEmail,
                        phoneNumber: userPhone
                    },
                    // Memorial info
                    memorialInfo: {
                        date: memorialDate,
                        startTime: memorialStartTime,
                        locations: [{
                            name: memorialLocation,
                            address: memorialAddress
                        }]
                    },
                    // Tribute data
                    tribute: tribute,
                    // Auth token
                    authToken: authResult.token
                }
            };

            // Log the final success result
            console.log('🎉 Tribute creation complete. Tribute ID:', tributeId);
            console.log('🎯 Tribute URL:', tributeUrl);
            
            console.log('🔀 Redirecting to tribute page...');
            // Redirect to the tribute page
           
        } catch (error) {
            console.error('❌ Unexpected error in createTribute action:', error);
            return fail(500, {
                error: true,
                message: 'An unexpected error occurred'
            });
        }
        throw redirect(303, tributeUrl);
    }
} as Actions;
