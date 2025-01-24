import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import AnnotationLayer from './AnnotationLayer.svelte';
import type { Annotation } from '$lib/types';

// Create a partial mock of CanvasRenderingContext2D
const mockContext = {
  scale: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  clearRect: vi.fn(),
  strokeStyle: '#000000',
  lineWidth: 2,
  globalAlpha: 1,
  lineCap: 'round',
  lineJoin: 'round',
  canvas: document.createElement('canvas'),
  getContextAttributes: vi.fn(),
  save: vi.fn(),
  restore: vi.fn()
} as unknown as CanvasRenderingContext2D;

// Create a proper DOMRect mock
class MockDOMRect implements DOMRect {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public width: number = 900,
    public height: number = 600
  ) {}
  get top() { return this.y; }
  get right() { return this.x + this.width; }
  get bottom() { return this.y + this.height; }
  get left() { return this.x; }
  toJSON() { return {}; }
}

describe('AnnotationLayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getContext with proper type handling for all context types
    globalThis.HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string, options?: any) => {
      switch (contextId) {
        case '2d':
          return mockContext;
        case 'bitmaprenderer':
          return {
            transferFromImageBitmap: vi.fn()
          } as unknown as ImageBitmapRenderingContext;
        case 'webgl':
        case 'webgl2':
          return null;
        default:
          return null;
      }
    }) as any;
    // Mock getBoundingClientRect with proper DOMRect
    globalThis.HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => new MockDOMRect());
  });

  it('should initialize with default props', () => {
    const { container } = render(AnnotationLayer);
    const canvas = container.querySelector('canvas');
    
    expect(canvas).toBeTruthy();
    expect(canvas?.classList.contains('cursor-crosshair')).toBe(true);
  });

  it('should setup canvas on mount', () => {
    render(AnnotationLayer);
    
    expect(mockContext.scale).toHaveBeenCalledWith(1, 1);
  });

  it('should handle mouse drawing events', async () => {
    const { container } = render(AnnotationLayer);
    const canvas = container.querySelector('canvas');
    
    // Start drawing
    await fireEvent.mouseDown(canvas!, { clientX: 10, clientY: 20 });
    expect(mockContext.beginPath).toHaveBeenCalled();
    
    // Continue drawing
    await fireEvent.mouseMove(canvas!, { clientX: 30, clientY: 40 });
    expect(mockContext.lineTo).toHaveBeenCalled();
    
    // Stop drawing
    await fireEvent.mouseUp(canvas!);
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('should clear canvas', () => {
    const { component } = render(AnnotationLayer);
    
    // @ts-ignore - accessing component methods
    component.clear();
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 900, 600);
  });

  it('should update style', () => {
    const { component } = render(AnnotationLayer);
    const newStyle = { color: '#ff0000', width: 3, opacity: 0.5 };
    
    // @ts-ignore - accessing component methods
    component.setStyle(newStyle);
    
    // Draw to test new style
    const canvas = component.$$.root.querySelector('canvas');
    fireEvent.mouseDown(canvas!, { clientX: 10, clientY: 20 });
    
    expect(mockContext.strokeStyle).toBe(newStyle.color);
    expect(mockContext.lineWidth).toBe(newStyle.width);
    expect(mockContext.globalAlpha).toBe(newStyle.opacity);
  });

  it('should handle mouse leave during drawing', async () => {
    const { container } = render(AnnotationLayer);
    const canvas = container.querySelector('canvas');
    
    // Start drawing
    await fireEvent.mouseDown(canvas!, { clientX: 10, clientY: 20 });
    
    // Leave canvas
    await fireEvent.mouseLeave(canvas!);
    
    // Try to continue drawing
    await fireEvent.mouseMove(canvas!, { clientX: 30, clientY: 40 });
    
    // Should not draw after leaving
    expect(mockContext.lineTo).not.toHaveBeenCalled();
  });

  it('should scale drawing coordinates correctly', async () => {
    const scale = 2;
    const { container } = render(AnnotationLayer, { props: { scale } });
    const canvas = container.querySelector('canvas');
    
    await fireEvent.mouseDown(canvas!, { clientX: 100, clientY: 100 });
    
    // Check if coordinates are scaled correctly
    expect(mockContext.moveTo).toHaveBeenCalledWith(50, 50); // 100/2, 100/2
  });

  it('should handle existing annotations', () => {
    const existingAnnotations: Annotation[] = [{
      id: 'test',
      type: 'drawing' as const,
      points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
      style: { color: '#000000', width: 2, opacity: 1 }
    }];
    
    render(AnnotationLayer, { props: { annotations: existingAnnotations } });
    
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalledWith(0, 0);
    expect(mockContext.lineTo).toHaveBeenCalledWith(100, 100);
    expect(mockContext.stroke).toHaveBeenCalled();
  });
});
