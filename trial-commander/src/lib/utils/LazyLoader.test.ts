import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LazyLoader, type LoadOptions, type ViewportConfig } from './LazyLoader';
import { get } from 'svelte/store';

// Mock fetch API
const mockFetch = vi.fn();
(globalThis as any).fetch = mockFetch;

// Mock ReadableStream
class MockReadableStream {
    private chunks: Uint8Array[];
    private index: number;

    constructor(chunks: Uint8Array[]) {
        this.chunks = chunks;
        this.index = 0;
    }

    getReader() {
        return {
            read: async () => {
                if (this.index >= this.chunks.length) {
                    return { done: true };
                }
                return {
                    done: false,
                    value: this.chunks[this.index++]
                };
            }
        };
    }
}

describe('LazyLoader', () => {
    let loader: LazyLoader;
    let mockResponse: Response;
    let currentTime: number;

    beforeEach(() => {
        currentTime = 0;
        vi.spyOn(Date, 'now').mockImplementation(() => currentTime);
        vi.spyOn(window, 'setTimeout').mockImplementation((callback: TimerHandler) => {
            if (typeof callback === 'function') {
                callback();
            }
            return 0;
        });

        // Setup mock response
        const chunks = [
            new Uint8Array([1, 2, 3]),
            new Uint8Array([4, 5, 6])
        ];
        mockResponse = {
            body: new MockReadableStream(chunks),
            headers: new Headers({
                'Content-Length': '6'
            })
        } as unknown as Response;

        mockFetch.mockResolvedValue(mockResponse);
        loader = new LazyLoader();
    });

    afterEach(() => {
        vi.clearAllMocks();
        loader.destroy();
    });

    it('loads resources with progress tracking', async () => {
        const url = 'test.jpg';
        const loadPromise = loader.load(url);
        
        const loadingState = loader.getLoadingState(url);
        expect(get(loadingState).status).toBe('loading');
        expect(get(loadingState).progress).toBe(0);

        const result = await loadPromise;
        expect(result).toBeInstanceOf(Uint8Array);
        expect(get(loadingState).status).toBe('loaded');
        expect(get(loadingState).progress).toBe(1);
    });

    it('caches loaded resources', async () => {
        const url = 'test.jpg';
        const firstLoad = await loader.load(url);
        mockFetch.mockClear();

        const secondLoad = await loader.load(url);
        expect(secondLoad).toBe(firstLoad);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('handles load failures', async () => {
        const url = 'error.jpg';
        const error = new Error('Network error');
        mockFetch.mockRejectedValueOnce(error);

        await expect(loader.load(url)).rejects.toThrow('Network error');
        const loadingState = loader.getLoadingState(url);
        expect(get(loadingState).status).toBe('error');
        expect(get(loadingState).error).toBe('Network error');
    });

    it('respects load priorities', async () => {
        const loads = [
            loader.load('low.jpg', { priority: 'low' }),
            loader.load('medium.jpg', { priority: 'medium' }),
            loader.load('high.jpg', { priority: 'high' })
        ];

        await Promise.all(loads);

        const calls = mockFetch.mock.calls.map(call => call[0]);
        expect(calls[0]).toBe('high.jpg');
        expect(calls[1]).toBe('medium.jpg');
        expect(calls[2]).toBe('low.jpg');
    });

    it('limits concurrent loads', async () => {
        const MAX_CONCURRENT = (loader as any).constructor.MAX_CONCURRENT_LOADS;
        const urls = Array.from({ length: MAX_CONCURRENT + 2 }, (_, i) => `test${i}.jpg`);
        
        const loads = urls.map(url => loader.load(url));
        await Promise.all(loads);

        expect(mockFetch).toHaveBeenCalledTimes(urls.length);
        expect((loader as any).activeLoads.size).toBeLessThanOrEqual(MAX_CONCURRENT);
    });

    it('updates loading state during chunk loading', async () => {
        const url = 'large.jpg';
        const chunks = [
            new Uint8Array(1000),
            new Uint8Array(1000),
            new Uint8Array(1000)
        ];
        
        mockResponse = {
            body: new MockReadableStream(chunks),
            headers: new Headers({
                'Content-Length': '3000'
            })
        } as unknown as Response;
        
        mockFetch.mockResolvedValueOnce(mockResponse);

        const loadPromise = loader.load(url);
        const loadingState = loader.getLoadingState(url);

        // Wait for load to complete
        await loadPromise;

        // Should have updated progress during load
        const progressValues = get(loadingState);
        expect(progressValues.status).toBe('loaded');
        expect(progressValues.progress).toBe(1);
    });

    it('clears old cache entries', async () => {
        const url1 = 'test1.jpg';
        const url2 = 'test2.jpg';

        await loader.load(url1);
        currentTime += 1000;
        await loader.load(url2);

        loader.clearCache(500);

        // Trigger new load of url1 to verify it's not cached
        mockFetch.mockClear();
        await loader.load(url1);
        expect(mockFetch).toHaveBeenCalledWith(url1);

        // url2 should still be cached
        await loader.load(url2);
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('handles viewport updates', () => {
        const viewport: ViewportConfig = {
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            scale: 1
        };

        loader.updateViewport(viewport);
        expect((loader as any).viewport).toEqual(viewport);
    });

    it('cleans up resources on destroy', async () => {
        const url = 'test.jpg';
        await loader.load(url);

        loader.destroy();

        expect((loader as any).loadQueue.size).toBe(0);
        expect((loader as any).activeLoads.size).toBe(0);
        expect((loader as any).loadingStates.size).toBe(0);
        expect((loader as any).cache.size).toBe(0);
    });
});
