/**
 * Server-side load function for the root layout
 * Provides user data to all pages in the application
 */
export function load(event: { locals: { user?: any } }) {
  return {
    user: event.locals.user || null
  };
}
