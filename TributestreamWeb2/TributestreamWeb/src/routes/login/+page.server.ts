import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';
export const actions: Actions = {
    default: async ({ request, cookies, locals }) => {
        console.log('🚀 Starting login process...');
        // Extract form data from request
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        console.log('📝 Form data received - Username provided:', !!username);
        // Ensure form fields are filled out
        if (!username || !password) {
            console.log('❌ Validation failed: Missing credentials');
            return fail(400, { error: 'Username and password are required' });
        }
            console.log('🌐 Making request to WordPress backend...');
            const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/user-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            console.log('📡 WordPress response status:', response.status);
            // Check if the response is OK
            if (!response.ok) {
                console.log('❌ Authentication failed with status:', response.status);
                return fail(401, { error: 'Invalid credentials' });
            }
            // Parse the response
            // After parsing the response
            const result = await response.json();
            console.log('✅ Login successful, token received');
            console.log('🔑 Full token value:', result.token); // Print the actual token
            console.log('🔍 Token structure:', {
                type: typeof result.token,
                length: result.token?.length,
                value: result.token
            });


            // Save JWT to cookies
            cookies.set('jwt', result.token, {
                path: '/',
                httpOnly: false,
                sameSite: 'none',
                secure: true,
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });
            locals.jwt = result.token;
            console.log('🍪 JWT cookie set successfully');
            console.log('🔑 JWT cookie value:', cookies.get('jwt'));



            throw redirect(303, '/dashboard');

    }
};
