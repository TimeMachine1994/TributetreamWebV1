import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

export interface LoadingState {
    status: 'idle' | 'loading' | 'loaded' | 'error';
    progress: number;
    error?: string;
}

export interface LoadOptions {
    priority: 'high' | 'medium' | 'low';
    quality: 'preview' | 'full';
    prefetch?: boolean;
}

export interface ViewportConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
}

export class LazyLoader {
    private static readonly CHUNK_SIZE = 524288; // 512KB
    private static readonly MAX_CONCURRENT_LOADS = 3;
    private static readonly PREFETCH_DISTANCE = 2;
    private static readonly DEFAULT_OPTIONS: LoadOptions = {
        priority: 'medium',
        quality: 'full',
        prefetch: true
    };

    private loadQueue: Map<string, { 
        options: LoadOptions;
        resolve: (data: any) => void;
        reject: (error: Error) => void;
    }>;
    private activeLoads: Set<string>;
    private loadingStates: Map<string, Writable<LoadingState>>;
    private cache: Map<string, {
        data: any;
        timestamp: number;
        size: number;
    }>;
    private viewport: ViewportConfig | null;

    constructor() {
        this.loadQueue = new Map();
        this.activeLoads = new Set();
        this.loadingStates = new Map();
        this.cache = new Map();
        this.viewport = null;

        // Start processing queue
        this.processQueue();
    }

    /**
     * Load a resource with progress tracking
     */
    async load(url: string, options: Partial<LoadOptions> = {}): Promise<any> {
        const mergedOptions = { ...LazyLoader.DEFAULT_OPTIONS, ...options };
        
        // Check cache first
        const cached = this.cache.get(url);
        if (cached) {
            cached.timestamp = Date.now();
            return cached.data;
        }

        // Create or get loading state store
        if (!this.loadingStates.has(url)) {
            this.loadingStates.set(url, writable({
                status: 'idle',
                progress: 0
            }));
        }

        // Add to queue if not already loading
        if (!this.loadQueue.has(url) && !this.activeLoads.has(url)) {
            return new Promise((resolve, reject) => {
                this.loadQueue.set(url, { options: mergedOptions, resolve, reject });
                this.updateLoadingState(url, { status: 'loading', progress: 0 });
            });
        }

        // Return existing promise if already in queue
        return new Promise((resolve, reject) => {
            const existing = this.loadQueue.get(url);
            if (existing) {
                const currentPriority = this.getPriorityValue(existing.options.priority);
                const newPriority = this.getPriorityValue(mergedOptions.priority);
                
                if (newPriority < currentPriority) {
                    existing.options = mergedOptions; // Upgrade priority if higher
                }
                existing.resolve = resolve;
                existing.reject = reject;
            }
        });
    }

    /**
     * Update viewport configuration and trigger prefetch
     */
    updateViewport(config: ViewportConfig): void {
        this.viewport = config;
        if (LazyLoader.DEFAULT_OPTIONS.prefetch) {
            this.prefetchVisibleResources();
        }
    }

    /**
     * Get loading state store for a resource
     */
    getLoadingState(url: string): Writable<LoadingState> {
        if (!this.loadingStates.has(url)) {
            this.loadingStates.set(url, writable({
                status: 'idle',
                progress: 0
            }));
        }
        return this.loadingStates.get(url)!;
    }

    /**
     * Clear cache entries
     */
    clearCache(olderThan?: number): void {
        const now = Date.now();
        for (const [url, entry] of this.cache.entries()) {
            if (!olderThan || now - entry.timestamp > olderThan) {
                this.cache.delete(url);
            }
        }
    }

    /**
     * Process the load queue
     */
    private async processQueue(): Promise<void> {
        while (true) {
            // Process high priority items first
            for (const priority of ['high', 'medium', 'low']) {
                if (this.activeLoads.size >= LazyLoader.MAX_CONCURRENT_LOADS) {
                    break;
                }

                for (const [url, { options, resolve, reject }] of this.loadQueue.entries()) {
                    if (options.priority === priority && !this.activeLoads.has(url)) {
                        this.loadQueue.delete(url);
                        this.activeLoads.add(url);
                        
                        this.loadResource(url, options)
                            .then(resolve)
                            .catch(reject)
                            .finally(() => {
                                this.activeLoads.delete(url);
                            });

                        if (this.activeLoads.size >= LazyLoader.MAX_CONCURRENT_LOADS) {
                            break;
                        }
                    }
                }
            }

            // Wait before next iteration
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    /**
     * Load a resource with progress tracking
     */
    private async loadResource(url: string, options: LoadOptions): Promise<any> {
        try {
            const response = await fetch(url);
            const reader = response.body?.getReader();
            const contentLength = +(response.headers.get('Content-Length') ?? '0');
            
            if (!reader) {
                throw new Error('Failed to get response reader');
            }

            let receivedLength = 0;
            const chunks: Uint8Array[] = [];

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }

                chunks.push(value);
                receivedLength += value.length;
                
                // Update progress
                this.updateLoadingState(url, {
                    status: 'loading',
                    progress: contentLength ? receivedLength / contentLength : 0
                });
            }

            // Combine chunks
            const data = this.combineChunks(chunks);
            
            // Cache the result
            this.cache.set(url, {
                data,
                timestamp: Date.now(),
                size: receivedLength
            });

            this.updateLoadingState(url, {
                status: 'loaded',
                progress: 1
            });

            return data;
        } catch (error) {
            this.updateLoadingState(url, {
                status: 'error',
                progress: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    /**
     * Update loading state for a resource
     */
    private updateLoadingState(url: string, state: Partial<LoadingState>): void {
        const store = this.getLoadingState(url);
        store.update(current => ({ ...current, ...state }));
    }

    /**
     * Combine chunks into final data
     */
    private combineChunks(chunks: Uint8Array[]): Uint8Array {
        const totalLength = chunks.reduce((total, chunk) => total + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }
        
        return result;
    }

    /**
     * Get numeric priority value
     */
    private getPriorityValue(priority: string): number {
        switch (priority) {
            case 'high': return 0;
            case 'medium': return 1;
            case 'low': return 2;
            default: return 1;
        }
    }

    /**
     * Prefetch resources that might be needed soon
     */
    private prefetchVisibleResources(): void {
        if (!this.viewport) return;

        // Implementation would depend on how resources are organized
        // For example, if we have a list of image URLs, we could:
        // 1. Calculate which images are visible in the viewport
        // 2. Prefetch the next few images in the sequence
        // 3. Use lower quality for prefetched images
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        this.loadQueue.clear();
        this.activeLoads.clear();
        this.loadingStates.clear();
        this.cache.clear();
    }
}
