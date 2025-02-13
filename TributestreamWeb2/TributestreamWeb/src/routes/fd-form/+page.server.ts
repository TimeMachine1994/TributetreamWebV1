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
            console.log('✅ Form data parsed:', data);

            if (!data.email || !data.directorFirstName || !data.directorLastName || !data.locationName) {
                console.error('❌ Missing required fields:', data);
                return fail(400, { error: true, message: 'Required fields are missing.' });
            }

            console.log('🔄 Registering user...');
            const registerResponse = await fetch('/api/tributestream/v1/register', {
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
            const authResponse = await fetch('/api/tributestream/v1/auth', {
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

            cookies.set('jwt_token', authResult.token, { 
                httpOnly: true, 
                secure: true, 
                path: '/',
                sameSite: 'strict'
            });
            cookies.set('user_id', userId, {
                httpOnly: true,
                secure: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });

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

            const metaResponse = await fetch('/api/tributestream/v1/user-meta', {
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
                return fail(metaResponse.status, { 
                    error: true, 
                    message: metaError.message || 'Failed to save user metadata' 
                });
            }

            console.log('✅ Metadata written successfully.');

            // Add the tribute-table API call here
            try {
                console.log('🚀 Starting tribute creation...');
                
                // Generate the slug
                const slug = generateSlug(data.deceasedFirstName, data.deceasedLastName);

                // Prepare the payload
                const tributePayload = {
                    loved_one_name: `${data.deceasedFirstName} ${data.deceasedLastName}`,
                    slug,
                    user_id: userId
                };
                
                console.log('📦 Sending tribute payload:', tributePayload);
                
                const tributeResponse = await fetch('/api/tributestream/v1/tributes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authResult.token}`
                    },
                    body: JSON.stringify(tributePayload)
                });

                if (!tributeResponse.ok) {
                    const tributeError = await tributeResponse.json();
                    console.error('❌ Tribute creation failed:', tributeError);
                    return fail(tributeResponse.status, { 
                        error: true, 
                        message: tributeError.message || 'Failed to create tribute' 
                    });
                }
                
                console.log('✅ Tribute data saved successfully.');

            } catch (error) {
                console.error('💥 Error during tribute creation:', error);
                throw fail(500, { error: true, message: 'An unexpected error occurred while saving tribute data.' });
            }

            console.log('🔀 Redirecting to success page...');
            throw redirect(303, '/fd-form/confirmation');
        } catch (error) {
            console.error('💥 Unexpected error:', error);
            throw fail(500, { error: true, message: 'An unexpected error occurred.' });
        }
    }
} satisfies Actions;
