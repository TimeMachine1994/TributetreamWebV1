// src/routes/api/password-reset/set/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    console.log('🚀 [Password Reset API - Set Password] POST request received.');
  
    // Step 1: Parse incoming JSON request
    let email, code, password;
    try {
        const requestBody = await request.json();
        email = requestBody.email;
        code = requestBody.code;
        password = requestBody.password;
  
        console.log('📝 [Password Reset API - Set Password] Parsed request JSON:');
        console.log('   Email:', email);
        console.log('   Code:', code ? '******' : undefined); // Mask code in logs
        console.log('   Password:', password ? '********' : undefined); // Mask password in logs
    } catch (error) {
        console.error('❌ [Password Reset API - Set Password] Error parsing request JSON:', error);
        return json({ message: 'Invalid request payload' }, { status: 400 });
    }
  
    // Step 2: Validate required parameters
    if (!email || !code || !password) {
        console.warn('⚠️ [Password Reset API - Set Password] Missing required parameters.');
        return json({ message: 'Email, code, and password are required' }, { status: 400 });
    }
  
    // Step 3: Make request to WordPress REST API endpoint
    console.log('🔄 [Password Reset API - Set Password] Sending request to WordPress endpoint...');
    try {
        const response = await fetch('https://wp.tributestream.com/wp-json/bdpwr/v1/set-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email,
                code,
                password
            })
        });
  
        console.log('🛬 [Password Reset API - Set Password] Received response from WordPress:');
        console.log('   Status Code:', response.status);
  
        // Step 4: Parse WordPress response
        const data = await response.json();
        console.log('📝 [Password Reset API - Set Password] Parsed response JSON from WordPress:');
        console.log('   Response Data:', JSON.stringify(data, null, 2).substring(0, 500) + '...'); // Truncate large objects
  
        // Step 5: Handle non-OK responses
        if (!response.ok) {
            console.error('❌ [Password Reset API - Set Password] WordPress returned an error:');
            console.error('   Message:', data.message);
            return json({ message: data.message || 'Failed to set new password' }, { status: response.status });
        }
  
        // Step 6: Return successful response to the client
        console.log('✅ [Password Reset API - Set Password] Password reset successful.');
        return json(data, { status: 200 });
    } catch (error) {
        console.error('🚨 [Password Reset API - Set Password] Error occurred while setting new password:', error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
}