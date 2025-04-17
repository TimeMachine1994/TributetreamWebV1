/**
 * Test setup for API v2 unit tests
 */
import { vi } from 'vitest';
import type { User } from '../../../../src/routes/api/v2/types/users';
import type { Cookies } from '@sveltejs/kit';

/**
 * Mock WordPress API client
 */
export const mockWpApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn()
};

/**
 * Mock createWpApiClient function
 */
export const mockCreateWpApiClient = vi.fn().mockReturnValue(mockWpApiClient);

/**
 * Mock the utils module
 */
vi.mock('../../../../src/routes/api/v2/utils', async () => {
  const actual = await vi.importActual('../../../../src/routes/api/v2/utils');
  return {
    ...actual,
    createWpApiClient: mockCreateWpApiClient
  };
});

/**
 * Mock the auth-utils module
 */
vi.mock('../../../../src/routes/api/v2/utils/auth-utils', async () => {
  const actual = await vi.importActual('../../../../src/routes/api/v2/utils/auth-utils');
  return {
    ...actual,
    ensureAuthenticatedUser: vi.fn(),
    ensureAuthenticated: vi.fn(),
    ensureIsAdmin: vi.fn(),
    ensureResourceAccess: vi.fn(),
    getUserFromCookie: vi.fn(),
    getTokenFromCookie: vi.fn()
  };
});

/**
 * Create a mock admin user
 */
export function createMockAdminUser(): User {
  return {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    name: 'Admin User',
    display_name: 'Admin User',
    first_name: 'Admin',
    last_name: 'User',
    roles: ['administrator'],
    capabilities: {
      manage_options: true
    },
    user_type: 'admin',
    registered_date: '2023-01-01T00:00:00.000Z'
  };
}

/**
 * Create a mock regular user
 */
export function createMockRegularUser(): User {
  return {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    name: 'Regular User',
    display_name: 'Regular User',
    first_name: 'Regular',
    last_name: 'User',
    roles: ['subscriber'],
    capabilities: {},
    user_type: 'user',
    registered_date: '2023-01-01T00:00:00.000Z'
  };
}

/**
 * Create a mock funeral director user
 */
export function createMockFuneralDirectorUser(): User {
  return {
    id: 3,
    username: 'funeral_director',
    email: 'fd@example.com',
    name: 'Funeral Director',
    display_name: 'Funeral Director',
    first_name: 'Funeral',
    last_name: 'Director',
    roles: ['funeral_director'],
    capabilities: {
      manage_tributes: true
    },
    user_type: 'funeral_director',
    registered_date: '2023-01-01T00:00:00.000Z'
  };
}

/**
 * Mock cookies object
 */
export function createMockCookies(): Cookies {
  const cookies = new Map<string, string>();
  
  return {
    get: vi.fn((key: string) => cookies.get(key) || null),
    set: vi.fn((key: string, value: string) => cookies.set(key, value)),
    delete: vi.fn((key: string) => cookies.delete(key))
  } as unknown as Cookies;
}

/**
 * Setup authentication mocks
 * @param user The user to authenticate
 * @param token The JWT token
 */
export async function setupAuthMocks(user: User, token: string = 'mock-jwt-token') {
  // Import the mocked functions
  const authUtils = vi.mocked(await import('../../../../src/routes/api/v2/utils/auth-utils'));
  
  // Setup the mock return value
  authUtils.ensureAuthenticatedUser.mockReturnValue({ user, token });
  
  return { user, token };
}

/**
 * Reset all mocks
 */
export function resetMocks() {
  vi.resetAllMocks();
  
  // Reset WordPress API client mocks
  mockWpApiClient.get.mockReset();
  mockWpApiClient.post.mockReset();
  mockWpApiClient.put.mockReset();
  mockWpApiClient.patch.mockReset();
  mockWpApiClient.delete.mockReset();
  
  // Reset createWpApiClient mock
  mockCreateWpApiClient.mockReturnValue(mockWpApiClient);
}
