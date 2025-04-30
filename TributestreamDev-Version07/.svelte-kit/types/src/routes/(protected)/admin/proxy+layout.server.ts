// @ts-nocheck
import { redirect, error } from '@sveltejs/kit';

/** @param {Parameters<import('./$types').LayoutServerLoad>[0]} event */
export function load({ locals }) {
  // Check if user has admin role
  if (!locals.user) {
    throw redirect(302, '/login');
  }
  
  if (locals.user.role.type !== 'admin') {
    throw error(403, 'You do not have permission to access this area');
  }
  
  return {
    user: locals.user
  };
}
