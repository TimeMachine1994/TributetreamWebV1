import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import PerformanceViewer from './PerformanceViewer.svelte';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { get } from 'svelte/store';

// Mock canvas context
const mockCtx = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    fillStyle: '#ff4444',
    strokeStyle: '#000000',
    lineWidth: 1,
    textAlign: 'left' as CanvasTextAlign,
    font: '12px monospace'
};

// Mock canvas element
const mockCanvas = {
    getContext: () => mockCtx,
    width: 200,
    height: 100
};

// Mock requestAnimationFrame
const mockRAF = vi.fn();
(globalThis as any).requestAnimationFrame = mockRAF;
(globalThis as any).cancelAnimationFrame = vi.fn();

describe('PerformanceViewer', () => {
    let monitor: PerformanceMonitor;
    let metrics: any;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Mock monitor
        monitor = new PerformanceMonitor();
        
        // Mock initial metrics
        metrics = {
            fps: 60,
            memory: {
                used: 1000000,
                total: 2000000,
                limit: 4000000
            },
            timing: {
                loadTime: 500,
                renderTime: 8,
                idleTime: 0
            },
            resources: {
                images: 5,
                annotations: 10,
                totalSize: 1500000
            },
            operations: {
                success: 20,
                failed: 1,
                pending: 2
            }
        };

        // Mock monitor methods
        vi.spyOn(monitor, 'getMetrics').mockReturnValue({
            subscribe: (callback: any) => {
                callback(metrics);
                return () => {};
            }
        } as any);

        vi.spyOn(monitor, 'getHistory').mockReturnValue([
            { timestamp: Date.now(), metrics }
        ]);

        // Mock canvas element creation
        vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
            if (tagName === 'canvas') {
                return mockCanvas as any;
            }
            return document.createElement(tagName);
        });
    });

    it('renders in collapsed state by default', () => {
        const { container } = render(PerformanceViewer, {
            props: { monitor, expanded: false }
        });

        expect(container.querySelector('.content')).toBeFalsy();
        expect(container.querySelector('.fps')).toBeTruthy();
    });

    it('expands when header is clicked', async () => {
        const { container } = render(PerformanceViewer, {
            props: { monitor, expanded: false }
        });

        const header = container.querySelector('.header')!;
        await fireEvent.click(header);

        expect(container.querySelector('.content')).toBeTruthy();
    });

    it('displays current FPS', () => {
        const { container } = render(PerformanceViewer, {
            props: { monitor }
        });

        const fps = container.querySelector('.fps');
        expect(fps?.textContent).toContain('60');
    });

    it('shows warning for low FPS', () => {
        metrics.fps = 20;
        const { container } = render(PerformanceViewer, {
            props: { monitor }
        });

        const fps = container.querySelector('.fps');
        expect(fps?.classList.contains('warning')).toBe(true);
    });

    it('displays memory usage', () => {
        const { container } = render(PerformanceViewer, {
            props: { monitor, expanded: true }
        });

        const memoryText = Array.from(container.querySelectorAll('.metric span'))
            .find(el => el.textContent?.includes('Memory'));
        expect(memoryText).toBeTruthy();
    });

    it('shows resource counts', () => {
        const { container } = render(PerformanceViewer, {
            props: { monitor, expanded: true }
        });

        const resourceText = container.textContent;
        expect(resourceText).toContain('5 images');
        expect(resourceText).toContain('10 annotations');
    });

    it('starts animation when expanded', () => {
        render(PerformanceViewer, {
            props: { monitor, expanded: true }
        });

        expect(mockRAF).toHaveBeenCalled();
    });

    it('stops animation when collapsed', async () => {
        const { component } = render(PerformanceViewer, {
            props: { monitor, expanded: true }
        });

        await component.$set({ expanded: false });
        expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('cleans up on destroy', () => {
        const { component } = render(PerformanceViewer, {
            props: { monitor, expanded: true }
        });

        component.$destroy();
        expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('draws charts when expanded', () => {
        render(PerformanceViewer, {
            props: { monitor, expanded: true }
        });

        expect(mockCtx.clearRect).toHaveBeenCalled();
        expect(mockCtx.beginPath).toHaveBeenCalled();
        expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('shows warning for high memory usage', () => {
        metrics.memory.used = metrics.memory.total * 0.9; // 90% usage
        const { container } = render(PerformanceViewer, {
            props: { monitor, expanded: true }
        });

        const memoryBar = container.querySelector('.memory-bar');
        expect(mockCtx.fillStyle).toBe('#ff4444'); // Warning color
    });

    it('shows warning for slow render time', () => {
        metrics.timing.renderTime = 20; // > 16ms threshold
        const { container } = render(PerformanceViewer, {
            props: { monitor, expanded: true }
        });

        const renderTime = Array.from(container.querySelectorAll('.metric span'))
            .find(el => el.textContent?.includes('20.0ms'));
        expect(renderTime?.classList.contains('warning')).toBe(true);
    });
});
