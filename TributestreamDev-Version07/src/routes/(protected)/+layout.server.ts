import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals, url }) {
  // Check if user is authenticated
  if (!locals.user) {
    throw redirect(302, `/login?redirectTo=${url.pathname}`);
  }
  
  return {
    user: locals.user
  };
}
