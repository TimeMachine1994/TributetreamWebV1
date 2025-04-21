import { redirect, error } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
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
