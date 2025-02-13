import { json } from '@sveltejs/kit';
import type { LoginResponse } from '$lib/types/api';
import type { User } from '$lib/stores/userStore';
import { env } from '$env/dynamic/private';

interface LoginCredentials {
  username: string;
  password: string;
}

interface WPAuthResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
  user_id: number;
}

interface WPUserProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  roles: string[];
  meta: Record<string, any>;
}

export async function POST({ request }) {
  try {
    const credentials = await request.json() as LoginCredentials;
    
    // Input validation
    if (!credentials.username || !credentials.password) {
      console.error('Login: Missing required credentials');
      return json(
        { 
          error: true,
          message: 'Username and password are required'
        },
        { status: 400 }
      );
    }

    try {
      // Step 1: Authenticate with WordPress JWT
      const authResponse = await fetch(`${env.WP_API_BASE}/jwt-auth/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      });

      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        console.error('Login: WordPress authentication failed:', errorData);
        return json(
          { 
            error: true,
            message: errorData.message || 'Authentication failed'
          },
          { status: authResponse.status }
        );
      }

      const authResult = await authResponse.json() as WPAuthResponse;
      console.log('Login: Authentication successful for user:', authResult.user_nicename);

      // Step 2: Fetch complete user profile
      const profileResponse = await fetch(`${env.WP_API_BASE}/wp/v2/users/me`, {
        headers: {
          'Authorization': `Bearer ${authResult.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json().catch(() => null);
        console.error('Login: Failed to fetch user profile:', errorData);
        return json(
          { 
            error: true,
            message: 'Failed to fetch user profile'
          },
          { status: profileResponse.status }
        );
      }

      const profileData = await profileResponse.json();
      
      // Validate email field
      if (!profileData.email) {
        console.error('Login: Missing email in profile response:', profileData);
        return json(
          { 
            error: true,
            message: 'Invalid user profile: Missing email'
          },
          { status: 500 }
        );
      }

      const userProfile: WPUserProfile = {
        id: profileData.id,
        username: profileData.username || '',
        name: profileData.name || '',
        email: profileData.email,
        roles: Array.isArray(profileData.roles) ? profileData.roles : ['subscriber'],
        meta: profileData.meta || {}
      };

      // Step 3: Construct the complete login response
      const loginResponse: LoginResponse = {
        token: authResult.token,
        user_email: userProfile.email,
        user_nicename: userProfile.username,
        user_display_name: userProfile.name,
        user_id: userProfile.id,
        roles: userProfile.roles
      };

      // Step 4: Construct user object for client-side store
      const user: User = {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        displayName: userProfile.name,
        roles: userProfile.roles,
        meta: userProfile.meta,
        token: authResult.token
      };

      console.log('Login: Successfully completed login flow for user:', user.username);
      
      // Return both the login response and user object
      return json({
        ...loginResponse,
        user
      });
      
    } catch (error) {
      console.error('Login: Authentication or profile fetch error:', {
        username: credentials.username,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return json(
        { 
          error: true,
          message: 'Authentication failed'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Login: Request parsing error:', error);
    return json(
      { 
        error: true,
        message: 'Invalid request format'
      },
      { status: 400 }
    );
  }
}