// src/routes/api/password-reset/request/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    console.log('🚀 [Password Reset API - Request] POST request received.');
  
    // Step 1: Parse incoming JSON request
    let email;
    try {
        const requestBody = await request.json();
        email = requestBody.email;
  
        console.log('📝 [Password Reset API - Request] Parsed request JSON:');
        console.log('   Email:', email);
    } catch (error) {
        console.error('❌ [Password Reset API - Request] Error parsing request JSON:', error);
        return json({ message: 'Invalid request payload' }, { status: 400 });
    }
  
    // Step 2: Validate email presence
    if (!email) {
        console.warn('⚠️ [Password Reset API - Request] Missing email.');
        return json({ message: 'Email is required' }, { status: 400 });
    }
  
    // Step 3: Make request to WordPress REST API endpoint
    console.log('🔄 [Password Reset API - Request] Sending request to WordPress endpoint...');
    try {
        const response = await fetch('https://wp.tributestream.com/wp-json/bdpwr/v1/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
  
        console.log('🛬 [Password Reset API - Request] Received response from WordPress:');
        console.log('   Status Code:', response.status);
  
        // Step 4: Parse WordPress response
        const data = await response.json();
        console.log('📝 [Password Reset API - Request] Parsed response JSON from WordPress:');
        console.log('   Response Data:', JSON.stringify(data, null, 2).substring(0, 500) + '...'); // Truncate large objects
  
        // Step 5: Handle non-OK responses
        if (!response.ok) {
            console.error('❌ [Password Reset API - Request] WordPress returned an error:');
            console.error('   Message:', data.message);
            
            // Handle specific error for user role restrictions
            if (data.message && data.message.includes('user with this role')) {
                return json({
                    message: 'Password reset is not available for your account type. Please contact support for assistance.',
                    code: 'role_restriction'
                }, { status: 403 });
            }
            
            return json({ message: data.message || 'Failed to send reset code' }, { status: response.status });
        }
  
        // Step 6: Return successful response to the client
        console.log('✅ [Password Reset API - Request] Reset code request successful.');
        return json(data, { status: 200 });
    } catch (error) {
        console.error('🚨 [Password Reset API - Request] Error occurred while requesting reset code:', error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
}