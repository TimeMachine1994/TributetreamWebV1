import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request, fetch }) => {
        console.log('📦 Creating new package...');
        
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
            const response = await fetch('/api/packages', {
                method: 'POST',
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
                console.error('❌ Failed to create package:', error);
                return fail(response.status, { 
                    error: 'Failed to create package',
                    data: { title, description, basePrice, slug }
                });
            }

            console.log('✅ Package created successfully');
            redirect(303, '/admin/packages');
        } catch (error) {
            console.error('❌ Error creating package:', error);
            return fail(500, { 
                error: 'Internal server error',
                data: { title, description, basePrice, slug }
            });
        }
    }
} satisfies Actions;