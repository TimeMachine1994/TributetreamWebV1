import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
  // Check if user is authenticated
  if (!locals.authenticated || !locals.token || !locals.user) {
    throw redirect(302, '/my-portal');
  }

  try {
    // 1. Fetch the user's tributes
    const userId = locals.user.id;
    
    const tributeResponse = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tributes?user_id=${userId}`, {
      headers: {
        'Authorization': `Bearer ${locals.token}`
      }
    });
    
    if (!tributeResponse.ok) {
      throw new Error(`Failed to fetch tributes: ${tributeResponse.statusText}`);
    }
    
    const tributes = await tributeResponse.json();

    // 2. Fetch additional detailed tribute data
    const detailedTributes = [];
    
    if (tributes && tributes.length > 0) {
      for (const tribute of tributes) {
        try {
          const detailedTributeResponse = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tributes/${tribute.ID}`, {
            headers: {
              'Authorization': `Bearer ${locals.token}`
            }
          });
          
          if (detailedTributeResponse.ok) {
            const detailedTribute = await detailedTributeResponse.json();
            detailedTributes.push(detailedTribute);
          } else {
            // If we can't get detailed data, use the basic tribute
            detailedTributes.push(tribute);
          }
        } catch (tributeError) {
          console.warn(`Warning: Could not fetch detailed data for tribute ${tribute.ID}:`, tributeError);
          detailedTributes.push(tribute);
        }
      }
    }
    
    // 3. Fetch user metadata to check if they have memorial form data
    const metaResponse = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/user-meta?user_id=${userId}&meta_key=memorial_form_data`, {
      headers: {
        'Authorization': `Bearer ${locals.token}`
      }
    });
    
    let hasMemorialData = false;
    let memorialData = null;
    
    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      if (metaData && metaData.length && metaData[0]?.meta_value) {
        hasMemorialData = true;
        memorialData = JSON.parse(metaData[0].meta_value);
      }
    }
    
    // 4. Return data to the client
    return {
      user: locals.user,
      tributes: tributes || [],
      detailedTributes: detailedTributes,
      hasMemorialData,
      memorialData
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return {
      user: locals.user,
      tributes: [],
      detailedTributes: [],
      hasMemorialData: false,
      error: 'Error loading dashboard data. Please try again later.'
    };
  }
};