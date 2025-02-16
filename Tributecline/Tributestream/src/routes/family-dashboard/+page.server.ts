import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { UserMetaResponse, UserMetaItem, MemorialFormData, MemorialFormResponse } from '$lib/types/api';

export const load: PageServerLoad<MemorialFormResponse> = async ({ locals, fetch }) => {
    console.log('Loading user metadata for memorial form data');
    
    if (!locals.isAuthenticated) {
        console.warn('User not authenticated, redirecting to /login');
        throw redirect(302, '/login');
    }

    try {
        console.log(`Fetching user metadata for userId: ${locals.userId}`);
        const response = await fetch(`/api/user-meta/${locals.userId}`, {
            headers: {
                'Authorization': `Bearer ${locals.token}`
            }
        });

        // Log response details
        console.log('Received response from /api/user-meta:', {
            status: response.status,
            statusText: response.statusText
        });

        // Handle non-OK responses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.message || `Failed to fetch user metadata: ${response.statusText}`;
            console.error('API Error:', { status: response.status, error: errorData });
            return { error: errorMsg };
        }

        // Parse and validate response
        const data = await response.json() as UserMetaResponse;
        console.log('User metadata fetched successfully:', data);

        if (!data.success || !Array.isArray(data.meta)) {
            console.error('Invalid API response format:', data);
            return { error: 'Invalid response format from API' };
        }

        // Find memorial data in user meta
        const memorialData = data.meta.find((meta: UserMetaItem) => meta.meta_key === 'memorial_form_data');
        if (!memorialData?.meta_value) {
            console.log('No memorial form data found in user metadata');
            return { error: 'No memorial form data found' };
        }

        try {
            // Parse and validate memorial data
            const parsedData = JSON.parse(memorialData.meta_value) as MemorialFormData;
            
            // Validate required fields
            const validationErrors: string[] = [];

            // Deceased information validation
            if (!parsedData.deceased?.firstName || !parsedData.deceased?.lastName) {
                validationErrors.push('Missing required deceased information');
            }
            if (!parsedData.deceased?.dob || !parsedData.deceased?.dop) {
                validationErrors.push('Missing required deceased dates');
            }

            // Memorial information validation
            if (!parsedData.memorial?.locationName || !parsedData.memorial?.locationAddress) {
                validationErrors.push('Missing required memorial location information');
            }
            if (!parsedData.memorial?.date || !parsedData.memorial?.time) {
                validationErrors.push('Missing required memorial date/time');
            }

            // Contact information validation
            if (!parsedData.contact?.email || !parsedData.contact?.phone) {
                validationErrors.push('Missing required contact information');
            }

            // If any validation errors exist, return them
            if (validationErrors.length > 0) {
                console.error('Memorial data validation failed:', validationErrors);
                return { error: validationErrors.join(', ') };
            }

            console.log('Memorial form data validated successfully');
            return { memorialData: parsedData };
        } catch (parseError) {
            console.error('Error parsing memorial data:', parseError);
            return { error: 'Invalid memorial data format' };
        }
    } catch (error) {
        console.error('Error loading user metadata:', error);
        return {
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        };
    }
};
