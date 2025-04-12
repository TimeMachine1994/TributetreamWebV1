// src/routes/my-portal/users/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';
import { getUserFromCookies } from '$lib/utils/auth-helpers';

interface User {
  id: string;
  name: string;
  email: string;
}

export const load: ServerLoad = async ({ cookies, fetch }: { cookies: any; fetch: any }) => {
  // Check if user is authenticated
  const user = getUserFromCookies(cookies) as User | null;
  
  if (!user) {
    // Redirect to login page if not authenticated
    throw redirect(302, '/my-portal');
  }
  
  // Check if user is an administrator
  // We'll need to fetch the user's roles from WordPress
  try {
    const response = await fetch(`/api/user-roles?user_id=${user.id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user roles');
    }
    
    const data = await response.json();
    const isAdmin = data.roles?.includes('administrator') || false;
    
    if (!isAdmin) {
      // Return access denied flag if not an admin
      return {
        user,
        accessDenied: true
      };
    }
    
    // User is authenticated and is an admin
    return {
      user,
      accessDenied: false
    };
  } catch (error) {
    console.error('Error checking user roles:', error);
    return {
      user,
      accessDenied: true,
      error: 'Failed to verify administrator access'
    };
  }
};