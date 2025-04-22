import { apiConfig } from '$lib/server/config';
import type { AuthResponse, LoginPayload, StrapiUser } from '$lib/types/auth';

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  console.log('Attempting login with payload:', { identifier: payload.identifier, passwordLength: payload.password.length });
  console.log('Using API URL:', `${apiConfig.url}/api/auth/local`);
  
  try {
    const response = await fetch(`${apiConfig.url}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login error response:', JSON.stringify(errorData));
      
      // Try to extract error message with better fallback handling
      let errorMessage = 'Authentication failed';
      if (errorData && typeof errorData === 'object') {
        // Handle different error formats
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData) && errorData.length > 1 && typeof errorData[1] === 'string') {
          // Handle array format like in the error
          errorMessage = errorData[1];
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Login successful');
    return data;
  } catch (error) {
    console.error('Login exception:', error);
    throw error;
  }
}

export async function getCurrentUser(jwt: string): Promise<StrapiUser> {
  const response = await fetch(`${apiConfig.url}/api/users/me?populate=role`, {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  const data = await response.json();
  
  // Transform the response to match our expected format
  // Converting snake_case to camelCase
  return {
    ...data,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}
