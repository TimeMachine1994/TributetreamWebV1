/**
 * Client-side configuration for Strapi CMS integration
 * This file is safe to import from both client and server code
 */

import { PUBLIC_STRAPI_API_URL } from '$env/static/public';

/**
 * The base URL for the Strapi API
 * This is exposed to client-side code via PUBLIC_ prefix in .env
 */
export const STRAPI_URL = PUBLIC_STRAPI_API_URL;