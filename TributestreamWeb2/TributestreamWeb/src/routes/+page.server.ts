import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
    default: async ({ request, fetch, locals, cookies }) => {
        console.log('🚀 Starting default action.');

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
               userName: formData.get('userName'),
                userEmail: formData.get('userEmail'),
                phoneNumber: formData.get('userPhone'),
                lovedOneName: formData.get('lovedOneName')
            } as Record<string, any>;
            console.log('✅ Form data parsed:', data);


            console.log('🔄 Registering user...');
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
                    username: data.userName,
                    password: password
                })
            });

            if (!authResponse.ok) {
                console.error('❌ Authentication failed:', authResponse.status);
                return fail(authResponse.status, { error: true, message: 'Authentication failed' });
            }

            const authResult = await authResponse.json();
            console.log('✅ User authenticated. JWT token received.');

            console.log('🔑 Setting JWT cookie...');
            cookies.set('jwt', authResult.token, { httpOnly: true, secure: true, path: '/' });

            console.log('🔄 Setting user_id cookie...');
            cookies.set('user_id', userId, {
                httpOnly: true,
                secure: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // Expires in 7 days
            });

            console.log('📝 Writing user metadata...');
// Assuming 'authResult.token' is set earlier in the server.ts logic
console.log('🔑 JWT Token from authResult:', authResult.token);

if (!authResult.token) {
    throw new Error('Authentication token is missing');
}

const metaResponse = await fetch('/api/user-meta', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authResult.token}` // Use the token directly from authResult
    },
    body: JSON.stringify({
        user_id: userId,
        meta_key: 'phone_number',
        meta_value: data.phoneNumber
    })
});

if (!metaResponse.ok) {
    const errorData = await metaResponse.json();
    console.error('❌ Error from user-meta endpoint:', errorData);
    throw new Error(errorData.message || 'Failed to write user metadata');
}

console.log('✅ Metadata successfully written.');


            if (!metaResponse.ok) {
                const errorData = await metaResponse.json();
                console.error('❌ Error from meta endpoint:', errorData);
                return fail(metaResponse.status, { error: true, message: errorData.message });
            }

            console.log('✅ Metadata written successfully.');
        } catch (error) {
            console.error('💥 Unexpected error:', error);
            throw fail(500, { error: true, message: 'An unexpected error occurred.' });
        }

        console.log('🔀 Redirecting to success page...');
        throw redirect(302, '/success');
    }
} satisfies Actions;
