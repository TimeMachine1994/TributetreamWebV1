export const WP_API_BASE = 'https://wp.tributestream.com/wp-json';
export const WP_API_NAMESPACE = 'tributestream/v1';
export const WP_API_URL = `${WP_API_BASE}/${WP_API_NAMESPACE}`;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// WordPress API response types
interface WPUserProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  roles: string[];
  meta: Record<string, any>;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// In-memory cache for user profile data
const profileCache = new Map<number, CachedData<WPUserProfile>>();

export async function wpFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Ensure endpoint starts with forward slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${WP_API_URL}${normalizedEndpoint}`;
  
  console.log('wpFetch: Making request to:', {
    url,
    method: options?.method || 'GET',
    headers: options?.headers
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    // Always try to parse response body for error details
    const responseData = await response.json().catch(() => null);
    
    if (!response.ok) {
      console.error('wpFetch: Request failed:', {
        url,
        status: response.status,
        statusText: response.statusText,
        responseData
      });

      throw new ApiError(
        response.status,
        responseData?.message || response.statusText || 'API request failed'
      );
    }

    // Validate response data exists
    if (responseData === null || responseData === undefined) {
      console.error('wpFetch: Empty response data');
      throw new ApiError(500, 'Empty response from API');
    }

    console.log('wpFetch: Request successful:', {
      url,
      status: response.status,
      dataType: typeof responseData
    });

    return responseData as T;
  } catch (error) {
    // Enhance error with request context
    if (error instanceof ApiError) {
      error.message = `API Error (${url}): ${error.message}`;
    } else {
      console.error('wpFetch: Network or parsing error:', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new ApiError(
        500,
        `Network or parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
    throw error;
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchUserProfile(token: string): Promise<WPUserProfile> {
  if (!token) {
    throw new ApiError(400, 'Authentication token is required');
  }

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`fetchUserProfile: Initiating attempt ${attempt}`);
      
      const response = await fetch(`${WP_API_BASE}/wp/v2/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
          response.status,
          errorData?.message || `Failed to fetch user profile (${response.status})`
        );
      }

      const data = await response.json();
      
      // Validate required fields
      if (!data.email) {
        console.error('fetchUserProfile: Missing email in response:', data);
        throw new ApiError(500, 'Invalid user profile data structure: Missing email');
      }

      const profile: WPUserProfile = {
        id: data.id,
        username: data.username || '',
        name: data.name || '',
        email: data.email,
        roles: Array.isArray(data.roles) ? data.roles : ['subscriber'],
        meta: data.meta || {}
      };

      // Update cache using user ID from response
      profileCache.set(profile.id, {
        data: profile,
        timestamp: Date.now()
      });

      console.log('fetchUserProfile: Successfully fetched profile:', {
        userId: profile.id,
        username: profile.username
      });
      
      return profile;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`fetchUserProfile: Attempt ${attempt} failed:`, {
        error: lastError.message,
        stack: lastError.stack
      });

      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY * attempt); // Exponential backoff
        continue;
      }
    }
  }

  const finalError = new ApiError(
    500,
    `Failed to fetch user profile after ${MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`
  );
  console.error('fetchUserProfile: All attempts failed:', {
    error: finalError.message,
    originalError: lastError
  });
  throw finalError;
}

export function clearUserProfileCache(userId?: number): void {
  if (userId !== undefined) {
    profileCache.delete(userId);
  } else {
    profileCache.clear();
  }
  console.log('User profile cache cleared:', userId ? `for user ${userId}` : 'all users');
}
