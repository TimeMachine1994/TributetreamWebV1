import type { Cookies } from '@sveltejs/kit';

export interface LayoutServerLoadParams {
  cookies: Cookies;
  url: URL;
}

export interface LayoutServerLoadResult {
  authenticated: boolean;
}

export const load = async ({ cookies, url }: LayoutServerLoadParams): Promise<LayoutServerLoadResult> => {
  // Skip authentication check for login page
  if (url.pathname === '/admin/login') {
    return {
      authenticated: false
    };
  }
  
  // Check if the JWT token exists
  const token = cookies.get('jwt');
  
  // In a real app, you would validate the token
  // For this example, we'll just check if it exists
  return {
    authenticated: !!token
  };
};