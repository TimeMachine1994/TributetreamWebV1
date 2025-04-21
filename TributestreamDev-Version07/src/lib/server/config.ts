import { STRAPI_PRIVATE_API, STRAPI_PUBLIC_API } from '$env/static/private';
import { STRAPI_URL } from '$lib/config';

export const apiConfig = {
  url: STRAPI_URL,
  publicKey: STRAPI_PUBLIC_API,
  privateKey: STRAPI_PRIVATE_API
};
