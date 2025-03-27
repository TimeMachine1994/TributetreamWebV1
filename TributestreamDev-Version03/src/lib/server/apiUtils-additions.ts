import {
  FUNERAL_API_PATH,
  forwardRequestToWordPress,
  createErrorResponse
} from './apiUtils';

/**
 * Forward an API request to the WordPress API
 *
 * A simplified wrapper around forwardRequestToWordPress
 * 
 * @param options Options for forwarding the request
 * @returns Response data
 */
export async function forwardApiRequest(options: {
  path: string;
  request: Request;
  fetch: typeof fetch;
  method?: string;
  queryParams?: URLSearchParams;
  body?: any;
}): Promise<any> {
  const { path, request, fetch, method, queryParams, body } = options;
  
  // Build the URL
  const wpApiPath = path.replace('/api', FUNERAL_API_PATH);
  let url = wpApiPath;
  
  // Add query parameters if provided
  if (queryParams && queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  
  // Create a mock RequestEvent with the necessary properties
  const mockEvent = {
    request,
    fetch
  } as any;
  
  // Build the request options
  const requestOptions: RequestInit = {
    method: method || request.method,
  };
  
  // Add body if provided or if the original request has a body
  if (body) {
    requestOptions.body = JSON.stringify(body);
  } else if (['POST', 'PUT', 'PATCH'].includes(requestOptions.method || '') && !['GET', 'HEAD'].includes(request.method)) {
    // Only try to get the body if the method supports it
    try {
      const requestBody = await request.clone().json();
      requestOptions.body = JSON.stringify(requestBody);
    } catch (error) {
      // Ignore errors, the body might be empty or not JSON
    }
  }
  
  // Forward the request to WordPress
  return forwardRequestToWordPress(mockEvent, url, requestOptions);
}

/**
 * Handle API errors and return a standardized error response
 * 
 * @param err Error object
 * @returns SvelteKit error response
 */
export function handleApiError(err: any) {
  console.error('API Error:', err);
  
  // Create a standardized error response
  const errorResponse = createErrorResponse(
    err.code || 'API_ERROR',
    err.message || 'An unknown error occurred',
    err.status || 500
  );
  
  // Return a JSON response with the error
  return new Response(
    JSON.stringify(errorResponse),
    {
      status: errorResponse.status || 500,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}