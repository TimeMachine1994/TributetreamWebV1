import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
    homeRegister: async ({ request, fetch, locals, cookies }) => {
        let password = '';
        let slug = '';

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

        try {
            console.log('🔄 Starting homeRegister action...');
            console.log('🔄 Generating password...');
            password = generatePassword();

            console.log('📝 Parsing form data...');
            const formData = await request.formData();
            const data = {
                lovedOneName: formData.get('lovedOneName'),
                slugifiedName: formData.get('slugifiedName'),
                name: formData.get('userInfo.name'),
                email: formData.get('userInfo.email'),
                phone: formData.get('userInfo.phone'),
            };
            console.log('✅ Form data parsed:', data);

            if (!data.email || !data.lovedOneName || !data.name || !data.phone) {
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
                console.error('❌ Registration failed with status:', registerResponse.status);
                return fail(registerResponse.status, { error: true, message: 'Registration failed' });
            }

            const registerResult = await registerResponse.json();
            const userId = registerResult.user_id;
            console.log('✅ User registered successfully. User ID:', userId);

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
                console.error('❌ Authentication failed with status:', authResponse.status);
                return fail(authResponse.status, { error: true, message: 'Authentication failed' });
            }

            const authResult = await authResponse.json();
            console.log('✅ User authenticated successfully. JWT Token:', authResult.token);

            console.log('🔒 Setting cookies for authentication...');
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
                meta_key: 'home_form_data',
                meta_value: JSON.stringify({
                    userInfo: {
                        name: data.name,
                        email: data.email,
                        phone: data.phone
                    },
                    lovedOneName: data.lovedOneName,
                    slugifiedName: data.slugifiedName,
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
                console.error('❌ Metadata write failed with error:', metaError);
                return fail(metaResponse.status, { error: true, message: metaError.message });
            }

            console.log('✅ Metadata written successfully.');

            console.log('🚀 Starting tribute-table API call...');
            try {
                const tributePayload = {
                    loved_one_name: data.lovedOneName,
                    slug: data.slugifiedName,
                    user_id: userId
                };
                console.log('📦 Tribute payload:', tributePayload);

                slug = data.slugifiedName;
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
                    return fail(tributeResponse.status, { error: true, message: 'Failed to save tribute data.' });
                }

                console.log('✅ Tribute data saved successfully.');
            } catch (error) {
                console.error('💥 Error during tribute-table API call:', error);
                throw fail(500, { error: true, message: 'An unexpected error occurred while saving tribute data.' });
            }

            console.log('🔀 Redirecting to success page...');
        } catch (error) {
            console.error('💥 Unexpected error occurred:', error);
            throw fail(500, { error: true, message: 'An unexpected error occurred.' });
        }
        throw redirect(303, `/celebration-of-life-for-${slug}`);

    }
} satisfies Actions;
