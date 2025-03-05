// File: src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
    console.log('🔧 [Layout Server] load() triggered');
  
    // 1. Retrieve JWT from locals (populated by hooks.server.ts)
    const jwt = cookies.get('jwt');
    console.log('🔑 [Layout Server] JWT in locals:', jwt);
  
    // 2. Retrieve user data from cookie, if any
    const userDataCookie = cookies.get('user');
    console.log('🍪 [Layout Server] userDataCookie:', userDataCookie);
  
    // 3. If missing, return user: null
    if (!jwt || !userDataCookie) {
      console.log('⚠️ [Layout Server] Missing JWT or user cookie; returning user: null');
      return {
        user: null,
        token: null
      };
    }
  
    // 4. Parse the user data cookie safely
    try {
      const userData = JSON.parse(userDataCookie);
      console.log('🛬 [Layout Server] Parsed user data:', userData);
      
      // Return both user data and the JWT token
      return {
        user: userData,
        token: jwt  // Include the token so TributeStore can use it
      };
    } catch (error) {
      console.error('❌ [Layout Server] Error parsing user data cookie:', error);
      return {
        user: null,
        token: null
      };
    }
}
