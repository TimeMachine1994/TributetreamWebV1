import type { Cookies } from '@sveltejs/kit';
import type { JwtPayload, UserData, UserRole } from './types';

/**
 * Map API role types to UserRole enum
 * @param role Role from API (string or object with type property)
 * @returns Mapped UserRole
 */
function mapRole(role: any): UserRole {
  console.log('🎭 Mapping role:', role);

  // If role is a string, capitalize first letter of each word
  if (typeof role === 'string') {
    console.log('📝 Role is string type:', role);
    return role.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ') as UserRole;
  }

  // If role is an object with type property
  if (role && typeof role === 'object' && 'type' in role) {
    console.log('🎯 Role is object with type:', role.type);
    return mapRole(role.type);
  }

  console.warn('⚠️ Unknown role format:', role);
  return 'Family Contact'; // Default role as fallback
}

/**
 * Extract user information from JWT token
 * @param token JWT token from cookie
 * @returns User data or null if token is invalid
 */
export async function getUserFromToken(token: string | undefined): Promise<UserData | null> {
  if (!token) {
    console.log('🚫 No token provided');
    return null;
  }
  
  try {
    console.log('🔑 Parsing JWT token...');
    // TODO: Use a proper JWT library for verification
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload)) as JwtPayload;
    
    console.log('📦 Raw JWT payload:', payload);

    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      console.log('⏰ Token expired');
      return null;
    }

    // Map the role from the payload
    const mappedRole = mapRole(payload.role);
    console.log('👥 Mapped role:', mappedRole);
    
    const userData: UserData = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: mappedRole,
      authenticated: true
    };

    console.log('👤 Extracted user data:', userData);
    return userData;
  } catch (error) {
    console.error('❌ Error parsing JWT token:', error);
    return null;
  }
}

/**
 * Store JWT token in cookie
 * @param cookies SvelteKit cookies object
 * @param token JWT token to store
 */
export function setAuthCookie(cookies: Cookies, token: string): void {
  console.log('🍪 Setting auth cookie');
  cookies.set('jwt', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
}

/**
 * Clear JWT token from cookie
 * @param cookies SvelteKit cookies object
 */
export function clearAuthCookie(cookies: Cookies): void {
  console.log('🗑️ Clearing auth cookie');
  cookies.set('jwt', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 0
  });
}