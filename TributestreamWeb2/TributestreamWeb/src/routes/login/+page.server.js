import { redirect, fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, cookies, fetch }) => {
    console.log('🚀 [Login Action] Triggered default action.');

    // Step 1: Extract form data
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');
    console.log('📝 [Login Action] Form data extracted:');
    console.log('   Username:', username);
    console.log('   Password:', password);

    // Check for missing credentials
    if (!username || !password) {
      console.warn('⚠️ [Login Action] Missing username or password.');
      return fail(400, { error: 'Both username and password are required.' });
    }

    let loginSuccessful = false;
    
    try {
      console.log('🔄 [Login Action] Sending login request to /api/auth...');

      // Step 2: Send login request to API
      const response = await fetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🛬 [Login Action] Received response from /api/auth.');
      console.log('   Status Code:', response.status);

      // Step 3: Parse the response
      const result = await response.json();
      console.log('📝 [Login Action] Parsed response JSON:');
      console.log('   Result:', result);

      // Step 4: Check if the login was successful
      if (!response.ok) {
        console.error('❌ [Login Action] Login failed.');
        console.error('   Error Message:', result.message || 'No error message provided.');
        return fail(400, { error: result.message || 'Login failed' });
      }

      // Step 5: Set JWT token in cookies
      console.log('🍪 [Login Action] Setting JWT cookie...');
      cookies.set('jwt', result.token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      });
      console.log('🍪 [Login Action] JWT cookie set successfully.');

      // Step 6: Set user data in another cookie for client access
      console.log('🍪 [Login Action] Setting user data cookie...');
      cookies.set(
        'user',
        JSON.stringify({
          displayName: result.user_display_name,
          email: result.user_email,
          nicename: result.user_nicename
        }),
        {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 // 24 hours
        }
      );
      console.log('🍪 [Login Action] User data cookie set successfully.');
      
      loginSuccessful = true;

    } catch (error) {
      console.error('🚨 [Login Action] Error occurred during login:');
      console.error(error);
      return fail(500, { error: 'Internal server error' });
    }

    // Step 7: Redirect the user to the schedule page if login was successful
    if (loginSuccessful) {
      console.log('🔀 [Login Action] Redirecting to /schedule...');
      redirect(303, '/schedule');
    }
  }
};