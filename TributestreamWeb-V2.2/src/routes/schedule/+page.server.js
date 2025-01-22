
// src/schedule/+page.server.js
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  if (!locals.jwt) {
    throw redirect(303, '/login');
  }

  return {};
}