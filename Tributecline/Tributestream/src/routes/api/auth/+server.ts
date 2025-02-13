import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WP_AUTH_URL = 'https://wp.tributestream.com/wp-json/jwt-auth/v1/token';

 
interface ParsedUserData {
    success: number;
    user: number;
    display_name: string;
    email: string;
    nicename: string;
}

export const POST: RequestHandler = async ({ fetch, request, cookies }) => {
    try {
        const body = await request.json();
        
        // Validate required fields
        if (!body.username || !body.password) {
            throw error(400, {
                message: 'Username and password are required'
            });
        }

        const response = await fetch(WP_AUTH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: body.username,
                password: body.password
            })
        });

        if (!response.ok) {
            throw error(response.status, {
                message: 'Authentication failed'
            });
        }
 
        // Parse the serialized data
        try {
            const parsedData = JSON.parse(wpResponse.data);
            const [userInfo, , userDetails, displayName, email] = parsedData;

            // Extract user data
            const userData: ParsedUserData = {
                success: userInfo.success,
                user: userInfo.user,
                display_name: displayName,
                email: email,
                nicename: displayName.toLowerCase().replace(/\s+/g, '-')
            };

            // Set user ID in cookies
            cookies.set('user_id', userData.user.toString(), {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });

            // Return the response with user data
            return json({
                success: true,
                user_display_name: userData.display_name,
                user_email: userData.email,
                user_nicename: userData.nicename
            });

        } catch (parseError) {
            console.error('[/api/auth] Parse Error:', parseError);
            throw error(500, {
                message: 'Failed to parse WordPress response'
            });
        }
    } catch (err) {
        console.error('[/api/auth] Error:', err);
        
        // If it's already a SvelteKit error, rethrow it
        if (err instanceof Error && 'status' in err) {
            throw err;
        }
        
        // Otherwise throw a generic error
        throw error(500, {
            message: 'Failed to authenticate with WordPress'
        });
    }
};