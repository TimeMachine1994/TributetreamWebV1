// src/routes/logout/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { clearAuthCookies } from '$lib/utils/cookie-auth';

export const actions: Actions = {
  default: async ({ cookies }) => {
    // Clear auth cookies
    clearAuthCookies(cookies);
    
    // Redirect to home page
    throw redirect(303, '/');
  }
};
