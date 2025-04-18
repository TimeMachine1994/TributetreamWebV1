import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseApiClient } from './base-api.client';
import { ApiError, AuthError } from '$lib/utils/error-handlers';

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as unknown as typeof fetch;

describe('BaseApiClient', () => {
  let client: BaseApiClient;
  
  beforeEach(() => {
    client = new BaseApiClient('https://example.com/wp-json', 'funeral/v2');
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  describe('get method', () => {
    it('should make a GET request with the correct URL', async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: { id: 1 } })
      });
      
      // Make the request
      const result = await client.get('tribute-pages');
      
      // Check that fetch was called correctly
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/wp-json/funeral/v2/tribute-pages',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
          headers: expect.any(Headers)
        })
      );
      
      // Check the result
      expect(result).toEqual({ success: true, data: { id: 1 } });
    });
    
    it('should add query parameters to the URL', async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true })
      });
      
      // Make the request with query parameters
      await client.get('tribute-pages', { page: 1, per_page: 10, search: 'test' });
      
      // Check that fetch was called with the correct URL including query parameters
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/^https:\/\/example\.com\/wp-json\/funeral\/v2\/tribute-pages\?/),
        expect.any(Object)
      );
      
      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('page=1');
      expect(url).toContain('per_page=10');
      expect(url).toContain('search=test');
    });
    
    it('should handle error responses', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ code: 'not_found', message: 'Not found' })
      });
      
      // Make the request and expect it to throw
      await expect(client.get('tribute-pages/999')).rejects.toThrow(ApiError);
      
      // Check that the error has the correct properties
      try {
        await client.get('tribute-pages/999');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError).toBeInstanceOf(ApiError);
        expect(apiError.message).toBe('Not found');
        expect(apiError.status).toBe(404);
        expect(apiError.data).toEqual({ code: 'not_found', message: 'Not found' });
      }
    });
    
    it('should handle authentication errors', async () => {
      // Mock authentication error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ code: 'jwt_auth_invalid_token', message: 'Invalid token' })
      });
      
      // Make the request and expect it to throw an AuthError
      await expect(client.get('tribute-pages')).rejects.toThrow(AuthError);
    });
  });
  
  describe('post method', () => {
    it('should make a POST request with the correct body', async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: { id: 1 } })
      });
      
      // Data to send
      const data = { name: 'Test', description: 'Test description' };
      
      // Make the request
      const result = await client.post('tribute-pages', data);
      
      // Check that fetch was called correctly
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/wp-json/funeral/v2/tribute-pages',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
          credentials: 'include',
          headers: expect.any(Headers)
        })
      );
      
      // Check the result
      expect(result).toEqual({ success: true, data: { id: 1 } });
    });
  });
  
  // Additional tests for put, patch, delete methods would follow a similar pattern
});