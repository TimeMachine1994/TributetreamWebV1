/**
 * Unit tests for the user by ID API endpoints
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET, PUT, DELETE } from '../../../../../src/routes/api/v2/users/[id]/+server';
import type { RequestEvent } from '@sveltejs/kit';
import { 
  createMockAdminUser, 
  createMockRegularUser, 
  createMockCookies, 
  mockWpApiClient, 
  resetMocks, 
  setupAuthMocks 
} from '../setup';
import { ApiErrors } from '../../../../../src/routes/api/v2/utils/error-handler';

// Create a mock type for the RequestEvent to avoid TypeScript errors
type MockRequestEvent = Partial<RequestEvent<Record<string, string>, string>>;

// Disable ESLint for specific lines where we need to use 'any'
/* eslint-disable @typescript-eslint/no-explicit-any */

describe('User by ID API Endpoints', () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  // Clean up after each test
  afterEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  describe('GET /api/v2/users/:id', () => {
    it('should return a user by ID when authenticated as admin', async () => {
      // Setup
      const adminUser = createMockAdminUser();
      await setupAuthMocks(adminUser);
      
      const mockUser = {
        id: 2,
        username: 'user',
        email: 'user@example.com',
        name: 'Regular User'
      };
      
      // Mock WordPress API response
      mockWpApiClient.get.mockResolvedValueOnce(mockUser);
      mockWpApiClient.get.mockResolvedValueOnce({ roles: ['subscriber'], capabilities: {} });
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users/2'),
        cookies: createMockCookies(),
        params: { id: '2' }
      };
      
      // Execute
      const response = await GET(request as any);
      const responseData = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.id).toBe(2);
      expect(responseData.data.username).toBe('user');
      expect(responseData.data.email).toBe('user@example.com');
      expect(mockWpApiClient.get).toHaveBeenCalledWith('wp/v2/users/2', expect.any(Boolean));
    });
    
    it('should throw an error when user is not found', async () => {
      // Setup
      const adminUser = createMockAdminUser();
      await setupAuthMocks(adminUser);
      
      // Mock WordPress API response to throw a not found error
      mockWpApiClient.get.mockRejectedValueOnce(ApiErrors.notFound('User'));
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users/999'),
        cookies: createMockCookies(),
        params: { id: '999' }
      };
      
      // Execute and assert
      await expect(GET(request as any)).rejects.toThrow();
    });
    
    it('should throw an error when not authenticated', async () => {
      // Setup
      const { ensureAuthenticatedUser } = await import('../../../../../src/routes/api/v2/utils/auth-utils');
      (ensureAuthenticatedUser as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw ApiErrors.unauthorized();
      });
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users/2'),
        cookies: createMockCookies(),
        params: { id: '2' }
      };
      
      // Execute and assert
      await expect(GET(request as any)).rejects.toThrow();
    });
    
    it('should throw an error when authenticated as non-admin', async () => {
      // Setup
      const regularUser = createMockRegularUser();
      await setupAuthMocks(regularUser);
      
      const { ensureIsAdmin } = await import('../../../../../src/routes/api/v2/utils/auth-utils');
      (ensureIsAdmin as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw ApiErrors.forbidden();
      });
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users/2'),
        cookies: createMockCookies(),
        params: { id: '2' }
      };
      
      // Execute and assert
      await expect(GET(request as any)).rejects.toThrow();
    });
  });

  describe('PUT /api/v2/users/:id', () => {
    it('should update a user when authenticated as admin', async () => {
      // Setup
      const adminUser = createMockAdminUser();
      await setupAuthMocks(adminUser);
      
      const updateUserData = {
        email: 'updated@example.com',
        name: 'Updated User',
        first_name: 'Updated',
        last_name: 'User'
      };
      
      const updatedUser = {
        id: 2,
        username: 'user',
        email: 'updated@example.com',
        name: 'Updated User',
        first_name: 'Updated',
        last_name: 'User'
      };
      
      // Mock WordPress API response
      mockWpApiClient.put.mockResolvedValueOnce(updatedUser);
      mockWpApiClient.get.mockResolvedValueOnce({ roles: ['subscriber'], capabilities: {} });
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users/2'),
        cookies: createMockCookies(),
        params: { id: '2' },
        request: {
          json: async () => updateUserData
        } as Request
      };
      
      // Execute
      const response = await PUT(request as any);
      const responseData = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.id).toBe(2);
      expect(responseData.data.email).toBe('updated@example.com');
      expect(responseData.data.name).toBe('Updated User');
      expect(mockWpApiClient.put).toHaveBeenCalledWith(
        'wp/v2/users/2',
        expect.objectContaining({
          email: 'updated@example.com',
          name: 'Updated User'
        }),
        expect.any(Boolean)
      );
    });
    
    it('should validate email format when updating', async () => {
      // Setup
      const adminUser = createMockAdminUser();
      await setupAuthMocks(adminUser);
      
      const invalidEmailData = {
        email: 'invalid-email'
      };
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users/2'),
        cookies: createMockCookies(),
        params: { id: '2' },
        request: {
          json: async () => invalidEmailData
        } as Request
      };
      
      // Execute and assert
      await expect(PUT(request as any)).rejects.toThrow();
    });
    
    it('should throw an error when user is not found', async () => {
      // Setup
      const adminUser = createMockAdminUser();
      await setupAuthMocks(adminUser);
      
      const updateUserData = {
        email: 'updated@example.com'
      };
      
      // Mock WordPress API response to throw a not found error
      mockWpApiClient.put.mockRejectedValueOnce(ApiErrors.notFound('User'));
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users/999'),
        cookies: createMockCookies(),
        params: { id: '999' },
        request: {
          json: async () => updateUserData
        } as Request
      };
      
      // Execute and assert
      await expect(PUT(request as any)).rejects.toThrow();
    });
    
    it('should throw an error when not authenticated as admin', async () => {
      // Setup
      const regularUser = createMockRegularUser();
      await setupAuthMocks(regularUser);
      
      const { ensureIsAdmin } = await import('../../../../../src/routes/api/v2/utils/auth-utils');
      (ensureIsAdmin as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw ApiErrors.forbidden();
      });
      
      const updateUserData = {
        email: 'updated@example.com'
      };
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users/2'),
        cookies: createMockCookies(),
        params: { id: '2' },
        request: {
          json: async () => updateUserData
        } as Request
      };
      
      // Execute and assert
      await expect(PUT(request as any)).rejects.toThrow();
    });
  });

  describe('DELETE /api/v2/users/:id', () => {
    it('should delete a user when authenticated as admin', async () => {
      // Setup
      const adminUser = createMockAdminUser();
      await setupAuthMocks(adminUser);
      
      // Mock WordPress API response
      mockWpApiClient.delete.mockResolvedValueOnce({ deleted: true, id: 2 });
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users/2'),
        cookies: createMockCookies(),
        params: { id: '2' }
      };
      
      // Execute
      const response = await DELETE(request as any);
      const responseData = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.id).toBe('2');
      expect(mockWpApiClient.delete).toHaveBeenCalledWith('wp/v2/users/2', expect.any(Boolean));
    });
    
    it('should throw an error when user is not found', async () => {
      // Setup
      const adminUser = createMockAdminUser();
      await setupAuthMocks(adminUser);
      
      // Mock WordPress API response to throw a not found error
      mockWpApiClient.delete.mockRejectedValueOnce(ApiErrors.notFound('User'));
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users/999'),
        cookies: createMockCookies(),
        params: { id: '999' }
      };
      
      // Execute and assert
      await expect(DELETE(request as any)).rejects.toThrow();
    });
    
    it('should throw an error when not authenticated', async () => {
      // Setup
      const { ensureAuthenticatedUser } = await import('../../../../../src/routes/api/v2/utils/auth-utils');
      (ensureAuthenticatedUser as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw ApiErrors.unauthorized();
      });
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users/2'),
        cookies: createMockCookies(),
        params: { id: '2' }
      };
      
      // Execute and assert
      await expect(DELETE(request as any)).rejects.toThrow();
    });
    
    it('should throw an error when authenticated as non-admin', async () => {
      // Setup
      const regularUser = createMockRegularUser();
      await setupAuthMocks(regularUser);
      
      const { ensureIsAdmin } = await import('../../../../../src/routes/api/v2/utils/auth-utils');
      (ensureIsAdmin as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw ApiErrors.forbidden();
      });
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users/2'),
        cookies: createMockCookies(),
        params: { id: '2' }
      };
      
      // Execute and assert
      await expect(DELETE(request as any)).rejects.toThrow();
    });
  });
});
