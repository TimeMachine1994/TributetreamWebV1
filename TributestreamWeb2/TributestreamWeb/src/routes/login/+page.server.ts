import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { BASE_WORDPRESS_API } from '$env/static/private';
 
 

async function handleLogin(username: string, password: string) {
         const response = await fetch(`${BASE_WORDPRESS_API}/wp-json/jwt-auth/v1/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        return response.json();
    }



export const load: PageServerLoad = async ({ cookies }) => {
    const token = await cookies.get('jwt');
    if (token) {
        throw redirect(302, '/dashboard');
    }
    return { user: null };
};

export const actions = {
    login: async ({ cookies, request,  }) => {
        const data = await request.formData();
        const username = data.get('username');
        const password = data.get('password');
        const response = await handleLogin(username, password);
        
     
            const responseData = await response.json();
            
            cookies.set('jwt', responseData.data.token, {
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 // 24 hours
            });

            const user = {
                id: responseData.data.id,
                email: responseData.data.email,
                nicename: responseData.data.nicename,
                firstName: responseData.data.firstName,
                lastName: responseData.data.lastName,
                displayName: responseData.data.displayName
            };

            return {
                success: true,
                statusCode: 200,
                code: responseData.code,
                message: responseData.message,
                user, 
            };
        }
        

} satisfies Actions;

 