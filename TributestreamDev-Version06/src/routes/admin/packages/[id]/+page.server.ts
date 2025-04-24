import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ params, fetch }) => {
    console.log('📦 Fetching package details...', params.id);
    
    const response = await fetch(`/api/packages/${params.id}`);
    
    if (!response.ok) {
        console.error('❌ Failed to fetch package:', response.statusText);
        error(response.status, 'Failed to fetch package');
    }

    const data = await response.json();
    console.log('✅ Successfully fetched package:', data);

    return {
        package: data.data
    };
}) satisfies PageServerLoad;

export const actions = {
    update: async ({ request, params, fetch }) => {
        console.log('📝 Updating package...', params.id);
        
        const formData = await request.formData();
        const title = formData.get('title')?.toString();
        const description = formData.get('description')?.toString();
        const basePrice = formData.get('basePrice')?.toString();
        const slug = formData.get('slug')?.toString();

        if (!title || !basePrice) {
            console.error('❌ Missing required fields');
            return fail(400, { 
                error: 'Title and base price are required',
                data: { title, description, basePrice, slug }
            });
        }

        try {
            const response = await fetch(`/api/packages/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: {
                        title,
                        description,
                        basePrice: parseFloat(basePrice),
                        slug: slug || title.toLowerCase().replace(/\s+/g, '-')
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Failed to update package:', error);
                return fail(response.status, { 
                    error: 'Failed to update package',
                    data: { title, description, basePrice, slug }
                });
            }

            console.log('✅ Package updated successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating package:', error);
            return fail(500, { 
                error: 'Internal server error',
                data: { title, description, basePrice, slug }
            });
        }
    },

    delete: async ({ params, fetch }) => {
        console.log('🗑️ Deleting package...', params.id);
        
        try {
            const response = await fetch(`/api/packages/${params.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                console.error('❌ Failed to delete package:', response.statusText);
                return fail(response.status, { error: 'Failed to delete package' });
            }

            console.log('✅ Package deleted successfully');
            redirect(303, '/admin/packages');
        } catch (error) {
            console.error('❌ Error deleting package:', error);
            return fail(500, { error: 'Internal server error' });
        }
    }
} satisfies Actions;