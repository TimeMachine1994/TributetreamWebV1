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
        try {
            console.log('🔄 Starting createTribute action...');
            
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
            
            // Debug: Log extracted values
            console.log('🔍 Extracted form values:');
            console.log(`   lovedOneFullName: "${lovedOneFullName}"`);
            console.log(`   userFullName: "${userFullName}"`);
            console.log(`   userEmail: "${userEmail}"`);
            console.log(`   userPhone: "${userPhone}"`);
            
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
            const tributeUrl = createTributeUrl(tributeSlug);
            
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
            console.log('🧩 Type assertion fix applied, using "as Actions" instead of "satisfies Actions"');
            
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
            
            // Store data in user metadata
            const unifiedData = {
                lovedOneInfo: { fullName: lovedOneFullName },
                userInfo: {
                    fullName: userFullName,
                    emailAddress: userEmail,
                    phoneNumber: userPhone
                }
            };
            
            // Use the conversion function to ensure all required fields are present
            const completeUserMetaData = convertMasterStoreToUserMeta(unifiedData);
            console.log('🔄 Complete user meta data structure:', JSON.stringify(completeUserMetaData, null, 2));
            
            await storeMasterDataInUserMeta(userId, completeUserMetaData, authResult.token, fetch);
            console.log('✅ User data stored in user meta.');
            
            // Enhanced tribute data for better integration with Unified Store
            const tributeData = {
                title: lovedOneFullName,  // Will be synchronized with lovedOneInfo.fullName in the store
                slug: tributeSlug,
                user_name: userFullName,
                user_email: userEmail,
                user_phone: userPhone,
                description: `Memorial tribute for ${lovedOneFullName}`,
                memorialDate: new Date().toISOString().split('T')[0], // Default to today's date
                memorialLocation: '',  // Will be updated during the user flow
                created_at: new Date().toISOString()
            };
            
            const tributeResponse = await saveTribute(tributeData, authResult.token);
            
            if (!tributeResponse.success) {
                console.error('❌ Tribute creation failed:', tributeResponse);
                return fail(500, {
                    error: true,
                    message: 'Failed to create tribute. Please try again.'
                });
            }
            
            console.log('✅ Tribute created successfully:', tributeResponse);
            
            // Include tribute data in form result to update UnifiedStore
            // This would be caught by use:enhance in the component and used to update the store
            const tribute: Partial<Tribute> = {
                ...tributeData,
                id: tributeResponse.tribute?.id
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
                    // Tribute data
                    tribute: tribute,
                    // Auth token
                    authToken: authResult.token
                }
            };
            
            console.log('🔀 Redirecting to tribute page...');
            // Redirect to the tribute page
            throw redirect(303, tributeUrl);
        } catch (error) {
            console.error('❌ Unexpected error in createTribute action:', error);
            return fail(500, {
                error: true,
                message: 'An unexpected error occurred'
            });
        }
    }
} as Actions;
