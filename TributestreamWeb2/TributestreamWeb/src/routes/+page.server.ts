// src/routes/api/page.server.ts
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
    default: async ({ request, fetch, locals, cookies }) => {
        const generatePassword = (): string => {
            console.log('Generating a secure password.');
            const length = 16;
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
            const array = new Uint8Array(length);
            crypto.getRandomValues(array);
            const password = Array.from(array)
                .map(x => charset[x % charset.length])
                .join('');
            console.log('Password generated:', password);
            return password;
        };

        let password = '';
        password = generatePassword();

        try {
            // Parse and validate form data
            const formData = await request.formData();
            const data = {
                userName: formData.get('userName'),
                userEmail: formData.get('userEmail'),
                phoneNumber: formData.get('userPhone'),
                lovedOneName: formData.get('lovedOneName')
            } as Record<string, any>;

            console.log('Parsed form data:', data);

            // Register user
            const registerResponse = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.userName,
                    email: data.userEmail,
                    password: password
                })
            });

            if (!registerResponse.ok) {
                return fail(registerResponse.status, { error: true, message: 'Registration failed' });
            }

            const registerResult = await registerResponse.json();
            const userId = registerResult.user_id;

            console.log('User registered with ID:', userId);

            // Authenticate user
            const authResponse = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.userName,
                    password: password,
                })
            });

            if (!authResponse.ok) {
                return fail(authResponse.status, { error: true, message: 'Authentication failed' });
            }

            const authResult = await authResponse.json();
            cookies.set('jwt', authResult.token, { httpOnly: true, secure: true, path: '/' });

            console.log('User authenticated and JWT set.');

            // Write user metadata
            console.log('Sending metadata:', {
                user_id: userId,
                meta_key: 'phone_number',
                meta_value: data.phoneNumber
            });

            const metaResponse = await fetch('/api/user-meta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    meta_key: 'phone_number',
                    meta_value: data.phoneNumber
                })
            });

            if (!metaResponse.ok) {
                const errorData = await metaResponse.json();
                console.error('Error from meta endpoint:', errorData);
                return fail(metaResponse.status, { error: true, message: errorData.message });
            }

            console.log('Metadata written successfully.');
         } catch (error) {
            console.error('Unexpected error:', error);
            throw error(500, 'An unexpected error occurred.');
        }

        redirect(302, '/success');
     }
} satisfies Actions;
