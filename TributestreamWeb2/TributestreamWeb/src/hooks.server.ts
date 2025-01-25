import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    console.log('🔄 [Hook] Intercepting Request:', event.url.pathname);

    // Continue resolving the request
    const response = await resolve(event);
    console.log('✅ [Hook] Response Status:', response.status);

    return response;
};
