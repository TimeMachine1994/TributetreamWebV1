import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch }) => {
    console.log('📦 Fetching packages list...');
    
    const response = await fetch('/api/packages');
    
    if (!response.ok) {
        console.error('❌ Failed to fetch packages:', response.statusText);
        error(response.status, 'Failed to fetch packages');
    }

    const data = await response.json();
    console.log('✅ Successfully fetched packages:', data);

    return {
        packages: data.data || []
    };
}) satisfies PageServerLoad;