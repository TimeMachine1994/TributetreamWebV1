// src/hooks.server.ts
import { authStore } from '$lib/stores/auth-store';
import { getTokenFromCookie, getUserFromCookie, clearAuthCookies } from '$lib/utils/cookie-auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const token = getTokenFromCookie(event.cookies);
  const user = getUserFromCookie(event.cookies);
  
  // Initialize the auth store with cookie data
  const isAuthenticated = await authStore.initFromCookies(token, user);
  
  // Set locals for use in server routes
  event.locals.authenticated = isAuthenticated;
  event.locals.user = user;
  event.locals.token = token;
  
  // If token is invalid, clear cookies
  if (token && !isAuthenticated) {
    clearAuthCookies(event.cookies);
  }
  
  return resolve(event);
};
