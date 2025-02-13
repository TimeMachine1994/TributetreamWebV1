import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { UserMeta, CalculatorData, FuneralHomeData } from '$lib/types/api';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
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
        
        // Find calculator-related meta data
        const calculatorData = data.meta?.find((meta: UserMeta) => meta.meta_key === 'calculator_data');
        const funeralHomeData = data.meta?.find((meta: UserMeta) => meta.meta_key === 'funeral_home_data');

        return {
            calculatorData: calculatorData ? JSON.parse(calculatorData.meta_value) as CalculatorData : null,
            funeralHomeData: funeralHomeData ? JSON.parse(funeralHomeData.meta_value) as FuneralHomeData : null,
            error: null
        };
    } catch (error) {
        console.error('Error loading user metadata:', error);
        return {
            calculatorData: null,
            funeralHomeData: null,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        };
    }
};