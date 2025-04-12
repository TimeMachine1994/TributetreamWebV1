// src/routes/api/password-reset/validate/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    console.log('🚀 [Password Reset API - Validate] POST request received.');
  
    // Step 1: Parse incoming JSON request
    let email, code;
    try {
        const requestBody = await request.json();
        email = requestBody.email;
        code = requestBody.code;
  
        console.log('📝 [Password Reset API - Validate] Parsed request JSON:');
        console.log('   Email:', email);
        console.log('   Code:', code ? '******' : undefined); // Mask code in logs
    } catch (error) {
        console.error('❌ [Password Reset API - Validate] Error parsing request JSON:', error);
        return json({ message: 'Invalid request payload' }, { status: 400 });
    }
  
    // Step 2: Validate required parameters
    if (!email || !code) {
        console.warn('⚠️ [Password Reset API - Validate] Missing required parameters.');
        return json({ message: 'Email and code are required' }, { status: 400 });
    }
  
    // Step 3: Make request to WordPress REST API endpoint
    console.log('🔄 [Password Reset API - Validate] Sending request to WordPress endpoint...');
    try {
        const response = await fetch('https://wp.tributestream.com/wp-json/bdpwr/v1/validate-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email,
                code
            })
        });
  
        console.log('🛬 [Password Reset API - Validate] Received response from WordPress:');
        console.log('   Status Code:', response.status);
  
        // Step 4: Parse WordPress response
        const data = await response.json();
        console.log('📝 [Password Reset API - Validate] Parsed response JSON from WordPress:');
        console.log('   Response Data:', JSON.stringify(data, null, 2).substring(0, 500) + '...'); // Truncate large objects
  
        // Step 5: Handle non-OK responses
        if (!response.ok) {
            console.error('❌ [Password Reset API - Validate] WordPress returned an error:');
            console.error('   Message:', data.message);
            return json({ message: data.message || 'Invalid reset code' }, { status: response.status });
        }
  
        // Step 6: Return successful response to the client
        console.log('✅ [Password Reset API - Validate] Code validation successful.');
        return json(data, { status: 200 });
    } catch (error) {
        console.error('🚨 [Password Reset API - Validate] Error occurred while validating code:', error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
}