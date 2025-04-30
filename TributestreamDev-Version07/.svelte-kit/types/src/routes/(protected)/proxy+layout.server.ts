// @ts-nocheck
import { redirect } from '@sveltejs/kit';

/** @param {Parameters<import('./$types').LayoutServerLoad>[0]} event */
export function load({ locals, url }) {
  // Check if user is authenticated
  if (!locals.user) {
    throw redirect(302, `/login?redirectTo=${url.pathname}`);
  }
  
  return {
    user: locals.user
  };
}
