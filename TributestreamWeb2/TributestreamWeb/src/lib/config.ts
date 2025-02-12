// WordPress API configuration
export const WP_API_URL = 'http://wp.tributestream.com/wp-json'; // Local WordPress development server
export const WP_API_NAMESPACE = 'tributestream/v1';

// Construct the full base URL for WordPress API endpoints
export const getWpApiUrl = (endpoint: string): string => {
    const url = `${WP_API_URL}/${WP_API_NAMESPACE}/${endpoint}`;
    console.log('[config] WordPress API URL:', url);
    return url;
};
