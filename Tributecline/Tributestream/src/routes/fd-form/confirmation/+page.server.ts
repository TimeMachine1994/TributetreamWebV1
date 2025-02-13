import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { wpFetch } from '$lib/utils/api';
import type { UserMeta } from '$lib/types/api';

export const load: PageServerLoad = async ({ locals, fetch }) => {
    if (!locals.isAuthenticated || !locals.token || !locals.userId) {
        throw redirect(302, '/fd-form');
    }

    try {
        const metaResponse = await fetch(`/api/user-meta/${locals.userId}`, {
            headers: {
                Authorization: `Bearer ${locals.token}`
            }
        });

        if (!metaResponse.ok) {
            throw new Error('Failed to fetch user metadata');
        }

        const userMeta = await metaResponse.json();
        const formData = userMeta.find((meta: UserMeta) => meta.meta_key === 'memorial_form_data');
        if (!formData) {
            throw new Error('Form data not found');
        }

        return {
            formData: JSON.parse(formData.meta_value)
        };
    } catch (error) {
        console.error('Error loading form data:', error);
        throw redirect(302, '/fd-form');
    }
};
