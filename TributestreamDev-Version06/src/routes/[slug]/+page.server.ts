import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { client } from '$lib/api/client';

export const load = (async ({ params }) => {
  const { slug } = params;
  
  console.log('🔍 Fetching tribute with slug:', slug);
  
  try {
    // Query Strapi for a tribute with the matching slug
    const response = await client.get(`/api/tributes`, {
      params: {
        filters: {
          slug: {
            $eq: slug
          }
        },
        populate: '*' // Populate all related fields like funeral home, memorial events, etc.
      }
    });
    
    const data = response.data;
    
    if (!data || !data.data || data.data.length === 0) {
      console.error('❌ Tribute not found for slug:', slug);
      throw error(404, 'Tribute not found');
    }
    
    // Extract the tribute data from the response
    const tribute = data.data[0];
    
    console.log('✅ Tribute found:', tribute.attributes.deceasedName);
    
    return {
      tribute: tribute.attributes,
      id: tribute.id
    };
  } catch (err) {
    console.error('❌ Error fetching tribute:', err);
    
    if (err.status === 404) {
      throw error(404, 'Tribute not found');
    }
    
    throw error(500, 'Error fetching tribute data');
  }
}) satisfies PageServerLoad;