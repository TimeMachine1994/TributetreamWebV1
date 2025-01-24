import type { Layer, Annotation, Point } from '../types';

export interface RenderOptions {
    scale: number;
    viewport: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    quality?: 'low' | 'medium' | 'high';
}

export class CanvasOptimizer {
    private static readonly THROTTLE_DELAY = 16; // ~60fps
    private static readonly BUFFER_SIZE = 2048;
    private static readonly QUALITY_SETTINGS = {
        low: { downscale: 2, smoothing: false },
        medium: { downscale: 1, smoothing: true },
        high: { downscale: 1, smoothing: true }
    };

    private offscreenCanvas: OffscreenCanvas;
    private mainContext: CanvasRenderingContext2D;
    private bufferContext: OffscreenCanvasRenderingContext2D;
    private renderTimeout: number | null = null;
    private lastRenderTime = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.mainContext = canvas.getContext('2d', {
            alpha: true,
            desynchronized: true,
            willReadFrequently: false
        })!;

        this.offscreenCanvas = new OffscreenCanvas(
            CanvasOptimizer.BUFFER_SIZE,
            CanvasOptimizer.BUFFER_SIZE
        );

        this.bufferContext = this.offscreenCanvas.getContext('2d', {
            alpha: true,
            desynchronized: true,
            willReadFrequently: false
        })!;

        // Enable image smoothing based on device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        this.mainContext.imageSmoothingEnabled = dpr <= 2;
        this.bufferContext.imageSmoothingEnabled = dpr <= 2;
    }

    /**
     * Render layers with throttling and optimization
     */
    render(layers: Layer[], options: RenderOptions): void {
        if (this.renderTimeout) {
            cancelAnimationFrame(this.renderTimeout);
        }

        const now = performance.now();
        const timeSinceLastRender = now - this.lastRenderTime;

        if (timeSinceLastRender < CanvasOptimizer.THROTTLE_DELAY) {
            // Throttle renders to maintain performance
            this.renderTimeout = requestAnimationFrame(() => {
                this.render(layers, options);
            });
            return;
        }

        this.lastRenderTime = now;
        this.renderFrame(layers, options);
    }

    /**
     * Render a single frame with optimizations
     */
    private renderFrame(layers: Layer[], options: RenderOptions): void {
        const { scale, viewport, quality = 'medium' } = options;
        const settings = CanvasOptimizer.QUALITY_SETTINGS[quality];

        // Clear both canvases
        this.clearCanvas(this.mainContext);
        this.clearCanvas(this.bufferContext);

        // Only render visible layers
        const visibleLayers = layers.filter(l => l.visible);

        // Composite layers in buffer
        for (const layer of visibleLayers) {
            this.renderLayerToBuffer(layer, scale / settings.downscale);
        }

        // Draw buffer to main canvas with viewport clipping
        this.mainContext.save();
        this.mainContext.beginPath();
        this.mainContext.rect(
            viewport.x,
            viewport.y,
            viewport.width,
            viewport.height
        );
        this.mainContext.clip();

        // Scale the final render based on quality settings
        this.mainContext.drawImage(
            this.offscreenCanvas,
            viewport.x * settings.downscale,
            viewport.y * settings.downscale,
            viewport.width * settings.downscale,
            viewport.height * settings.downscale,
            viewport.x,
            viewport.y,
            viewport.width,
            viewport.height
        );

        this.mainContext.restore();
    }

    /**
     * Render a single layer to the buffer
     */
    private renderLayerToBuffer(layer: Layer, scale: number): void {
        for (const annotation of layer.annotations) {
            this.renderAnnotation(annotation, scale);
        }
    }

    /**
     * Render a single annotation with proper scaling
     */
    private renderAnnotation(annotation: Annotation, scale: number): void {
        const ctx = this.bufferContext;
        const { points, style } = annotation;

        ctx.save();
        ctx.scale(scale, scale);
        ctx.strokeStyle = style.color || '#000000';
        ctx.lineWidth = (style.width || 1) / scale;
        ctx.globalAlpha = style.opacity || 1;

        switch (annotation.type) {
            case 'drawing':
                this.renderDrawing(points);
                break;
            case 'shape':
                this.renderShape(points);
                break;
            case 'text':
                this.renderText(annotation);
                break;
        }

        ctx.restore();
    }

    /**
     * Render a drawing annotation
     */
    private renderDrawing(points: Point[]): void {
        if (points.length < 2) return;

        const ctx = this.bufferContext;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.stroke();
    }

    /**
     * Render a shape annotation
     */
    private renderShape(points: Point[]): void {
        if (points.length < 2) return;

        const ctx = this.bufferContext;
        const [start, end] = points;
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);

        ctx.strokeRect(x, y, width, height);
    }

    /**
     * Render a text annotation
     */
    private renderText(annotation: Annotation): void {
        if (!annotation.points.length || !annotation.text) return;

        const ctx = this.bufferContext;
        const [position] = annotation.points;
        const fontSize = annotation.style.width || 12;

        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = annotation.style.color || '#000000';
        ctx.fillText(annotation.text, position.x, position.y);
    }

    /**
     * Clear a canvas context
     */
    private clearCanvas(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        if (this.renderTimeout) {
            cancelAnimationFrame(this.renderTimeout);
        }
        this.offscreenCanvas.width = 0;
        this.offscreenCanvas.height = 0;
    }
}
