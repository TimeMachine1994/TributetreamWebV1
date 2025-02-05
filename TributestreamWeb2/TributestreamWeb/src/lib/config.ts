// WordPress API configuration
export const WP_API_URL = 'https://YOUR_WP_SITE.com/wp-json';
export const WP_API_NAMESPACE = 'tributestream/v1';

// Construct the full base URL for WordPress API endpoints
export const getWpApiUrl = (endpoint: string): string => `${WP_API_URL}/${WP_API_NAMESPACE}/${endpoint}`;
