/**
 * Server-side configuration for Strapi CMS integration
 * This file should only be imported from server-side code (e.g., +page.server.js, api routes)
 */

import { STRAPI_PRIVATE_API, STRAPI_PUBLIC_API } from '$env/static/private';
import { STRAPI_URL } from '$lib/config';

/**
 * Full API configuration with private keys
 * Used for authenticated server-side requests to Strapi
 */
export const apiConfig = {
  url: STRAPI_URL,
  publicKey: STRAPI_PUBLIC_API,
  privateKey: STRAPI_PRIVATE_API
};

/**
 * Creates headers for authenticated Strapi API requests
 * @param {boolean} includePrivateKey - Whether to include the private API key
 * @returns {HeadersInit} - Headers object to use in fetch requests
 */
export function createStrapiHeaders(includePrivateKey = false) {
  /** @type {Record<string, string>} */
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_PUBLIC_API}`
  };

  if (includePrivateKey) {
    headers['X-API-Private-Key'] = STRAPI_PRIVATE_API;
  }

  return headers;
}