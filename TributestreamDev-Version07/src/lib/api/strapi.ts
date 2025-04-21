import { STRAPI_URL } from '$lib/config';

// Runes-based cache store
export let apiCache = $state(new Map());

export async function fetchStrapi(
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> {
  const url = `${STRAPI_URL}/api/${endpoint}`;
  
  const mergedOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };
  
  // Cache key based on URL and options
  const cacheKey = url + JSON.stringify(mergedOptions);
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }
  
  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Strapi API error:', error);
    throw error;
  }
}

// Function to clear cache
export function invalidateCache() {
  apiCache.clear();
}
