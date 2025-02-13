import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { UserMeta } from '$lib/types/api';

interface UserMetaResponse {
    success: boolean;
    meta: UserMeta[];
}

export const load: PageServerLoad = async ({ locals, fetch }) => {
    // Authentication check outside of try/catch to ensure redirect is thrown
    if (!locals.token || !locals.userId) {
        console.error('Missing authentication data:', {
            hasToken: !!locals.token,
            hasUserId: !!locals.userId
        });
        throw redirect(302, '/fd-form');
    }

    // Fetch metadata
    const metaResponse = await fetch(`/api/user-meta/${locals.userId}`, {
        headers: {
            Authorization: `Bearer ${locals.token}`
        }
    });

    if (!metaResponse.ok) {
        console.error('Failed to fetch user metadata:', await metaResponse.text());
        throw redirect(302, '/fd-form');
    }

    const userMeta = await metaResponse.json() as UserMetaResponse;

    // Validate response structure
    if (!userMeta.success || !userMeta.meta || !Array.isArray(userMeta.meta)) {
        console.error('Invalid user meta response structure:', userMeta);
        throw redirect(302, '/fd-form');
    }

    const formData = userMeta.meta.find((meta: UserMeta) => meta.meta_key === 'memorial_form_data');
    
    if (!formData) {
        console.error('Form data not found for user:', locals.userId);
        throw redirect(302, '/fd-form');
    }

    try {
        // Validate that the meta_value can be parsed as JSON
        const parsedFormData = JSON.parse(formData.meta_value);
        return { formData: parsedFormData };
    } catch (error) {
        console.error('Failed to parse form data:', error);
        throw redirect(302, '/fd-form');
    }
};
