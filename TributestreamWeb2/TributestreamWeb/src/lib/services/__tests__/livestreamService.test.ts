// src/services/__tests__/livestreamService.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LivestreamService, LivestreamData } from '../LivestreamService';
import fetch from 'node-fetch';

vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

const { Response } = fetch;

describe('LivestreamService', () => {
  let service: LivestreamService;

  beforeEach(() => {
    service = new LivestreamService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create a new livestream', async () => {
    console.log('Test started: should create a new livestream');

    const testData: LivestreamData = {
      title: 'Test Livestream',
      description: 'This is a test livestream',
      date: new Date(),
    };

    const mockApiResponse = {
      id: 'mock-id',
      ...testData,
    };

    // Mock the fetch response
    (fetch as unknown as jest.Mock).mockResolvedValueOnce(
      new Response(JSON.stringify(mockApiResponse), { status: 200 })
    );

    const newLivestream = await service.createLivestream(testData);

    console.log('Livestream creation result:', newLivestream);

    expect(newLivestream).toHaveProperty('id', 'mock-id');
    expect(newLivestream.title).toBe(testData.title);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors gracefully', async () => {
    console.log('Test started: should handle API errors gracefully');

    const testData: LivestreamData = {
      title: 'Test Livestream',
      date: new Date(),
    };

    // Mock an API error response
    (fetch as unknown as jest.Mock).mockResolvedValueOnce(
      new Response('Internal Server Error', { status: 500 })
    );

    await expect(service.createLivestream(testData)).rejects.toThrow(
      'Failed to create livestream'
    );

    console.log('API error handling tested successfully');
  });

  it('should throw an error for invalid input data', async () => {
    console.log('Test started: should throw an error for invalid input data');

    const invalidData = {
      title: '', // Invalid because title is required and must be at least 1 character
      date: 'invalid-date', // Invalid date format
    };

    await expect(service.createLivestream(invalidData as any)).rejects.toThrow();

    console.log('Invalid input handling tested successfully');
  });
});
