// src/routes/api/auth/check/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authStore } from '$lib/stores/auth-store';
import { getTokenFromCookie, getUserFromCookie } from '$lib/utils/cookie-auth';

export const GET: RequestHandler = async ({ cookies }) => {
  console.log('🔍 [Auth Check API] Checking authentication status');
  
  // Get token and user from cookies
  const token = getTokenFromCookie(cookies);
  const user = getUserFromCookie(cookies);
  
  // Initialize the auth store with cookie data
  if (token && user) {
    try {
      const isAuthenticated = await authStore.initFromCookies(token, user);
      
      if (isAuthenticated) {
        console.log('✅ [Auth Check API] User is authenticated:', user.id);
        
        // Return user information
        return json({
          authenticated: true,
          user
        });
      }
    } catch (error) {
      console.error('❌ [Auth Check API] Error validating token:', error);
    }
  }
  
  console.log('❌ [Auth Check API] No authenticated user found or token invalid');
  return json({ authenticated: false }, { status: 401 });
};
