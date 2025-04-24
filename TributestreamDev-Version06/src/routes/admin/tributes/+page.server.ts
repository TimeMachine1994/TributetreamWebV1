import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch }) => {
  console.log('🔍 Loading tributes list...');
  
  const response = await fetch('/api/tributes');
  
  if (!response.ok) {
    console.error('❌ Failed to load tributes:', response.statusText);
    error(response.status, 'Failed to load tributes');
  }

  const data = await response.json();
  console.log('✅ Loaded tributes:', data);

  return {
    tributes: data.data || []
  };
}) satisfies PageServerLoad;