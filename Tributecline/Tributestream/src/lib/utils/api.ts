export const WP_API_BASE = 'https://wp.tributestream.com/wp-json';
export const WP_API_NAMESPACE = 'tributestream/v1';
export const WP_API_URL = `${WP_API_BASE}/${WP_API_NAMESPACE}`;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function wpFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${WP_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });
  
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }
  
  return response.json();
}
