// FILE: src/hooks.server.ts

import type { Handle } from '@sveltejs/kit';
import { validateSessionToken, setSessionTokenCookie, deleteSessionTokenCookie } from '.src/lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('jwt') ?? null; // Retrieve the JWT token from cookies

  // If no token exists, set locals to null and proceed
  if (!token) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  // Validate the token
  const { session, user } = await validateSessionToken(token);

  if (session !== null) {
    // Refresh the token cookie to extend its lifespan
    setSessionTokenCookie(event, token, session.expiresAt);
  } else {
    // Delete the cookie if the session is invalid
    deleteSessionTokenCookie(event);
  }

  // Store session and user data in locals
  event.locals.session = session;
  event.locals.user = user;

  return resolve(event);
};
