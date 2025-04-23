import type { LayoutServerLoad } from './$types';

/**
 * Load function for the root layout
 * Provides user data from server to client
 */
export const load: LayoutServerLoad = ({ locals }) => {
  return {
    user: locals.user
  };
};