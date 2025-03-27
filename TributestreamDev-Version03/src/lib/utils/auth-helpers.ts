import type {
  DirectorInfo,
  LovedOneInfo,
  UserInfo,
  MemorialInfo,
  LiveStreamInfo,
  PackageInfo,
  BillingInfo,
  MasterStore
} from '$lib/stores/master-store.svelte';
import type { Cookies } from '@sveltejs/kit';

export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Login user with username and password
 * @param username Username or email
 * @param password User password
 * @param cookies Cookies object from the event
 * @param fetchFn Optional fetch function (use event.fetch in server contexts)
 * @returns Login result with success status and user data or error message
 */
export async function loginUser(
  username: string,
  password: string,
  cookies: Cookies,
  fetchFn: typeof fetch = fetch
): Promise<{ success: boolean; message?: string; user?: User }> {
  try {
    console.log('🔐 [auth-helpers] Attempting to login user:', username);
    
    // Make request to the auth API endpoint
    const response = await fetchFn('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    // Parse the response
    const data = await response.json();
    
    // Handle authentication failure
    if (!response.ok) {
      console.error('❌ [auth-helpers] Login failed:', data.message);
      return {
        success: false,
        message: data.message || 'Invalid username or password'
      };
    }
    
    // Set authentication cookies
    console.log('✅ [auth-helpers] Login successful, setting auth cookies');
    setAuthCookies(cookies, data);
    
    // Return success with user data
    return {
      success: true,
      user: {
        id: data.user_id,
        name: data.user_display_name,
        email: data.user_email
      }
    };
  } catch (error) {
    console.error('💥 [auth-helpers] Unexpected error during login:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Generates a secure random password
 * @param length Length of the password
 * @returns A secure random password
 */
export function generateSecurePassword(length = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
  let password = '';
  
  // Create a cryptographically secure random array
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  // Generate password from random values
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  
  return password;
}

/**
 * Sets authentication cookies based on API response
 * @param cookies The cookies object from the event
 * @param authResponse The response from the auth API
 */
export function setAuthCookies(cookies: any, authResponse: any): void {
  // Set JWT token cookie (httpOnly for security)
  cookies.set('jwt_token', authResponse.token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: import.meta.env.PROD, // Use SvelteKit's env
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
  
  // Set user info cookie (not httpOnly so client JS can access)
  cookies.set('user', JSON.stringify({
    id: authResponse.user_id,
    name: authResponse.user_display_name,
    email: authResponse.user_email
  }), {
    path: '/',
    httpOnly: false,
    sameSite: 'strict',
    secure: import.meta.env.PROD, // Use SvelteKit's env
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
}

/**
 * Converts MasterStore data to user-meta format
 * @param masterStore The MasterStore instance or data object
 * @returns Object ready for user-meta API
 */
export function convertMasterStoreToUserMeta(masterStore: Partial<MasterStore> | any): any {
  return {
    directorInfo: masterStore.directorInfo || {},
    lovedOneInfo: masterStore.lovedOneInfo || {},
    userInfo: masterStore.userInfo || {},
    memorialInfo: masterStore.memorialInfo || { locations: [{ name: '', address: '' }] },
    liveStreamInfo: masterStore.liveStreamInfo || {},
    packageInfo: masterStore.packageInfo || { priceTotal: 0 },
    billingInfo: masterStore.billingInfo || { isPaymentComplete: false }
  };
}

/**
 * Stores master data in user meta
 * @param userId User ID
 * @param masterData Master data object
 * @param token JWT token
 * @param fetchFn Optional fetch function (use event.fetch in server contexts)
 */
export async function storeMasterDataInUserMeta(
  userId: string,
  masterData: any,
  token: string,
  fetchFn: typeof fetch = fetch
): Promise<any> {
  const response = await fetchFn('/api/user-meta', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      user_id: userId,
      masterData: masterData
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to store user meta data');
  }
  
  return await response.json();
}

/**
 * Sends a welcome email to newly registered users
 * @param email User's email address
 * @param username User's username
 * @param password User's generated password
 * @param fetchFn Optional fetch function (use event.fetch in server contexts)
 */
/**
 * Gets the user data from cookies
 * @param cookies The cookies object from the event
 * @returns User data or null if not found
 */
export function getUserFromCookies(cookies: Cookies): User | null {
  const userCookie = cookies.get('user');
  if (!userCookie) return null;
  
  try {
    return JSON.parse(userCookie) as User;
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
}

/**
 * Loads user data from the user-meta API
 * @param userId User ID
 * @param token JWT token
 * @param fetchFn Optional fetch function (use event.fetch in server contexts)
 * @returns User data or null if not found
 */
export async function loadUserData(
  userId: string,
  token: string | undefined,
  fetchFn: typeof fetch = fetch
): Promise<any> {
  if (!token) {
    throw new Error('No authentication token provided');
  }
  
  const response = await fetchFn(`/api/user-meta?user_id=${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to load user data');
  }
  
  return await response.json();
}

export async function sendWelcomeEmail(
  email: string,
  username: string,
  password: string,
  fetchFn: typeof fetch = fetch
): Promise<any> {
  try {
    const response = await fetchFn('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: email,
        subject: 'Welcome to Funeral Service Application - Account Created',
        text: `
          Welcome to the Funeral Service Application!
          
          An account has been automatically created for you to streamline your experience.
          
          Username: ${username}
          Password: ${password}
          
          You can use these credentials to log in to your account in the future.
          
          Thank you for using our service.
        `,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to the Funeral Service Application</h2>
            <p>An account has been automatically created for you to streamline your experience.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Username:</strong> ${username}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>
            <p>You can use these credentials to log in to your account in the future.</p>
            <p>Thank you for using our service.</p>
          </div>
        `
      })
    });
    
    if (!response.ok) {
      console.error('Failed to send welcome email');
      // We don't throw an error here as email sending shouldn't block the registration process
      return { success: false };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // We still return a "success" object to prevent blocking the registration process
    return { success: false, error: 'Email service error' };
  }
}