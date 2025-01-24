import { writable, type Writable } from 'svelte/store';

export interface PerformanceMetrics {
    fps: number;
    memory: {
        used: number;
        total: number;
        limit: number;
    };
    timing: {
        loadTime: number;
        renderTime: number;
        idleTime: number;
    };
    resources: {
        images: number;
        annotations: number;
        totalSize: number;
    };
    operations: {
        success: number;
        failed: number;
        pending: number;
    };
}

export interface MetricsSnapshot {
    timestamp: number;
    metrics: PerformanceMetrics;
}

export interface MonitorConfig {
    sampleInterval: number;
    historySize: number;
    warningThresholds: {
        fps: number;
        memoryUsage: number;
        loadTime: number;
        renderTime: number;
    };
}

export class PerformanceMonitor {
    private static readonly DEFAULT_CONFIG: MonitorConfig = {
        sampleInterval: 1000, // 1 second
        historySize: 60, // Keep 1 minute of history
        warningThresholds: {
            fps: 30,
            memoryUsage: 0.9, // 90%
            loadTime: 2000, // 2 seconds
            renderTime: 16 // 16ms (60fps)
        }
    };

    private config: MonitorConfig;
    private metrics: Writable<PerformanceMetrics>;
    private history: MetricsSnapshot[];
    private monitoringInterval: number = 0;
    private lastFrameTime: number;
    private frameCount: number;
    private startTime: number;

    constructor(config: Partial<MonitorConfig> = {}) {
        this.config = { ...PerformanceMonitor.DEFAULT_CONFIG, ...config };
        this.metrics = writable(this.getInitialMetrics());
        this.history = [];
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.startTime = Date.now();

        // Start monitoring
        this.startMonitoring();
    }

    /**
     * Get current metrics store
     */
    getMetrics(): Writable<PerformanceMetrics> {
        return this.metrics;
    }

    /**
     * Get performance history
     */
    getHistory(): MetricsSnapshot[] {
        return [...this.history];
    }

    /**
     * Record a frame render
     */
    recordFrame(): void {
        const now = performance.now();
        this.frameCount++;
        
        if (now - this.lastFrameTime >= 1000) {
            this.updateMetrics(metrics => ({
                ...metrics,
                fps: this.frameCount
            }));
            this.frameCount = 0;
            this.lastFrameTime = now;
        }
    }

    /**
     * Record a resource operation
     */
    recordOperation(type: 'success' | 'failed' | 'pending'): void {
        this.updateMetrics(metrics => ({
            ...metrics,
            operations: {
                ...metrics.operations,
                [type]: metrics.operations[type] + 1
            }
        }));
    }

    /**
     * Record timing information
     */
    recordTiming(type: keyof PerformanceMetrics['timing'], duration: number): void {
        this.updateMetrics(metrics => ({
            ...metrics,
            timing: {
                ...metrics.timing,
                [type]: duration
            }
        }));
    }

    /**
     * Update resource counts
     */
    updateResourceCounts(counts: Partial<PerformanceMetrics['resources']>): void {
        this.updateMetrics(metrics => ({
            ...metrics,
            resources: {
                ...metrics.resources,
                ...counts
            }
        }));
    }

    /**
     * Check if performance meets thresholds
     */
    checkPerformance(): {
        meets: boolean;
        warnings: string[];
    } {
        const current = this.getCurrentMetrics();
        const warnings: string[] = [];

        if (current.fps < this.config.warningThresholds.fps) {
            warnings.push(`Low FPS: ${current.fps}`);
        }

        const memoryUsage = current.memory.used / current.memory.total;
        if (memoryUsage > this.config.warningThresholds.memoryUsage) {
            warnings.push(`High memory usage: ${Math.round(memoryUsage * 100)}%`);
        }

        if (current.timing.loadTime > this.config.warningThresholds.loadTime) {
            warnings.push(`Slow loading: ${current.timing.loadTime}ms`);
        }

        if (current.timing.renderTime > this.config.warningThresholds.renderTime) {
            warnings.push(`Slow rendering: ${current.timing.renderTime}ms`);
        }

        return {
            meets: warnings.length === 0,
            warnings
        };
    }

    /**
     * Start performance monitoring
     */
    private startMonitoring(): void {
        this.monitoringInterval = window.setInterval(() => {
            const currentMetrics = this.getCurrentMetrics();
            
            // Update metrics store
            this.metrics.set(currentMetrics);

            // Add to history
            this.history.push({
                timestamp: Date.now(),
                metrics: currentMetrics
            });

            // Trim history if needed
            if (this.history.length > this.config.historySize) {
                this.history.shift();
            }
        }, this.config.sampleInterval);
    }

    /**
     * Get current metrics
     */
    private getCurrentMetrics(): PerformanceMetrics {
        const memory = (performance as any).memory || {
            usedJSHeapSize: 0,
            totalJSHeapSize: 0,
            jsHeapSizeLimit: 0
        };

        return {
            fps: this.frameCount,
            memory: {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit
            },
            timing: {
                loadTime: performance.now() - this.startTime,
                renderTime: performance.now() - this.lastFrameTime,
                idleTime: 0 // Will be calculated based on requestIdleCallback
            },
            resources: {
                images: 0,
                annotations: 0,
                totalSize: 0
            },
            operations: {
                success: 0,
                failed: 0,
                pending: 0
            }
        };
    }

    /**
     * Get initial metrics state
     */
    private getInitialMetrics(): PerformanceMetrics {
        return {
            fps: 0,
            memory: {
                used: 0,
                total: 0,
                limit: 0
            },
            timing: {
                loadTime: 0,
                renderTime: 0,
                idleTime: 0
            },
            resources: {
                images: 0,
                annotations: 0,
                totalSize: 0
            },
            operations: {
                success: 0,
                failed: 0,
                pending: 0
            }
        };
    }

    /**
     * Update metrics with a reducer function
     */
    private updateMetrics(reducer: (current: PerformanceMetrics) => PerformanceMetrics): void {
        this.metrics.update(reducer);
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        if (this.monitoringInterval) {
            window.clearInterval(this.monitoringInterval);
        }
        this.history = [];
    }
}
