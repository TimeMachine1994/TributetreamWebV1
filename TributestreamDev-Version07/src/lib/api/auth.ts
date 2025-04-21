import { apiConfig } from '$lib/server/config';
import type { AuthResponse, LoginPayload, StrapiUser } from '$lib/types/auth';

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${apiConfig.url}/api/auth/local`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message || 'Authentication failed');
  }

  return response.json();
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
