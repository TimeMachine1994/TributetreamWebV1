/**
 * Unit tests for the authentication utilities
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getTokenFromCookie,
  getUserFromCookie,
  ensureAuthenticated,
  ensureAuthenticatedUser,
  hasRole,
  hasCapability,
  isAdmin,
  ensureHasRole,
  ensureHasCapability,
  ensureIsAdmin,
  ensureResourceAccess,
  getRoleForUserType
} from '../../../../../src/routes/api/v2/utils/auth-utils';
// We use ApiErrors indirectly through the auth-utils functions
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ApiErrors } from '../../../../../src/routes/api/v2/utils/error-handler';
import type { User } from '../../../../../src/routes/api/v2/types/users';
import type { Cookies } from '@sveltejs/kit';

// Disable ESLint for specific lines where we need to use 'any'
/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Authentication Utilities', () => {
  // Mock cookies
  let mockCookies: Cookies;
  
  // Mock user data
  const adminUser: User = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    name: 'Admin User',
    roles: ['administrator'],
    capabilities: {
      manage_options: true
    },
    user_type: 'admin'
  };
  
  const regularUser: User = {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    name: 'Regular User',
    roles: ['subscriber'],
    capabilities: {},
    user_type: 'user'
  };
  
  // Used in getRoleForUserType tests
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const funeralDirectorUser: User = {
    id: 3,
    username: 'funeral_director',
    email: 'fd@example.com',
    name: 'Funeral Director',
    roles: ['funeral_director'],
    capabilities: {
      manage_tributes: true
    },
    user_type: 'funeral_director'
  };
  
  // Setup before each test
  beforeEach(() => {
    // Create mock cookies
    const cookiesMap = new Map<string, string>();
    mockCookies = {
      get: vi.fn((key: string) => cookiesMap.get(key) || null),
      set: vi.fn((key: string, value: string) => cookiesMap.set(key, value)),
      delete: vi.fn((key: string) => cookiesMap.delete(key))
    } as unknown as Cookies;
    
    // Reset mocks
    vi.clearAllMocks();
  });
  
  // Clean up after each test
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('getTokenFromCookie', () => {
    it('should return the token from cookies', () => {
      // Setup
      mockCookies.get = vi.fn().mockReturnValue('mock-jwt-token');
      
      // Execute
      const token = getTokenFromCookie(mockCookies);
      
      // Assert
      expect(token).toBe('mock-jwt-token');
      expect(mockCookies.get).toHaveBeenCalledWith('jwt_token');
    });
    
    it('should return null if token is not in cookies', () => {
      // Setup
      mockCookies.get = vi.fn().mockReturnValue(null);
      
      // Execute
      const token = getTokenFromCookie(mockCookies);
      
      // Assert
      expect(token).toBeNull();
      expect(mockCookies.get).toHaveBeenCalledWith('jwt_token');
    });
  });
  
  describe('getUserFromCookie', () => {
    it('should return the user from cookies', () => {
      // Setup
      mockCookies.get = vi.fn().mockReturnValue(JSON.stringify(adminUser));
      
      // Execute
      const user = getUserFromCookie(mockCookies);
      
      // Assert
      expect(user).toEqual(adminUser);
      expect(mockCookies.get).toHaveBeenCalledWith('user');
    });
    
    it('should return null if user is not in cookies', () => {
      // Setup
      mockCookies.get = vi.fn().mockReturnValue(null);
      
      // Execute
      const user = getUserFromCookie(mockCookies);
      
      // Assert
      expect(user).toBeNull();
      expect(mockCookies.get).toHaveBeenCalledWith('user');
    });
    
    it('should return null if user cookie is invalid JSON', () => {
      // Setup
      mockCookies.get = vi.fn().mockReturnValue('invalid-json');
      
      // Execute
      const user = getUserFromCookie(mockCookies);
      
      // Assert
      expect(user).toBeNull();
      expect(mockCookies.get).toHaveBeenCalledWith('user');
    });
  });
  
  describe('ensureAuthenticated', () => {
    it('should return the token if authenticated', () => {
      // Setup
      mockCookies.get = vi.fn().mockReturnValue('mock-jwt-token');
      
      // Execute
      const token = ensureAuthenticated(mockCookies);
      
      // Assert
      expect(token).toBe('mock-jwt-token');
      expect(mockCookies.get).toHaveBeenCalledWith('jwt_token');
    });
    
    it('should throw an error if not authenticated', () => {
      // Setup
      mockCookies.get = vi.fn().mockReturnValue(null);
      
      // Execute and assert
      expect(() => ensureAuthenticated(mockCookies)).toThrow();
      expect(mockCookies.get).toHaveBeenCalledWith('jwt_token');
    });
  });
  
  describe('ensureAuthenticatedUser', () => {
    it('should return the user and token if authenticated', () => {
      // Setup
      mockCookies.get = vi.fn()
        .mockReturnValueOnce('mock-jwt-token') // First call for token
        .mockReturnValueOnce(JSON.stringify(adminUser)); // Second call for user
      
      // Execute
      const result = ensureAuthenticatedUser(mockCookies);
      
      // Assert
      expect(result).toEqual({
        user: adminUser,
        token: 'mock-jwt-token'
      });
      expect(mockCookies.get).toHaveBeenCalledWith('jwt_token');
      expect(mockCookies.get).toHaveBeenCalledWith('user');
    });
    
    it('should throw an error if not authenticated', () => {
      // Setup
      mockCookies.get = vi.fn().mockReturnValue(null);
      
      // Execute and assert
      expect(() => ensureAuthenticatedUser(mockCookies)).toThrow();
      expect(mockCookies.get).toHaveBeenCalledWith('jwt_token');
    });
    
    it('should throw an error if token exists but user does not', () => {
      // Setup
      mockCookies.get = vi.fn()
        .mockReturnValueOnce('mock-jwt-token') // First call for token
        .mockReturnValueOnce(null); // Second call for user
      
      // Execute and assert
      expect(() => ensureAuthenticatedUser(mockCookies)).toThrow();
      expect(mockCookies.get).toHaveBeenCalledWith('jwt_token');
      expect(mockCookies.get).toHaveBeenCalledWith('user');
    });
  });
  
  describe('hasRole', () => {
    it('should return true if user has the role', () => {
      // Execute
      const result = hasRole(adminUser, 'administrator');
      
      // Assert
      expect(result).toBe(true);
    });
    
    it('should return false if user does not have the role', () => {
      // Execute
      const result = hasRole(regularUser, 'administrator');
      
      // Assert
      expect(result).toBe(false);
    });
    
    it('should return false if user has no roles', () => {
      // Execute
      const result = hasRole({ ...regularUser, roles: undefined }, 'subscriber');
      
      // Assert
      expect(result).toBe(false);
    });
    
    it('should return false if user is null or undefined', () => {
      // Execute
      const result1 = hasRole(null as any, 'administrator');
      const result2 = hasRole(undefined as any, 'administrator');
      
      // Assert
      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });
  });
  
  describe('hasCapability', () => {
    it('should return true if user has the capability', () => {
      // Execute
      const result = hasCapability(adminUser, 'manage_options');
      
      // Assert
      expect(result).toBe(true);
    });
    
    it('should return false if user does not have the capability', () => {
      // Execute
      const result = hasCapability(regularUser, 'manage_options');
      
      // Assert
      expect(result).toBe(false);
    });
    
    it('should return false if user has no capabilities', () => {
      // Execute
      const result = hasCapability({ ...regularUser, capabilities: undefined }, 'manage_options');
      
      // Assert
      expect(result).toBe(false);
    });
    
    it('should return false if user is null or undefined', () => {
      // Execute
      const result1 = hasCapability(null as any, 'manage_options');
      const result2 = hasCapability(undefined as any, 'manage_options');
      
      // Assert
      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });
  });
  
  describe('isAdmin', () => {
    it('should return true if user has administrator role', () => {
      // Execute
      const result = isAdmin(adminUser);
      
      // Assert
      expect(result).toBe(true);
    });
    
    it('should return true if user has manage_options capability', () => {
      // Execute
      const result = isAdmin({
        ...regularUser,
        roles: [],
        capabilities: { manage_options: true }
      });
      
      // Assert
      expect(result).toBe(true);
    });
    
    it('should return true if user has admin user type', () => {
      // Execute
      const result = isAdmin({
        ...regularUser,
        roles: [],
        capabilities: {},
        user_type: 'admin'
      });
      
      // Assert
      expect(result).toBe(true);
    });
    
    it('should return false if user is not an admin', () => {
      // Execute
      const result = isAdmin(regularUser);
      
      // Assert
      expect(result).toBe(false);
    });
    
    it('should return false if user is null or undefined', () => {
      // Execute
      const result1 = isAdmin(null as any);
      const result2 = isAdmin(undefined as any);
      
      // Assert
      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });
  });
  
  describe('ensureHasRole', () => {
    it('should not throw an error if user has the role', () => {
      // Execute and assert
      expect(() => ensureHasRole(adminUser, 'administrator')).not.toThrow();
    });
    
    it('should throw an error if user does not have the role', () => {
      // Execute and assert
      expect(() => ensureHasRole(regularUser, 'administrator')).toThrow();
    });
  });
  
  describe('ensureHasCapability', () => {
    it('should not throw an error if user has the capability', () => {
      // Execute and assert
      expect(() => ensureHasCapability(adminUser, 'manage_options')).not.toThrow();
    });
    
    it('should throw an error if user does not have the capability', () => {
      // Execute and assert
      expect(() => ensureHasCapability(regularUser, 'manage_options')).toThrow();
    });
  });
  
  describe('ensureIsAdmin', () => {
    it('should not throw an error if user is an admin', () => {
      // Execute and assert
      expect(() => ensureIsAdmin(adminUser)).not.toThrow();
    });
    
    it('should throw an error if user is not an admin', () => {
      // Execute and assert
      expect(() => ensureIsAdmin(regularUser)).toThrow();
    });
  });
  
  describe('ensureResourceAccess', () => {
    it('should not throw an error if user is the owner of the resource', () => {
      // Execute and assert
      expect(() => ensureResourceAccess(regularUser, regularUser.id)).not.toThrow();
    });
    
    it('should not throw an error if user is an admin', () => {
      // Execute and assert
      expect(() => ensureResourceAccess(adminUser, regularUser.id)).not.toThrow();
    });
    
    it('should throw an error if user is not the owner and not an admin', () => {
      // Execute and assert
      expect(() => ensureResourceAccess(regularUser, adminUser.id)).toThrow();
    });
    
    it('should handle string IDs correctly', () => {
      // Execute and assert
      expect(() => ensureResourceAccess(regularUser, String(regularUser.id))).not.toThrow();
      expect(() => ensureResourceAccess(regularUser, String(adminUser.id))).toThrow();
    });
  });
  
  describe('getRoleForUserType', () => {
    it('should return the correct role for a user type', () => {
      // Execute
      const adminRole = getRoleForUserType('admin');
      const userRole = getRoleForUserType('user');
      const fdRole = getRoleForUserType('funeral_director');
      
      // Assert
      expect(adminRole).toBe('administrator');
      expect(userRole).toBe('subscriber');
      expect(fdRole).toBe('funeral_director');
    });
    
    it('should return subscriber for unknown user types', () => {
      // Execute
      const role = getRoleForUserType('unknown');
      
      // Assert
      expect(role).toBe('subscriber');
    });
  });
});
