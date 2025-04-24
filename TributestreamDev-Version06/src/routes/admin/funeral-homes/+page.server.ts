import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch }) => {
  console.log('🏠 Loading funeral homes list...');
  
  const response = await fetch('/api/funeral-homes');
  
  if (!response.ok) {
    console.error('❌ Failed to fetch funeral homes:', response.statusText);
    throw error(response.status, 'Failed to load funeral homes');
  }

  const data = await response.json();
  console.log('✅ Loaded funeral homes:', data);

  return {
    funeralHomes: data.data
  };
}) satisfies PageServerLoad;