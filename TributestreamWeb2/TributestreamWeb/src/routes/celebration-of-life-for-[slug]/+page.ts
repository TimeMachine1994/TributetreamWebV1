import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch, depends }) => {
  // Add a dependency to allow for refreshing when needed
  depends(`tributes:${params.slug}`);
  
  console.log('[CLIENT] Loading tribute data for:', params.slug);
  
  try {
    const response = await fetch(`/api/tributes/by-slug/${params.slug}`);
    
    if (!response.ok) {
      console.error('[CLIENT] Failed to load tribute data:', response.status);
      throw new Error('Failed to load tribute data');
    }
    
    const data = await response.json();
    console.log('[CLIENT] Successfully loaded tribute data:', data);
    
    // Map the API response to the expected page data structure
    return {
      tribute: {
        name: data.loved_one_name || data.title || 'Unknown',
        custom_html: data.custom_html || null
      }
    };
  } catch (error) {
    console.error('[CLIENT] Error loading tribute data:', error);
    // Return fallback data to prevent rendering issues
    return {
      tribute: {
        name: params.slug,
        custom_html: null
      }
    };
  }
};