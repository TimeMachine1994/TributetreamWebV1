import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    console.log('🔍 Fetching add-ons from API');
    const response = await fetch('/api/add-ons');
    
    if (!response.ok) {
      console.error('❌ Failed to fetch add-ons:', response.status);
      throw error(response.status, 'Failed to fetch add-ons');
    }
    
    const data = await response.json();
    console.log('✅ Successfully fetched add-ons:', data);

    return {
      addOns: data.data || []
    };
  } catch (err) {
    console.error('❌ Error loading add-ons:', err);
    throw error(500, 'Error loading add-ons');
  }
};