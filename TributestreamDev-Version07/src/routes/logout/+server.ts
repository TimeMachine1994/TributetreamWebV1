import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export function GET({ cookies }) {
  cookies.delete('auth_token', { path: '/' });
  throw redirect(302, '/');
}
