import { error, json } from '@sveltejs/kit';

export const POST = async ({ request, cookies }) => {
  console.log('🚀 Starting POST request for tribute entry.');

  // Retrieve the JWT token from cookies
  const token = cookies.get('jwt');
  if (!token) {
      console.error('❌ Missing JWT token in cookies.');
      throw error(401, 'Authentication required');
  }
  console.log('🔑 Token retrieved from cookies:', token);

  try {
      // Parse the request body
      const body = await request.json();
      const { user_id, loved_one_name, slug } = body;

      console.log('📦 Incoming tribute payload:', body);

      // Validate required fields
      if (!user_id || !loved_one_name || !slug) {
          console.error('❌ Missing required fields in tribute payload.', { user_id, loved_one_name, slug });
          throw error(400, 'user_id, loved_one_name, and slug are required.');
      }

      // Prepare the request for the WordPress plugin
      const wpPayload = JSON.stringify({
          user_id,
          loved_one_name,
          slug
      });

      console.log('📄 Prepared WordPress payload:', wpPayload);

      const wpResponse = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tribute', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: wpPayload
      });

      console.log('📡 WordPress API response status:', wpResponse.status);

      if (!wpResponse.ok) {
          const errorData = await wpResponse.json();
          console.error('❌ WordPress API error:', errorData);
          throw error(wpResponse.status, errorData.message || 'Failed to save tribute entry.');
      }

      const responseData = await wpResponse.json();
      console.log('✅ Tribute entry created successfully:', responseData);

      return json(responseData);
  } catch (err) {
      console.error('💥 Error occurred in POST handler:', {
          message: err.message,
          stack: err.stack,
          status: err.status || 500
      });
      throw error(500, err.message || 'Internal Server Error');
  }
};
