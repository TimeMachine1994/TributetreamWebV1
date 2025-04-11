import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from '../+page.server';
import { fail, redirect } from '@sveltejs/kit';

// Mock dependencies
vi.mock('$lib/utils/auth-helpers', () => ({
  generateSecurePassword: vi.fn(() => 'secure-password-123'),
  setAuthCookies: vi.fn()
}));

vi.mock('$lib/utils/form-validation', () => ({
  validateFuneralDirectorForm: vi.fn()
}));

vi.mock('$lib/utils/string-helpers', () => ({
  createTributeSlug: vi.fn((name) => `${name.toLowerCase().replace(/\s+/g, '-')}`)
}));

vi.mock('$lib/server/wp-user-service', () => ({
  registerWordPressUser: vi.fn()
}));

// Import mocked functions for assertions
import { validateFuneralDirectorForm } from '$lib/utils/form-validation';
import { registerWordPressUser } from '$lib/server/wp-user-service';
import { createTributeSlug } from '$lib/utils/string-helpers';

describe('Funeral Director Form Actions', () => {
  let mockFormData: FormData;
  let mockFetch: any;
  let mockCookies: any;
  let mockRequest: any;
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup mock FormData
    mockFormData = new FormData();
    mockFormData.append('director-first-name', 'John');
    mockFormData.append('director-last-name', 'Doe');
    mockFormData.append('deceased-first-name', 'Jane');
    mockFormData.append('deceased-last-name', 'Smith');
    mockFormData.append('email-address', 'test@example.com');
    mockFormData.append('phone-number', '123-456-7890');
    
    // Setup mock fetch
    mockFetch = vi.fn().mockImplementation((url, options) => {
      if (url === '/api/auth') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'mock-jwt-token',
            user_id: 123,
            user_display_name: 'Test User'
          })
        });
      }
      
      if (url === 'https://wp.tributestream.com/wp-json/tributestream/v1/user-meta') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      
      if (url === 'https://wp.tributestream.com/wp-json/tributestream/v1/tributes') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            tribute_id: 456,
            slug: 'jane-smith'
          })
        });
      }
      
      if (url === '/api/send-email') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Unknown endpoint' })
      });
    });
    
    // Setup mock cookies
    mockCookies = {
      set: vi.fn()
    };
    
    // Setup mock request
    mockRequest = {
      formData: () => Promise.resolve(mockFormData),
      headers: new Map([['x-forwarded-for', '127.0.0.1']])
    };
    
    // Setup validation mock
    vi.mocked(validateFuneralDirectorForm).mockReturnValue({
      isValid: true,
      errors: []
    });
    
    // Setup registration mock
    vi.mocked(registerWordPressUser).mockResolvedValue({
      success: true,
      userId: 123
    });
    
    // Setup slug creation mock
    vi.mocked(createTributeSlug).mockReturnValue('jane-smith');
  });
  
  it('should validate form data and return errors if invalid', async () => {
    // Setup validation to fail
    vi.mocked(validateFuneralDirectorForm).mockReturnValue({
      isValid: false,
      errors: ['Email address is required']
    });
    
    const result = await actions.default({
      request: mockRequest,
      fetch: mockFetch,
      cookies: mockCookies
    } as any);
    
    expect(result).toHaveProperty('error', true);
    expect(result).toHaveProperty('message');
    expect(result.message).toContain('Email address is required');
  });
  
  it('should register a user and create a tribute on successful form submission', async () => {
    try {
      await actions.default({
        request: mockRequest,
        fetch: mockFetch,
        cookies: mockCookies
      } as any);
      
      // This should not be reached due to the redirect
      expect(true).toBe(false);
    } catch (error) {
      // Expect a redirect to the tribute page
      expect(error).toHaveProperty('status', 303);
      expect(error).toHaveProperty('location', '/celebration-of-life-for-jane-smith');
    }
    
    // Verify user registration was called
    expect(registerWordPressUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      username: 'test@example.com',
      password: 'secure-password-123'
    });
    
    // Verify authentication was attempted
    expect(mockFetch).toHaveBeenCalledWith('/api/auth', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String)
    }));
    
    // Verify cookies were set
    expect(mockCookies.set).toHaveBeenCalledWith('jwt_token', 'mock-jwt-token', expect.any(Object));
    expect(mockCookies.set).toHaveBeenCalledWith('user', expect.any(String), expect.any(Object));
    
    // Verify tribute creation was attempted
    expect(mockFetch).toHaveBeenCalledWith('https://wp.tributestream.com/wp-json/tributestream/v1/tributes', 
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-jwt-token'
        }),
        body: expect.stringContaining('jane-smith')
      })
    );
  });
  
  it('should handle duplicate user registration gracefully', async () => {
    // Setup registration to return duplicate user
    vi.mocked(registerWordPressUser).mockResolvedValue({
      success: false,
      isDuplicate: true,
      message: 'User already exists'
    });
    
    try {
      await actions.default({
        request: mockRequest,
        fetch: mockFetch,
        cookies: mockCookies
      } as any);
      
      // This should not be reached due to the redirect
      expect(true).toBe(false);
    } catch (error) {
      // Expect a redirect to the tribute page even with duplicate user
      expect(error).toHaveProperty('status', 303);
      expect(error).toHaveProperty('location', '/celebration-of-life-for-jane-smith');
    }
  });
  
  it('should return partial success when tribute creation fails', async () => {
    // Setup tribute creation to fail
    mockFetch.mockImplementation((url) => {
      if (url === '/api/auth') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'mock-jwt-token',
            user_id: 123,
            user_display_name: 'Test User'
          })
        });
      }
      
      if (url === 'https://wp.tributestream.com/wp-json/tributestream/v1/tributes') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Failed to create tribute' })
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    });
    
    const result = await actions.default({
      request: mockRequest,
      fetch: mockFetch,
      cookies: mockCookies
    } as any);
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('isPartialSuccess', true);
    expect(result.message).toContain('Our team will contact you shortly');
  });
  
  it('should handle unexpected errors gracefully', async () => {
    // Setup fetch to throw an error
    mockFetch.mockImplementation(() => {
      throw new Error('Network error');
    });
    
    const result = await actions.default({
      request: mockRequest,
      fetch: mockFetch,
      cookies: mockCookies
    } as any);
    
    expect(result).toHaveProperty('error', true);
    expect(result.message).toContain('unexpected error occurred');
  });
});