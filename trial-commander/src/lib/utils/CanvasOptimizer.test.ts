import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CanvasOptimizer, type RenderOptions } from './CanvasOptimizer';
import type { Layer, Annotation } from '../types';

// Mock canvas context methods
const createMockContext = () => ({
    canvas: { width: 800, height: 600 },
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
    setTransform: vi.fn()
});

// Mock window APIs
const mockWindow = {
    devicePixelRatio: 1,
    requestAnimationFrame: vi.fn(),
    cancelAnimationFrame: vi.fn(),
    performance: {
        now: vi.fn()
    }
};

// Mock OffscreenCanvas
class MockOffscreenCanvas {
    width: number;
    height: number;
    context: ReturnType<typeof createMockContext>;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.context = createMockContext();
    }

    getContext() {
        return this.context;
    }
}

describe('CanvasOptimizer', () => {
    let optimizer: CanvasOptimizer;
    let mockCanvas: HTMLCanvasElement;
    let mockContext: ReturnType<typeof createMockContext>;
    let mockAnnotation: Annotation;
    let mockLayer: Layer;
    let renderOptions: RenderOptions;

    beforeEach(() => {
        // Setup window mocks
        vi.stubGlobal('window', mockWindow);
        vi.stubGlobal('OffscreenCanvas', MockOffscreenCanvas);
        mockWindow.performance.now.mockReturnValue(0);

        // Setup canvas mocks
        mockContext = createMockContext();
        mockCanvas = {
            getContext: () => mockContext
        } as unknown as HTMLCanvasElement;

        // Create test data
        mockAnnotation = {
            id: '1',
            type: 'drawing',
            points: [
                { x: 0, y: 0 },
                { x: 100, y: 100 }
            ],
            style: {
                color: '#000000',
                width: 2,
                opacity: 1
            }
        };

        mockLayer = {
            id: '1',
            name: 'Test Layer',
            visible: true,
            locked: false,
            annotations: [mockAnnotation]
        };

        renderOptions = {
            scale: 1,
            viewport: {
                x: 0,
                y: 0,
                width: 800,
                height: 600
            }
        };

        optimizer = new CanvasOptimizer(mockCanvas);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('throttles render calls', () => {
        const now = 1000;
        mockWindow.performance.now.mockReturnValue(now);

        optimizer.render([mockLayer], renderOptions);
        optimizer.render([mockLayer], renderOptions);

        expect(mockWindow.requestAnimationFrame).toHaveBeenCalledTimes(1);
    });

    it('respects quality settings', () => {
        optimizer.render([mockLayer], {
            ...renderOptions,
            quality: 'low'
        });

        const context = (optimizer as any).bufferContext;
        expect(context.scale).toHaveBeenCalledWith(0.5, 0.5);
    });

    it('only renders visible layers', () => {
        const hiddenLayer: Layer = {
            ...mockLayer,
            visible: false
        };

        optimizer.render([mockLayer, hiddenLayer], renderOptions);

        const context = (optimizer as any).bufferContext;
        expect(context.stroke).toHaveBeenCalledTimes(1);
    });

    it('handles different annotation types', () => {
        const drawingAnnotation: Annotation = {
            ...mockAnnotation,
            type: 'drawing'
        };

        const shapeAnnotation: Annotation = {
            ...mockAnnotation,
            type: 'shape'
        };

        const textAnnotation: Annotation = {
            ...mockAnnotation,
            type: 'text',
            text: 'Test'
        };

        const layer: Layer = {
            ...mockLayer,
            annotations: [drawingAnnotation, shapeAnnotation, textAnnotation]
        };

        optimizer.render([layer], renderOptions);

        const context = (optimizer as any).bufferContext;
        expect(context.stroke).toHaveBeenCalled();
        expect(context.strokeRect).toHaveBeenCalled();
        expect(context.fillText).toHaveBeenCalled();
    });

    it('cleans up resources on destroy', () => {
        const mockTimeout = 123;
        (optimizer as any).renderTimeout = mockTimeout;

        optimizer.destroy();

        expect(mockWindow.cancelAnimationFrame).toHaveBeenCalledWith(mockTimeout);
        expect((optimizer as any).offscreenCanvas.width).toBe(0);
        expect((optimizer as any).offscreenCanvas.height).toBe(0);
    });

    it('applies correct scaling based on device pixel ratio', () => {
        mockWindow.devicePixelRatio = 2;
        optimizer = new CanvasOptimizer(mockCanvas);

        const mainContext = (optimizer as any).mainContext;
        const bufferContext = (optimizer as any).bufferContext;

        expect(mainContext.imageSmoothingEnabled).toBe(true);
        expect(bufferContext.imageSmoothingEnabled).toBe(true);

        mockWindow.devicePixelRatio = 3;
        optimizer = new CanvasOptimizer(mockCanvas);

        expect(mainContext.imageSmoothingEnabled).toBe(false);
        expect(bufferContext.imageSmoothingEnabled).toBe(false);
    });

    it('handles empty annotation arrays', () => {
        const emptyLayer: Layer = {
            ...mockLayer,
            annotations: []
        };

        optimizer.render([emptyLayer], renderOptions);

        const context = (optimizer as any).bufferContext;
        expect(context.stroke).not.toHaveBeenCalled();
        expect(context.strokeRect).not.toHaveBeenCalled();
        expect(context.fillText).not.toHaveBeenCalled();
    });
});
