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
        const apiUrl = `https://wp.tributestream.com/wp-json/tributestream/v1/user-meta/${user_id}`;
        console.log('🔗 Fetching data from:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Error fetching user meta:', errorData);
            throw error(response.status, errorData.message || 'Failed to fetch user meta.');
        }

        const { meta } = await response.json();
        console.log('✅ User meta data retrieved:', meta);

        // Create an object with keys as meta_key and values as meta_value
        const metaObject = meta.reduce((acc: Record<string, any>, 
                                       { meta_key, meta_value }: { meta_key: string, meta_value: any }) => {
            acc[meta_key] = meta_value;
            return acc;
        }, {});

        const appId = SQUARE_SANDBOX_APP_ID;
        const locationId = SQUARE_LOCATION_ID;

        
        return {
            appId, 
            locationId,
            userMeta: metaObject,
        };
    } catch (err: any) {
        console.error('💥 Error in server load function:', err);
        throw error(500, err.message || 'Internal Server Error');
    }
};

export const actions: Actions = {
    // Save calculator data
    saveCalculatorData: async ({ request, cookies, fetch }) => {
        const formData = await request.formData();
        const selectedPackage = formData.get('selectedPackage') as string;
        const cartItems = formData.get('cartItems') as string;
        const cartTotal = Number(formData.get('cartTotal'));
        const scheduleDays = formData.get('scheduleDays') as string;
        
        // Validation
        if (!selectedPackage || !cartItems || !scheduleDays) {
            return fail(400, {
                error: true,
                message: 'Missing required fields'
            });
        }
        
        try {
            const user_id = cookies.get('user_id');
            const token = cookies.get('jwt');
            
            if (!user_id || !token) {
                return fail(401, {
                    error: true,
                    message: 'Authentication required'
                });
            }
            
            // Save to user meta data
            const saveResponse = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/user-meta/${user_id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    meta: {
                        'package_selection': selectedPackage,
                        'cart_items': cartItems,
                        'cart_total': cartTotal.toString(),
                        'schedule_days': scheduleDays
                    }
                })
            });
            
            if (!saveResponse.ok) {
                return fail(saveResponse.status, {
                    error: true,
                    message: 'Failed to save calculator data'
                });
            }
            
            return {
                success: true,
                data: {
                    packageInfo: {
                        selection: selectedPackage,
                        items: JSON.parse(cartItems),
                        priceTotal: cartTotal
                    },
                    scheduleDays: JSON.parse(scheduleDays)
                }
            };
        } catch (err: any) {
            console.error('Error saving calculator data:', err);
            return fail(500, {
                error: true,
                message: err.message || 'Server error while saving calculator data'
            });
        }
    },
    
    // Proceed to checkout 
    proceedToCheckout: async ({ request, cookies }) => {
        const formData = await request.formData();
        const selectedPackage = formData.get('selectedPackage') as string;
        const cartItems = formData.get('cartItems') as string;
        const cartTotal = Number(formData.get('cartTotal'));
        const scheduleDays = formData.get('scheduleDays') as string;
        
        // Validation
        if (!selectedPackage || !cartItems || !scheduleDays) {
            return fail(400, {
                error: true,
                message: 'Missing required fields'
            });
        }
        
        try {
            // Store checkout data in a cookie for the checkout page
            cookies.set('checkout_data', JSON.stringify({
                packageSelection: selectedPackage,
                cartItems: JSON.parse(cartItems),
                cartTotal: cartTotal,
                scheduleDays: JSON.parse(scheduleDays)
            }), { path: '/', maxAge: 60 * 60 });
            
            // Redirect to checkout
            throw redirect(303, '/checkout');
        } catch (err: any) {
            if (err instanceof Response) {
                throw err; // Re-throw redirect
            }
            
            console.error('Error proceeding to checkout:', err);
            return fail(500, {
                error: true,
                message: err.message || 'Server error while proceeding to checkout'
            });
        }
    }
};
