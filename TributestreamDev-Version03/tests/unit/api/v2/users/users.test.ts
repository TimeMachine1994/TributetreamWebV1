/**
 * Unit tests for the users API endpoints
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET, POST } from '../../../../../src/routes/api/v2/users/+server';
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

describe('Users API Endpoints', () => {
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

  describe('GET /api/v2/users', () => {
    it('should return a list of users when authenticated as admin', async () => {
      // Setup
      const adminUser = createMockAdminUser();
      await setupAuthMocks(adminUser);
      
      const mockUsers = [
        { id: 1, username: 'admin', email: 'admin@example.com' },
        { id: 2, username: 'user', email: 'user@example.com' }
      ];
      
      // Mock WordPress API response
      mockWpApiClient.get.mockResolvedValueOnce(mockUsers);
      mockWpApiClient.get.mockResolvedValue({ roles: ['administrator'], capabilities: { manage_options: true } });
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users'),
        cookies: createMockCookies()
      };
      
      // Execute
      const response = await GET(request as any);
      const responseData = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveLength(2);
      expect(responseData.meta.pagination).toBeDefined();
      expect(mockWpApiClient.get).toHaveBeenCalledWith(expect.stringContaining('wp/v2/users'), expect.any(Boolean));
    });
    
    it('should handle query parameters correctly', async () => {
      // Setup
      const adminUser = createMockAdminUser();
      await setupAuthMocks(adminUser);
      
      // Mock WordPress API response
      mockWpApiClient.get.mockResolvedValueOnce([]);
      
      // Create request object with query parameters
      const url = new URL('http://localhost/api/v2/users');
      url.searchParams.set('page', '2');
      url.searchParams.set('per_page', '20');
      url.searchParams.set('search', 'test');
      url.searchParams.set('sort_by', 'username');
      url.searchParams.set('sort_order', 'asc');
      
      const request: MockRequestEvent = {
        url,
        cookies: createMockCookies()
      };
      
      // Execute
      await GET(request as any);
      
      // Assert
      expect(mockWpApiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/wp\/v2\/users\?.*page=2.*per_page=20.*search=test.*sort_by=username.*sort_order=asc/),
        expect.any(Boolean)
      );
    });
    
    it('should throw an error when not authenticated', async () => {
      // Setup
      const { ensureAuthenticatedUser } = await import('../../../../../src/routes/api/v2/utils/auth-utils');
      (ensureAuthenticatedUser as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw ApiErrors.unauthorized();
      });
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users'),
        cookies: createMockCookies()
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
        url: new URL('http://localhost/api/v2/users'),
        cookies: createMockCookies()
      };
      
      // Execute and assert
      await expect(GET(request as any)).rejects.toThrow();
    });
  });

  describe('POST /api/v2/users', () => {
    it('should create a new user when authenticated as admin', async () => {
      // Setup
      const adminUser = createMockAdminUser();
      await setupAuthMocks(adminUser);
      
      const newUserData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      };
      
      const createdUser = {
        id: 3,
        username: 'newuser',
        email: 'newuser@example.com',
        name: 'New User'
      };
      
      // Mock WordPress API response
      mockWpApiClient.post.mockResolvedValueOnce(createdUser);
      mockWpApiClient.get.mockResolvedValueOnce({ roles: ['subscriber'], capabilities: {} });
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users'),
        cookies: createMockCookies(),
        request: {
          json: async () => newUserData
        } as Request
      };
      
      // Execute
      const response = await POST(request as any);
      const responseData = await response.json();
      
      // Assert
      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.data.id).toBe(3);
      expect(responseData.data.username).toBe('newuser');
      expect(responseData.data.email).toBe('newuser@example.com');
      expect(mockWpApiClient.post).toHaveBeenCalledWith(
        'wp/v2/users',
        expect.objectContaining({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123'
        }),
        expect.any(Boolean)
      );
    });
    
    it('should validate required fields', async () => {
      // Setup
      const adminUser = createMockAdminUser();
      await setupAuthMocks(adminUser);
      
      const incompleteUserData = {
        username: 'newuser',
        // Missing email and password
      };
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users'),
        cookies: createMockCookies(),
        request: {
          json: async () => incompleteUserData
        } as Request
      };
      
      // Execute and assert
      await expect(POST(request as any)).rejects.toThrow();
    });
    
    it('should validate email format', async () => {
      // Setup
      const adminUser = createMockAdminUser();
      await setupAuthMocks(adminUser);
      
      const invalidEmailData = {
        username: 'newuser',
        email: 'invalid-email',
        password: 'password123'
      };
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users'),
        cookies: createMockCookies(),
        request: {
          json: async () => invalidEmailData
        } as Request
      };
      
      // Execute and assert
      await expect(POST(request as any)).rejects.toThrow();
    });
    
    it('should throw an error when not authenticated as admin', async () => {
      // Setup
      const regularUser = createMockRegularUser();
      await setupAuthMocks(regularUser);
      
      const { ensureIsAdmin } = await import('../../../../../src/routes/api/v2/utils/auth-utils');
      (ensureIsAdmin as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw ApiErrors.forbidden();
      });
      
      const newUserData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      };
      
      // Create request object
      const request: MockRequestEvent = {
        url: new URL('http://localhost/api/v2/users'),
        cookies: createMockCookies(),
        request: {
          json: async () => newUserData
        } as Request
      };
      
      // Execute and assert
      await expect(POST(request as any)).rejects.toThrow();
    });
  });
});
