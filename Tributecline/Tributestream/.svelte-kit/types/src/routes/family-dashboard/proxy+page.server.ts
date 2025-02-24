// @ts-nocheck
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

export const load = async ({ cookies, fetch }: Parameters<PageServerLoad>[0]) => {
    const userId = cookies.get('user_id');
    const token = cookies.get('jwt_token');

    if (!userId || !token) {
        throw redirect(302, '/login');
    }

    try {
        const response = await fetch(`/api/user-meta/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user metadata');
        }

        const data = await response.json();
        const memorialData = data.meta.find((meta: UserMeta) => meta.meta_key === 'memorial_form_data');

        if (!memorialData) {
            return {
                error: 'No memorial form data found'
            };
        }

        try {
            const parsedData = JSON.parse(memorialData.meta_value) as MemorialFormData;
            
            // Validate required fields
            if (!parsedData.deceased?.firstName || !parsedData.deceased?.lastName) {
                throw new Error('Missing required deceased information');
            }

            if (!parsedData.memorial?.locationName || !parsedData.memorial?.locationAddress) {
                throw new Error('Missing required memorial location information');
            }

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
