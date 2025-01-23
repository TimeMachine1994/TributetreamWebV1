// src/api/auth/+server.js

export async function POST({ request }) {
  console.log('🚀 [Auth API] POST request received.');

  // Step 1: Parse incoming JSON request
  let username, password;
  try {
      const requestBody = await request.json();
      username = requestBody.username;
      password = requestBody.password;

      console.log('📝 [Auth API] Parsed request JSON:');
      console.log('   Username:', username);
      console.log('   Password:', password); // Be cautious: logging passwords is for debugging only and not safe for production.
  } catch (error) {
      console.error('❌ [Auth API] Error parsing request JSON:', error);
      return new Response(JSON.stringify({ message: 'Invalid request payload' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
      });
  }

  // Step 2: Validate credentials presence
  if (!username || !password) {
      console.warn('⚠️ [Auth API] Missing username or password.');
      return new Response(JSON.stringify({ message: 'Username and password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
      });
  }

  // Step 3: Make request to WordPress JWT endpoint
  console.log('🔄 [Auth API] Sending request to WordPress JWT endpoint...');
  try {
      const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
      });

      console.log('🛬 [Auth API] Received response from WordPress:');
      console.log('   Status Code:', response.status);

      // Step 4: Parse WordPress response
      const data = await response.json();
      console.log('📝 [Auth API] Parsed response JSON from WordPress:');
      console.log('   Response Data:', JSON.stringify(data, null, 2));
      console.log('   User Roles:', data.roles || 'No roles found');
      console.log('   User Capabilities:', data.capabilities || 'No capabilities found');

      // Step 5: Handle non-OK responses
      if (!response.ok) {
          console.error('❌ [Auth API] WordPress returned an error:');
          console.error('   Message:', data.message);
          return new Response(JSON.stringify({ message: data.message }), {
              status: response.status,
              headers: { 'Content-Type': 'application/json' }
          });
      }

      // Step 6: Return successful response to the client
      console.log('✅ [Auth API] Authentication successful. Returning token and user info...');
      return new Response(
          JSON.stringify({
              token: data.token,
              user_display_name: data.user_display_name,
              user_email: data.user_email,
              user_nicename: data.user_nicename,
              roles: data.roles || [],
              capabilities: data.capabilities || {}
          }),
          {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
          }
      );
  } catch (error) {
      console.error('🚨 [Auth API] Error occurred while authenticating with WordPress:', error);
      return new Response(JSON.stringify({ message: 'Internal server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
      });
  }
}
