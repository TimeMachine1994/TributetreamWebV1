import { redirect } from '@sveltejs/kit';
import { accessControlService } from '$lib/services/access-control-service';
import type { PageServerLoad } from './$types';

/**
 * Server-side load function for the admin dashboard
 * Checks if the user is authenticated and has admin access
 */
export const load: PageServerLoad = async ({ cookies }) => {
  console.log('[admin-dashboard] Page server load function called');
  console.log('[admin-dashboard] Available cookies:', Object.keys(cookies.getAll()));
  
  // Check if user has admin access
  console.log('[admin-dashboard] Checking admin access');
  const hasAdminAccess = accessControlService.hasAdminAccessFromCookies(cookies);
  console.log('[admin-dashboard] Has admin access:', hasAdminAccess);
  
  if (!hasAdminAccess) {
    console.log('[admin-dashboard] Redirecting to login page');
    throw redirect(302, '/login?redirect=/my-portal/admin-dashboard');
  }
  
  console.log('[admin-dashboard] User has admin access, proceeding to dashboard');
  
  // Return empty data object
  return {};
};