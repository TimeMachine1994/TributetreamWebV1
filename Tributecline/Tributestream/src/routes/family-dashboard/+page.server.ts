import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { UserMeta } from '$lib/types/api';

interface MemorialFormData {
    director: {
        firstName: string;
        lastName: string;
    };
    familyMember: {
        firstName: string;
        lastName: string;
        dob: string;
    };
    deceased: {
        firstName: string;
        lastName: string;
        dob: string;
        dop: string;
    };
    contact: {
        email: string;
        phone: string;
    };
    memorial: {
        locationName: string;
        locationAddress: string;
        time: string;
        date: string;
    };
}

export const load: PageServerLoad = async ({ locals, fetch }) => {
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
        console.log('Received response from /api/user-meta:', {
            status: response.status,
            statusText: response.statusText
        });

        if (!response.ok) {
            const errorMsg = `Failed to fetch user metadata: ${response.statusText}`;
            console.error(errorMsg);
            throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log('User metadata fetched successfully:', data);

        const memorialData = data.meta.find((meta: UserMeta) => meta.meta_key === 'memorial_form_data');
        if (!memorialData) {
            console.error('No memorial form data found in user metadata');
            return {
                error: 'No memorial form data found'
            };
        }

        try {
            console.log('Parsing memorial form data');
            const parsedData = JSON.parse(memorialData.meta_value) as MemorialFormData;
            console.log('Parsed memorial data:', parsedData);

            // Validate required fields for deceased information
            if (!parsedData.deceased?.firstName || !parsedData.deceased?.lastName) {
                const errorMsg = 'Missing required deceased information';
                console.error(errorMsg, parsedData.deceased);
                throw new Error(errorMsg);
            }

            // Validate required fields for memorial location information
            if (!parsedData.memorial?.locationName || !parsedData.memorial?.locationAddress) {
                const errorMsg = 'Missing required memorial location information';
                console.error(errorMsg, parsedData.memorial);
                throw new Error(errorMsg);
            }

            console.log('Memorial form data validated successfully');
            return {
                memorialData: parsedData
            };
        } catch (parseError) {
            console.error('Error parsing memorial data:', parseError);
            return {
                error: 'Invalid memorial data format'
            };
        }
    } catch (error) {
        console.error('Error loading user metadata:', error);
        return {
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        };
    }
};
