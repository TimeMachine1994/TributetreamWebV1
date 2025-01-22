import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

// Function to generate a slug from the deceased's first and last name
function generateSlug(firstName: string, lastName: string): string {
    return `${firstName.trim().toLowerCase()}_${lastName.trim().toLowerCase()}`.replace(/\s+/g, '_');
}

export const actions = {
    default: async ({ request, fetch, locals, cookies }) => {
        console.log('🚀 Starting fd-form action.');

        const generatePassword = (): string => {
            console.log('🔐 Generating a secure password.');
            const length = 16;
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
            const array = new Uint8Array(length);
            crypto.getRandomValues(array);
            const password = Array.from(array)
                .map((x) => charset[x % charset.length])
                .join('');
            console.log('✅ Password generated:', password);
            return password;
        };

        let password = '';
        try {
            console.log('🔄 Generating password...');
            password = generatePassword();

            console.log('📝 Parsing form data...');
            const formData = await request.formData();
            function getFormValue(value: FormDataEntryValue | null): string {
                if (value === null) throw new Error('Required form field is missing');
                return value.toString();
            }

            const data = {
                directorFirstName: getFormValue(formData.get('director-first-name')),
                directorLastName: getFormValue(formData.get('director-last-name')),
                familyMemberFirstName: getFormValue(formData.get('family-member-first-name')),
                familyMemberLastName: getFormValue(formData.get('family-member-last-name')),
                familyMemberDOB: getFormValue(formData.get('family-member-dob')),
                deceasedFirstName: getFormValue(formData.get('deceased-first-name')),
                deceasedLastName: getFormValue(formData.get('deceased-last-name')),
                deceasedDOB: getFormValue(formData.get('deceased-dob')),
                deceasedDOP: getFormValue(formData.get('deceased-dop')),
                email: getFormValue(formData.get('email-address')),
                phone: getFormValue(formData.get('phone-number')),
                locationName: getFormValue(formData.get('location-name')),
                locationAddress: getFormValue(formData.get('location-address')),
                memorialTime: getFormValue(formData.get('memorial-time')),
                memorialDate: getFormValue(formData.get('memorial-date')),
            };
            console.log('✅ Form data parsed:', data);

            if (!data.email || !data.directorFirstName || !data.directorLastName || !data.locationName) {
                console.error('❌ Missing required fields:', data);
                return fail(400, { error: true, message: 'Required fields are missing.' });
            }

            console.log('🔄 Registering user...');
            const registerResponse = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.email,
                    email: data.email,
                    password: password
                })
            });

            if (!registerResponse.ok) {
                console.error('❌ Registration failed:', registerResponse.status);
                return fail(registerResponse.status, { error: true, message: 'Registration failed' });
            }

            const registerResult = await registerResponse.json();
            const userId = registerResult.user_id;
            console.log('✅ User registered with ID:', userId);

            console.log('🔄 Authenticating user...');
            const authResponse = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.email,
                    password: password
                })
            });

            if (!authResponse.ok) {
                console.error('❌ Authentication failed:', authResponse.status);
                return fail(authResponse.status, { error: true, message: 'Authentication failed' });
            }

            const authResult = await authResponse.json();
            console.log('✅ User authenticated. JWT token received:', authResult.token);

            // Set cookies with proper configuration for authentication
            cookies.set('jwt', authResult.token, { 
                httpOnly: true, 
                secure: true, 
                path: '/',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });
            cookies.set('user_id', userId, {
                httpOnly: true,
                secure: true,
                path: '/',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });

            // Store the token in locals for immediate use
            locals.token = authResult.token;
            locals.userId = userId;
            locals.authenticated = true;

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

            const metaResponse = await fetch('/api/user-meta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authResult.token}`
                },
                body: JSON.stringify(metaPayload)
            });

            if (!metaResponse.ok) {
                const metaError = await metaResponse.json();
                console.error('❌ Metadata write failed:', metaError);
                return fail(metaResponse.status, { error: true, message: metaError.message });
            }

            console.log('✅ Metadata written successfully.');

            // Add the tribute-table API call here
            try {
                console.log('🚀 Starting tribute-table API call...');
                
                // Generate the slug
                const slug = generateSlug(data.deceasedFirstName, data.deceasedLastName);

                // Prepare the payload
                const tributePayload = {
                    loved_one_name: `${data.deceasedFirstName} ${data.deceasedLastName}`, // Match expected field name
                    slug, // Ensure it's slugified
                    user_id: userId // Ensure it's the correct user ID
                };
                
                console.log('📦 Sending tribute payload:', tributePayload);
                
                const tributeResponse = await fetch('/api/tribute-table', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authResult.token}`
                    },
                    body: JSON.stringify(tributePayload)
                });
                
                if (!tributeResponse.ok) {
                    const tributeError = await tributeResponse.json();
                    console.error('❌ Tribute API call failed:', tributeError);
                    throw fail(tributeResponse.status, { error: true, message: 'Failed to save tribute data.' });
                }
                
                console.log('✅ Tribute data saved successfully.');
                

                if (!tributeResponse.ok) {
                    const tributeError = await tributeResponse.json();
                    console.error('❌ Tribute API call failed:', tributeError);
                    return fail(tributeResponse.status, { error: true, message: 'Failed to save tribute data.' });
                }

                console.log('✅ Tribute data saved successfully.');

            } catch (error) {
                console.error('💥 Error during tribute-table API call:', error);
                throw fail(500, { error: true, message: 'An unexpected error occurred while saving tribute data.' });
            }

            console.log('🔀 Redirecting to confirmation page with auth cookies set...');
         } catch (error) {
            console.error('💥 Unexpected error:', error);
            throw fail(500, { error: true, message: 'An unexpected error occurred.' });
        }
        throw redirect(303, '/fd-form/confirmation');
    }
} satisfies Actions;
