import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ cookies }: RequestEvent) => {
  // Clear the JWT cookie
  cookies.delete('jwt', { path: '/' });
  
  return json({ success: true });
};