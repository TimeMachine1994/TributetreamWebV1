import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryManager, type PoolConfig } from './MemoryManager';

// Mock window APIs
const mockWindow = {
    setInterval: vi.fn(),
    clearInterval: vi.fn(),
    performance: {
        memory: {
            usedJSHeapSize: 1000000,
            totalJSHeapSize: 2000000
        }
    },
    Date: {
        now: vi.fn()
    }
};

describe('MemoryManager', () => {
    let manager: MemoryManager;
    let config: Partial<PoolConfig>;
    let currentTime: number;

    beforeEach(() => {
        // Setup window mocks
        vi.stubGlobal('window', mockWindow);
        currentTime = 0;
        vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

        config = {
            maxSize: 10,
            initialSize: 5,
            growthFactor: 1.5
        };

        manager = new MemoryManager(config);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        manager.destroy();
    });

    it('initializes with default pools', () => {
        const stats = manager.getMemoryStats();
        expect(stats.poolSize).toBeGreaterThan(0);
        expect(stats.cacheSize).toBe(0);
    });

    it('acquires and releases objects from pool', () => {
        const point = manager.acquire('point', () => ({ x: 0, y: 0 }));
        expect(point).toEqual({ x: 0, y: 0 });

        manager.release('point', point);
        const nextPoint = manager.acquire('point', () => ({ x: 1, y: 1 }));
        expect(nextPoint).toEqual({ x: 0, y: 0 }); // Should get recycled object
    });

    it('creates new objects when pool is empty', () => {
        const factory = vi.fn(() => ({ x: 1, y: 1 }));
        const point = manager.acquire('newType', factory);
        
        expect(factory).toHaveBeenCalled();
        expect(point).toEqual({ x: 1, y: 1 });
    });

    it('respects pool size limits', () => {
        const objects = [];
        for (let i = 0; i < config.maxSize! + 5; i++) {
            objects.push(manager.acquire('point', () => ({ x: i, y: i })));
        }

        // Release all objects
        objects.forEach(obj => manager.release('point', obj));

        const stats = manager.getMemoryStats();
        expect(stats.poolSize).toBeLessThanOrEqual(config.maxSize!);
    });

    it('caches and retrieves resources', () => {
        const data = { test: 'data' };
        manager.cacheResource('test', data);

        const retrieved = manager.getCachedResource('test');
        expect(retrieved).toEqual(data);
    });

    it('updates last accessed time on cache retrieval', () => {
        const data = { test: 'data' };
        manager.cacheResource('test', data);

        currentTime = 1000;
        manager.getCachedResource('test');

        const cache = (manager as any).resourceCache;
        expect(cache.get('test').lastAccessed).toBe(1000);
    });

    it('cleans up old cached resources', () => {
        const data = { test: 'data' };
        manager.cacheResource('test', data);

        // Simulate time passing
        currentTime = (manager as any).constructor.CACHE_CLEANUP_INTERVAL * 3;
        
        // Trigger cleanup
        (manager as any).cleanupCache();

        expect(manager.getCachedResource('test')).toBeNull();
    });

    it('clears cache with pattern matching', () => {
        manager.cacheResource('test1', 'data1');
        manager.cacheResource('test2', 'data2');
        manager.cacheResource('other', 'data3');

        manager.clearCache(/test/);

        expect(manager.getCachedResource('test1')).toBeNull();
        expect(manager.getCachedResource('test2')).toBeNull();
        expect(manager.getCachedResource('other')).not.toBeNull();
    });

    it('shrinks pools when memory is tight', () => {
        // Fill pool to max size
        const objects = [];
        for (let i = 0; i < config.maxSize!; i++) {
            objects.push(manager.acquire('point', () => ({ x: i, y: i })));
        }
        objects.forEach(obj => manager.release('point', obj));

        // Simulate high memory usage
        vi.spyOn(manager as any, 'getMemoryStats').mockReturnValue({
            heapUsed: 1800000,
            heapTotal: 2000000,
            cacheSize: 0,
            poolSize: config.maxSize
        });

        // Trigger memory check
        (manager as any).checkMemoryUsage();

        const stats = manager.getMemoryStats();
        expect(stats.poolSize).toBeLessThan(config.maxSize!);
    });

    it('cleans up resources on destroy', () => {
        const intervalId = 123;
        (manager as any).cleanupInterval = intervalId;
        (manager as any).memoryCheckInterval = intervalId + 1;

        manager.destroy();

        expect(mockWindow.clearInterval).toHaveBeenCalledWith(intervalId);
        expect(mockWindow.clearInterval).toHaveBeenCalledWith(intervalId + 1);
        
        const stats = manager.getMemoryStats();
        expect(stats.poolSize).toBe(0);
        expect(stats.cacheSize).toBe(0);
    });
});
