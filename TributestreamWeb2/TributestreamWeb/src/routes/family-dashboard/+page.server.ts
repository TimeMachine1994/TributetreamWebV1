import { error, redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Note: Using conventional variable names for demonstration
// Replace with actual env vars in production
const SQUARE_SANDBOX_APP_ID = 'sandbox-app-id';
const SQUARE_SANDBOX_ACCESS_TOKEN = 'sandbox-access-token';
const SQUARE_LOCATION_ID = 'location-id';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    console.log('🚀 Loading user meta data.');

    const user_id = cookies.get('user_id');
    if (!user_id) {
        console.error('❌ Missing "user_id" query parameter.');
        throw error(400, 'user_id is required as a query parameter.');
    }

    const token = cookies.get('jwt');
    if (!token) {
        console.error('❌ Missing JWT token in cookies.');
        throw error(401, 'Authentication required');
    }

    try {
        // Fetch user metadata
        const metaApiUrl = `https://wp.tributestream.com/wp-json/tributestream/v1/user-meta/${user_id}`;
        console.log('🔗 Fetching user meta data from:', metaApiUrl);

        const metaResponse = await fetch(metaApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!metaResponse.ok) {
            const errorData = await metaResponse.json();
            console.error('❌ Error fetching user meta:', errorData);
            throw error(metaResponse.status, errorData.message || 'Failed to fetch user meta.');
        }

        const { meta } = await metaResponse.json();
        console.log('✅ User meta data retrieved');

        // Create an object with keys as meta_key and values as meta_value
        const metaObject = meta.reduce((acc: Record<string, any>, 
                                       { meta_key, meta_value }: { meta_key: string, meta_value: any }) => {
            acc[meta_key] = meta_value;
            return acc;
        }, {});

        // Also fetch tributes created by this user
        const tributesApiUrl = `https://wp.tributestream.com/wp-json/tributestream/v1/user-tributes/${user_id}`;
        console.log('🔗 Fetching user tributes from:', tributesApiUrl);

        const tributesResponse = await fetch(tributesApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        let tributes = [];
        if (tributesResponse.ok) {
            const tributeData = await tributesResponse.json();
            tributes = tributeData.tributes || [];
            console.log('✅ User tributes retrieved:', tributes.length);
        } else {
            console.warn('⚠️ Failed to fetch tributes, but continuing');
        }

        const appId = SQUARE_SANDBOX_APP_ID;
        const locationId = SQUARE_LOCATION_ID;
        
        return {
            appId, 
            locationId,
            userMeta: metaObject,
            tributes,
            user: {
                id: user_id,
            },
            token // Provide token so stores can use it for API calls
        };
    } catch (err: any) {
        console.error('💥 Error in server load function:', err);
        throw error(500, err.message || 'Internal Server Error');
    }
};

export const actions: Actions = {
    // Action to redirect to the calculator page
    editSchedule: async ({ request, cookies }) => {
        try {
            // You could perform additional processing here if needed
            
            // Redirect to the calculator page
            throw redirect(303, '/calculate-livestream');
        } catch (err: any) {
            if (err instanceof Response) {
                throw err; // Re-throw redirect
            }
            
            return fail(500, {
                error: true,
                message: err.message || 'Error redirecting to calculator'
            });
        }
    },
    
    // Action to update current tribute
    updateTribute: async ({ request, cookies, fetch }) => {
        const formData = await request.formData();
        const tributeId = formData.get('tribute_id') as string;
        const title = formData.get('title') as string;
        const notes = formData.get('notes') as string;
        
        if (!tributeId) {
            return fail(400, {
                error: true,
                message: 'Tribute ID is required'
            });
        }
        
        try {
            const token = cookies.get('jwt');
            if (!token) {
                return fail(401, {
                    error: true,
                    message: 'Authentication required'
                });
            }
            
            // Prepare update data
            const updateData: Record<string, any> = {};
            if (title) updateData.title = title;
            if (notes) updateData.notes = notes;
            
            // Update the tribute
            const updateResponse = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tributes/${tributeId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });
            
            if (!updateResponse.ok) {
                return fail(updateResponse.status, {
                    error: true,
                    message: 'Failed to update tribute'
                });
            }
            
            const result = await updateResponse.json();
            
            return {
                success: true,
                data: {
                    tribute: result.tribute
                }
            };
        } catch (err: any) {
            console.error('Error updating tribute:', err);
            return fail(500, {
                error: true,
                message: err.message || 'Server error while updating tribute'
            });
        }
    }
};
