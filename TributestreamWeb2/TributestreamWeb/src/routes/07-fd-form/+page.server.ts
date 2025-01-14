import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

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
                directorFirstName: formData.get('director-first-name'),
                directorLastName: formData.get('director-last-name'),
                familyMemberFirstName: formData.get('family-member-first-name'),
                familyMemberLastName: formData.get('family-member-last-name'),
                familyMemberDOB: formData.get('family-member-dob'),
                deceasedFirstName: formData.get('deceased-first-name'),
                deceasedLastName: formData.get('deceased-last-name'),
                deceasedDOB: formData.get('deceased-dob'),
                deceasedDOP: formData.get('deceased-dop'),
                email: formData.get('email-address'),
                phone: formData.get('phone-number'),
                locationName: formData.get('location-name'),
                locationAddress: formData.get('location-address'),
                memorialTime: formData.get('memorial-time'),
                memorialDate: formData.get('memorial-date'),
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

            cookies.set('jwt', authResult.token, { httpOnly: true, secure: true, path: '/' });
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

            console.log('🔀 Redirecting to success page...');

        } catch (error) {
            console.error('💥 Unexpected error:', error);
            throw fail(500, { error: true, message: 'An unexpected error occurred.' });
        }
        throw redirect(302, '/submisison-confirmed');

    }
} satisfies Actions;
