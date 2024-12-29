import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BASE_WORDPRESS_API } from '$env/static/private';


export const load: PageServerLoad = async ({ cookies, fetch }) => {

    console.log('🚀 Dashboard load: Starting server load function');
    


    const token = cookies.get('jwt');
    console.log('🔑 Full JWT Token:', token); // Log the actual token value
    
    if (!token) {
        throw redirect(302, '/login');
    }

    // try {

    //     const nonceResponse = await fetch(`${BASE_WORDPRESS_API}/tributestream/v1/get-nonce`, {
    //         method: 'GET',
    //         credentials: 'include' // Include cookies for user authentication if needed
    //     });
    
    //     if (!nonceResponse.ok) {
    //         console.error('Failed to fetch nonce:', nonceResponse.statusText);
    //         return {
    //             status: nonceResponse.status,
    //             error: 'Failed to fetch nonce for authentication.'
    //         };
    //     }
    
    //     const nonceData = await nonceResponse.json();
    //     const nonce = nonceData.nonce;

    //     const headers = new Headers({
    //         'Authorization': `Bearer ${token}`,
    //         'X-WP-Nonce': nonce,
    //         'Content-Type': 'application/json'
    //     });
        
    //     console.log('🎯 Request headers:', Object.fromEntries(headers));
        
    //     const response = await fetch(`${BASE_WORDPRESS_API}/custom/v1/wpa2_tributes`, {
    //         headers
    //             });
        
    //     if (!response.ok) {
    //         console.log('🔍 Response details:', {
    //             status: response.status,
    //             statusText: response.statusText,
    //             headers: Object.fromEntries(response.headers)
    //         });
    //         throw new Error(`HTTP error! status: ${response.status}`);
    //     }

    //     const tributes = await response.json();
    //     return { tributes, isAuthenticated: true };
    // } catch (error) {
    //     console.log('🚨 Detailed error:', error);
    //     throw redirect(302, '/login');
    // }



    
};
