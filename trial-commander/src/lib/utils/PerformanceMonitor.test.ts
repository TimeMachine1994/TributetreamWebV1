import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PerformanceMonitor, type MonitorConfig } from './PerformanceMonitor';
import { get } from 'svelte/store';

// Mock window APIs
const mockWindow = {
    setInterval: vi.fn(),
    clearInterval: vi.fn(),
    performance: {
        now: vi.fn(),
        memory: {
            usedJSHeapSize: 1000000,
            totalJSHeapSize: 2000000,
            jsHeapSizeLimit: 4000000
        }
    }
};

describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;
    let config: Partial<MonitorConfig>;
    let currentTime: number;

    beforeEach(() => {
        // Setup window mocks
        vi.stubGlobal('window', mockWindow);
        currentTime = 0;
        vi.spyOn(Date, 'now').mockImplementation(() => currentTime);
        mockWindow.performance.now.mockImplementation(() => currentTime);

        config = {
            sampleInterval: 100,
            historySize: 5,
            warningThresholds: {
                fps: 30,
                memoryUsage: 0.8,
                loadTime: 1000,
                renderTime: 16
            }
        };

        monitor = new PerformanceMonitor(config);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        monitor.destroy();
    });

    it('initializes with default metrics', () => {
        const metrics = get(monitor.getMetrics());
        expect(metrics.fps).toBe(0);
        expect(metrics.operations.success).toBe(0);
        expect(metrics.operations.failed).toBe(0);
        expect(metrics.operations.pending).toBe(0);
    });

    it('records frames and calculates FPS', () => {
        // Record 60 frames over 1 second
        for (let i = 0; i < 60; i++) {
            monitor.recordFrame();
        }
        
        currentTime += 1000;
        monitor.recordFrame(); // Trigger FPS calculation

        const metrics = get(monitor.getMetrics());
        expect(metrics.fps).toBe(60);
    });

    it('tracks operation counts', () => {
        monitor.recordOperation('success');
        monitor.recordOperation('success');
        monitor.recordOperation('failed');
        monitor.recordOperation('pending');

        const metrics = get(monitor.getMetrics());
        expect(metrics.operations.success).toBe(2);
        expect(metrics.operations.failed).toBe(1);
        expect(metrics.operations.pending).toBe(1);
    });

    it('records timing information', () => {
        monitor.recordTiming('loadTime', 1500);
        monitor.recordTiming('renderTime', 20);

        const metrics = get(monitor.getMetrics());
        expect(metrics.timing.loadTime).toBe(1500);
        expect(metrics.timing.renderTime).toBe(20);
    });

    it('updates resource counts', () => {
        monitor.updateResourceCounts({
            images: 10,
            annotations: 20,
            totalSize: 1000000
        });

        const metrics = get(monitor.getMetrics());
        expect(metrics.resources.images).toBe(10);
        expect(metrics.resources.annotations).toBe(20);
        expect(metrics.resources.totalSize).toBe(1000000);
    });

    it('maintains performance history', () => {
        // Simulate multiple intervals
        for (let i = 0; i < 10; i++) {
            currentTime += config.sampleInterval!;
            const callback = mockWindow.setInterval.mock.calls[0][0];
            callback();
        }

        const history = monitor.getHistory();
        expect(history.length).toBeLessThanOrEqual(config.historySize!);
        expect(history[0].timestamp).toBeLessThan(history[1].timestamp);
    });

    it('checks performance against thresholds', () => {
        // Simulate poor performance
        monitor.recordFrame(); // Low FPS
        monitor.recordTiming('renderTime', 20); // Slow rendering

        const check = monitor.checkPerformance();
        expect(check.meets).toBe(false);
        expect(check.warnings).toContain('Low FPS: 1');
        expect(check.warnings).toContain('Slow rendering: 20ms');
    });

    it('cleans up resources on destroy', () => {
        const intervalId = 123;
        (monitor as any).monitoringInterval = intervalId;

        monitor.destroy();

        expect(mockWindow.clearInterval).toHaveBeenCalledWith(intervalId);
        expect((monitor as any).history.length).toBe(0);
    });

    it('handles memory metrics', () => {
        const metrics = get(monitor.getMetrics());
        expect(metrics.memory.used).toBe(mockWindow.performance.memory.usedJSHeapSize);
        expect(metrics.memory.total).toBe(mockWindow.performance.memory.totalJSHeapSize);
        expect(metrics.memory.limit).toBe(mockWindow.performance.memory.jsHeapSizeLimit);
    });

    it('calculates load time correctly', () => {
        currentTime += 5000;
        const metrics = (monitor as any).getCurrentMetrics();
        expect(metrics.timing.loadTime).toBe(5000);
    });

    it('handles missing performance.memory gracefully', () => {
        delete (mockWindow.performance as any).memory;
        const metrics = (monitor as any).getCurrentMetrics();
        
        expect(metrics.memory.used).toBe(0);
        expect(metrics.memory.total).toBe(0);
        expect(metrics.memory.limit).toBe(0);
    });

    it('updates metrics store on interval', () => {
        const callback = mockWindow.setInterval.mock.calls[0][0];
        const storeSpy = vi.fn();
        monitor.getMetrics().subscribe(storeSpy);

        callback();

        expect(storeSpy).toHaveBeenCalled();
    });
});
