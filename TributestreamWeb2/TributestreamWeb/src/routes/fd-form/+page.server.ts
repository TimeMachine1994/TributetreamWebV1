import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
	import { enhance } from '$app/forms';

function generateSlug(firstName: string, lastName: string): string {
    console.log(`🔤 Generating slug for: ${firstName} ${lastName}`);
    const slug = `${firstName.trim().toLowerCase()}-${lastName.trim().toLowerCase()}`.replace(/\s+/g, '-');
    console.log(`✅ Generated slug: ${slug}`);
    return slug;
}

export const actions = {
    default: async ({ request, fetch, locals, cookies }) => {
        console.log('🚀 [START] fd-form action');
        console.time('⏳ Total processing time');

        const generatePassword = (): string => {
            console.log('🔐 [START] Generating secure password');
            const length = 16;
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
            const array = new Uint8Array(length);
            crypto.getRandomValues(array);
            const password = Array.from(array)
                .map((x) => charset[x % charset.length])
                .join('');
            console.log('✅ [END] Password generated:', password);
            return password;
        };

        let password = '';
        try {
            console.time('⏳ Password Generation');
            password = generatePassword();
            console.timeEnd('⏳ Password Generation');

            console.log('📝 Parsing form data...');
            console.time('⏳ Form Data Parsing');
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
            console.timeEnd('⏳ Form Data Parsing');
            console.log('✅ Form data parsed successfully:', data);

            if (!data.email || !data.directorFirstName || !data.directorLastName || !data.locationName) {
                console.error('❌ Missing required fields:', data);
                return fail(400, { error: true, message: 'Required fields are missing.' });
            }

            console.log('🔄 Registering user...');
            console.time('⏳ User Registration');
            const registerResponse = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.email,
                    email: data.email,
                    password: password
                })
            });
            console.timeEnd('⏳ User Registration');

            if (!registerResponse.ok) {
                console.error('❌ Registration failed:', registerResponse.status, await registerResponse.text());
                return fail(registerResponse.status, { error: true, message: 'Registration failed' });
            }

            const registerResult = await registerResponse.json();
            const userId = registerResult.user_id;
            console.log('✅ User registered with ID:', userId);

            console.log('🔄 Authenticating user...');
            console.time('⏳ User Authentication');
            const authResponse = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.email,
                    password: password
                })
            });
            console.timeEnd('⏳ User Authentication');

            if (!authResponse.ok) {
                console.error('❌ Authentication failed:', authResponse.status, await authResponse.text());
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
            console.time('⏳ Metadata Writing');
            const metaPayload = {
                user_id: userId,
                masterData: {
                    directorInfo: {
                        firstName: data.directorFirstName,
                        lastName: data.directorLastName,
                        funeralHomeName: data.locationName,
                        funeralHomeAddress: data.locationAddress
                    },
                    lovedOneInfo: {
                        fullName: `${data.deceasedFirstName} ${data.deceasedLastName}`,
                        dateOfBirth: data.deceasedDOB,
                        dateOfPassing: data.deceasedDOP
                    },
                    userInfo: {
                        fullName: `${data.familyMemberFirstName} ${data.familyMemberLastName}`,
                        emailAddress: data.email,
                        phoneNumber: data.phone,
                        dateOfBirth: data.familyMemberDOB
                    },
                    memorialInfo: {
                        locations: [{
                            name: data.locationName,
                            address: data.locationAddress
                        }],
                        startTime: data.memorialTime,
                        date: data.memorialDate
                    },
                    liveStreamInfo: {},
                    packageInfo: {},
                    billingInfo: {}
                }
            };

            const metaResponse = await fetch('/api/user-meta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authResult.token}`
                },
                body: JSON.stringify(metaPayload)
            });
            console.timeEnd('⏳ Metadata Writing');

            if (!metaResponse.ok) {
                const metaError = await metaResponse.json();
                console.error('❌ Metadata write failed:', metaError);
                return fail(metaResponse.status, { error: true, message: metaError.message || 'Failed to save user metadata' });
            }

            console.log('✅ Metadata written successfully.');

            console.log('🚀 Creating tribute...');
            console.time('⏳ Tribute Creation');
            const slug = generateSlug(data.deceasedFirstName, data.deceasedLastName);
            const tributePayload = {
                loved_one_name: `${data.deceasedFirstName} ${data.deceasedLastName}`,
                slug,
                user_id: parseInt(userId, 10), // Ensure it's an integer
                phone_number: data.phone.replace(/[^0-9]/g, ''), // Strip non-numeric characters
                custom_html: '', // Include optional fields with appropriate defaults
                number_of_streams: 1,
            };

            const tributeResponse = await fetch('/api/tributes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authResult.token}`
                },
                body: JSON.stringify(tributePayload)
            });
            console.timeEnd('⏳ Tribute Creation');

            if (!tributeResponse.ok) {
                const tributeError = await tributeResponse.json();
                console.error('❌ Tribute creation failed:', tributeError);
                return fail(tributeResponse.status, { error: true, message: tributeError.message || 'Failed to create tribute' });
            }

            console.log('✅ Tribute created successfully.');

            console.log('🔀 Redirecting to success page...');
            console.timeEnd('⏳ Total processing time');
            throw redirect(303, '/fd-form/confirmation');
        } catch (error) {
            console.error('💥 Unexpected error:', error);
            console.timeEnd('⏳ Total processing time');
            throw fail(500, { error: true, message: 'An unexpected error occurred.' });
        }
    }
} satisfies Actions;
