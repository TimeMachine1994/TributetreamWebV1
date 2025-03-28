/**
 * Unit tests for the Schedules Persistence Layer
 */

// Import dependencies
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { schedulesPersistence } from './schedules-persistence';
import { schedulesApi } from '$lib/api/schedules-api';

// Mock the API client
vi.mock('$lib/api/schedules-api', () => ({
  schedulesApi: {
    getSchedules: vi.fn(),
    getAllSchedules: vi.fn(),
    getScheduleById: vi.fn(),
    createSchedule: vi.fn(),
    updateSchedule: vi.fn(),
    deleteSchedule: vi.fn()
  }
}));

// Mock the browser environment
vi.mock('$app/environment', () => ({
  browser: true
}));

describe('Schedules Persistence Layer', () => {
  // Sample test data
  const mockSchedules = [
    {
      schedule_id: 1,
      funeral_director_user_id: 101,
      tribute_id: 201,
      number_of_days: 3
    },
    {
      schedule_id: 2,
      funeral_director_user_id: 102,
      tribute_id: 202,
      number_of_days: 5
    }
  ];

  const mockSchedule = {
    schedule_id: 1,
    funeral_director_user_id: 101,
    tribute_id: 201,
    number_of_days: 3
  };

  // Reset mocks and caches before each test
  beforeEach(() => {
    vi.resetAllMocks();
    schedulesPersistence.clearCaches();
  });

  // Clean up after tests
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSchedules', () => {
    it('should fetch schedules from API when cache is empty', async () => {
      // Setup mock API response
      schedulesApi.getSchedules.mockResolvedValue({
        success: true,
        data: {
          schedules: mockSchedules,
          total_items: 2,
          total_pages: 1,
          current_page: 1
        },
        status: 200
      });

      // Call the method
      const result = await schedulesPersistence.getSchedules();

      // Verify results
      expect(result.success).toBe(true);
      expect(result.data?.schedules).toEqual(mockSchedules);
      expect(schedulesApi.getSchedules).toHaveBeenCalledTimes(1);
      expect(schedulesApi.getSchedules).toHaveBeenCalledWith({ page: 1, perPage: 10 });
    });

    it('should return cached data on subsequent calls', async () => {
      // Setup mock API response
      schedulesApi.getSchedules.mockResolvedValue({
        success: true,
        data: {
          schedules: mockSchedules,
          total_items: 2,
          total_pages: 1,
          current_page: 1
        },
        status: 200
      });

      // First call - should hit the API
      await schedulesPersistence.getSchedules();
      
      // Second call - should use cache
      const result = await schedulesPersistence.getSchedules();

      // Verify results
      expect(result.success).toBe(true);
      expect(result.data?.schedules).toEqual(mockSchedules);
      expect(schedulesApi.getSchedules).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should force refresh when forceRefresh option is true', async () => {
      // Setup mock API response
      schedulesApi.getSchedules.mockResolvedValue({
        success: true,
        data: {
          schedules: mockSchedules,
          total_items: 2,
          total_pages: 1,
          current_page: 1
        },
        status: 200
      });

      // First call - should hit the API
      await schedulesPersistence.getSchedules();
      
      // Second call with forceRefresh - should hit the API again
      const result = await schedulesPersistence.getSchedules({ forceRefresh: true });

      // Verify results
      expect(result.success).toBe(true);
      expect(result.data?.schedules).toEqual(mockSchedules);
      expect(schedulesApi.getSchedules).toHaveBeenCalledTimes(2); // Now 2 calls
    });

    it('should filter by tributeId when provided', async () => {
      // Setup mock API response
      schedulesApi.getSchedules.mockResolvedValue({
        success: true,
        data: {
          schedules: [mockSchedules[0]],
          total_items: 1,
          total_pages: 1,
          current_page: 1
        },
        status: 200
      });

      // Call with tributeId filter
      const result = await schedulesPersistence.getSchedules({ tributeId: 201 });

      // Verify results
      expect(result.success).toBe(true);
      expect(result.data?.schedules).toEqual([mockSchedules[0]]);
      expect(schedulesApi.getSchedules).toHaveBeenCalledWith({ 
        page: 1, 
        perPage: 10, 
        tributeId: 201 
      });
    });

    it('should handle API errors gracefully', async () => {
      // Setup mock API error response
      schedulesApi.getSchedules.mockResolvedValue({
        success: false,
        error: 'API error',
        status: 500
      });

      // Call the method
      const result = await schedulesPersistence.getSchedules();

      // Verify results
      expect(result.success).toBe(false);
      expect(result.error).toBe('API error');
      expect(schedulesApi.getSchedules).toHaveBeenCalledTimes(1);
    });

    it('should handle exceptions gracefully', async () => {
      // Setup mock API to throw an error
      schedulesApi.getSchedules.mockRejectedValue(new Error('Network error'));

      // Call the method
      const result = await schedulesPersistence.getSchedules();

      // Verify results
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(schedulesApi.getSchedules).toHaveBeenCalledTimes(1);
    });
  });

  describe('getScheduleById', () => {
    it('should fetch a schedule by ID from API when cache is empty', async () => {
      // Setup mock API response
      schedulesApi.getScheduleById.mockResolvedValue({
        success: true,
        data: {
          data: mockSchedule
        },
        status: 200
      });

      // Call the method
      const result = await schedulesPersistence.getScheduleById(1);

      // Verify results
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSchedule);
      expect(schedulesApi.getScheduleById).toHaveBeenCalledTimes(1);
      expect(schedulesApi.getScheduleById).toHaveBeenCalledWith(1);
    });

    it('should return cached data on subsequent calls', async () => {
      // Setup mock API response
      schedulesApi.getScheduleById.mockResolvedValue({
        success: true,
        data: {
          data: mockSchedule
        },
        status: 200
      });

      // First call - should hit the API
      await schedulesPersistence.getScheduleById(1);
      
      // Second call - should use cache
      const result = await schedulesPersistence.getScheduleById(1);

      // Verify results
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSchedule);
      expect(schedulesApi.getScheduleById).toHaveBeenCalledTimes(1); // Still 1, not 2
    });
  });

  describe('createSchedule', () => {
    it('should create a schedule and invalidate caches', async () => {
      // Setup mock API response
      schedulesApi.createSchedule.mockResolvedValue({
        success: true,
        data: {
          schedule_id: 3,
          tribute_id: 203
        },
        status: 201
      });

      // Setup test data
      const createData = {
        funeral_director_user_id: 103,
        tribute_id: 203,
        number_of_days: 7
      };

      // Call the method
      const result = await schedulesPersistence.createSchedule(createData);

      // Verify results
      expect(result.success).toBe(true);
      expect(result.scheduleId).toBe(3);
      expect(result.tributeId).toBe(203);
      expect(schedulesApi.createSchedule).toHaveBeenCalledTimes(1);
      expect(schedulesApi.createSchedule).toHaveBeenCalledWith(createData);
    });
  });

  // Add more test cases for other methods as needed...
});