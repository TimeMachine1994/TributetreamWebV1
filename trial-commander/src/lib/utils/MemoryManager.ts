import type { Layer, Annotation } from '../types';

export interface MemoryStats {
    heapUsed: number;
    heapTotal: number;
    cacheSize: number;
    poolSize: number;
}

export interface PoolConfig {
    maxSize: number;
    initialSize: number;
    growthFactor: number;
}

export class MemoryManager {
    private static readonly DEFAULT_POOL_CONFIG: PoolConfig = {
        maxSize: 1000,
        initialSize: 100,
        growthFactor: 1.5
    };

    private static readonly CACHE_CLEANUP_INTERVAL = 60000; // 1 minute
    private static readonly MEMORY_CHECK_INTERVAL = 30000; // 30 seconds
    private static readonly MEMORY_THRESHOLD = 0.9; // 90% of heap

    private objectPool: Map<string, any[]>;
    private resourceCache: Map<string, { data: any; lastAccessed: number }>;
    private cleanupInterval: number;
    private memoryCheckInterval: number;
    private poolConfig: PoolConfig;

    constructor(config: Partial<PoolConfig> = {}) {
        this.poolConfig = { ...MemoryManager.DEFAULT_POOL_CONFIG, ...config };
        this.objectPool = new Map();
        this.resourceCache = new Map();

        // Start cleanup intervals
        this.cleanupInterval = window.setInterval(
            () => this.cleanupCache(),
            MemoryManager.CACHE_CLEANUP_INTERVAL
        );

        this.memoryCheckInterval = window.setInterval(
            () => this.checkMemoryUsage(),
            MemoryManager.MEMORY_CHECK_INTERVAL
        );

        // Initialize object pools
        this.initializePools();
    }

    /**
     * Get memory usage statistics
     */
    getMemoryStats(): MemoryStats {
        // Chrome-specific memory API
        const heapStats = (performance as any).memory || { usedJSHeapSize: 0, totalJSHeapSize: 0 };
        
        return {
            heapUsed: heapStats.usedJSHeapSize,
            heapTotal: heapStats.totalJSHeapSize,
            cacheSize: this.resourceCache.size,
            poolSize: Array.from(this.objectPool.values()).reduce((sum, pool) => sum + pool.length, 0)
        };
    }

    /**
     * Get or create an object from the pool
     */
    acquire<T>(type: string, factory: () => T): T {
        const pool = this.objectPool.get(type);
        if (!pool || pool.length === 0) {
            return factory();
        }
        return pool.pop() as T;
    }

    /**
     * Return an object to the pool
     */
    release(type: string, obj: any): void {
        const pool = this.objectPool.get(type);
        if (!pool) {
            this.objectPool.set(type, [obj]);
            return;
        }

        if (pool.length < this.poolConfig.maxSize) {
            pool.push(obj);
        }
    }

    /**
     * Cache a resource with automatic cleanup
     */
    cacheResource(key: string, data: any): void {
        this.resourceCache.set(key, {
            data,
            lastAccessed: Date.now()
        });
    }

    /**
     * Get a cached resource
     */
    getCachedResource(key: string): any | null {
        const entry = this.resourceCache.get(key);
        if (!entry) return null;

        entry.lastAccessed = Date.now();
        return entry.data;
    }

    /**
     * Clear specific resources from cache
     */
    clearCache(pattern?: RegExp): void {
        if (!pattern) {
            this.resourceCache.clear();
            return;
        }

        for (const key of this.resourceCache.keys()) {
            if (pattern.test(key)) {
                this.resourceCache.delete(key);
            }
        }
    }

    /**
     * Initialize object pools
     */
    private initializePools(): void {
        // Initialize pools for common objects
        this.initializePool('point', () => ({ x: 0, y: 0 }));
        this.initializePool('annotation', () => ({
            id: '',
            type: 'drawing',
            points: [],
            style: {}
        }));
        this.initializePool('layer', () => ({
            id: '',
            name: '',
            visible: true,
            locked: false,
            annotations: []
        }));
    }

    /**
     * Initialize a specific object pool
     */
    private initializePool<T>(type: string, factory: () => T): void {
        const pool: T[] = [];
        for (let i = 0; i < this.poolConfig.initialSize; i++) {
            pool.push(factory());
        }
        this.objectPool.set(type, pool);
    }

    /**
     * Clean up old cached resources
     */
    private cleanupCache(): void {
        const now = Date.now();
        const maxAge = MemoryManager.CACHE_CLEANUP_INTERVAL * 2;

        for (const [key, entry] of this.resourceCache.entries()) {
            if (now - entry.lastAccessed > maxAge) {
                this.resourceCache.delete(key);
            }
        }
    }

    /**
     * Check memory usage and clean up if necessary
     */
    private checkMemoryUsage(): void {
        const stats = this.getMemoryStats();
        if (stats.heapUsed / stats.heapTotal > MemoryManager.MEMORY_THRESHOLD) {
            this.cleanupCache();
            this.shrinkPools();
        }
    }

    /**
     * Shrink object pools when memory is tight
     */
    private shrinkPools(): void {
        for (const [type, pool] of this.objectPool.entries()) {
            const targetSize = Math.floor(pool.length / this.poolConfig.growthFactor);
            if (targetSize < pool.length) {
                pool.length = targetSize;
            }
        }
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        window.clearInterval(this.cleanupInterval);
        window.clearInterval(this.memoryCheckInterval);
        this.objectPool.clear();
        this.resourceCache.clear();
    }
}
