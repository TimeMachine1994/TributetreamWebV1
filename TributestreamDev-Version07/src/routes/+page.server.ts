import type { PageServerLoad } from './$types';
import { fetchUserData } from '$lib/api/auth';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
  // Check if the user has a JWT in cookies
  const jwt = cookies.get('jwt');
  
  if (!jwt) {
    // No JWT, user is not authenticated
    return {
      user: null
    };
  }
  
  // JWT exists, fetch user data
  const userData = await fetchUserData(fetch);
  
  return {
    user: userData
  };
};