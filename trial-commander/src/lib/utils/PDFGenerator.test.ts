import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFGenerator } from './PDFGenerator';
import type { Layer, Annotation } from '../types';
import jsPDF from 'jspdf';

// Mock jsPDF
vi.mock('jspdf', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            setProperties: vi.fn(),
            addPage: vi.fn(),
            addImage: vi.fn(),
            setDrawColor: vi.fn(),
            setLineWidth: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            rect: vi.fn(),
            setTextColor: vi.fn(),
            text: vi.fn(),
            setFontSize: vi.fn(),
            internal: {
                pageSize: {
                    width: 612, // Letter size in points
                    height: 792
                }
            },
            output: vi.fn().mockReturnValue(new ArrayBuffer(8))
        }))
    };
});

describe('PDFGenerator', () => {
    let mockAnnotation: Annotation;
    let mockLayer: Layer;
    let mockImage: string;

    beforeEach(() => {
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

        mockImage = 'data:image/png;base64,test';

        // Mock Image loading
        (window as any).Image = class {
            onload: () => void = () => {};
            onerror: () => void = () => {};
            src: string = '';
            width: number = 800;
            height: number = 600;

            constructor() {
                setTimeout(() => this.onload(), 0);
            }
        } as any;
    });

    it('generates PDF with default options', async () => {
        const result = await PDFGenerator.generatePDF(
            [mockLayer],
            [mockImage]
        );

        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('adds metadata when includeMetadata is true', async () => {
        const jspdfInstance = new jsPDF();
        const spy = vi.spyOn(jspdfInstance, 'setProperties');

        await PDFGenerator.generatePDF(
            [mockLayer],
            [mockImage],
            undefined,
            { includeMetadata: true }
        );

        expect(spy).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Document Annotations',
            author: 'Trial Commander'
        }));
    });

    it('skips metadata when includeMetadata is false', async () => {
        const jspdfInstance = new jsPDF();
        const spy = vi.spyOn(jspdfInstance, 'setProperties');

        await PDFGenerator.generatePDF(
            [mockLayer],
            [mockImage],
            undefined,
            { includeMetadata: false }
        );

        expect(spy).not.toHaveBeenCalled();
    });

    it('adds Bates numbers when provided', async () => {
        const jspdfInstance = new jsPDF();
        const spy = vi.spyOn(jspdfInstance, 'text');

        await PDFGenerator.generatePDF(
            [mockLayer],
            [mockImage],
            ['EXH001'],
            { includeBatesNumbers: true }
        );

        expect(spy).toHaveBeenCalledWith(
            'EXH001',
            expect.any(Number),
            expect.any(Number)
        );
    });

    it('handles multiple pages', async () => {
        const jspdfInstance = new jsPDF();
        const spy = vi.spyOn(jspdfInstance, 'addPage');

        await PDFGenerator.generatePDF(
            [mockLayer],
            [mockImage, mockImage],
            ['EXH001', 'EXH002']
        );

        expect(spy).toHaveBeenCalledTimes(1); // Second page requires one addPage call
    });

    it('only includes visible layers', async () => {
        const hiddenLayer: Layer = {
            ...mockLayer,
            visible: false
        };

        const jspdfInstance = new jsPDF();
        const spy = vi.spyOn(jspdfInstance, 'stroke');

        await PDFGenerator.generatePDF(
            [mockLayer, hiddenLayer],
            [mockImage]
        );

        expect(spy).toHaveBeenCalledTimes(1); // Only one layer's annotations
    });

    it('handles different annotation types', async () => {
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
            text: 'Test Text'
        };

        const layer: Layer = {
            ...mockLayer,
            annotations: [drawingAnnotation, shapeAnnotation, textAnnotation]
        };

        const jspdfInstance = new jsPDF();
        const strokeSpy = vi.spyOn(jspdfInstance, 'stroke');
        const rectSpy = vi.spyOn(jspdfInstance, 'rect');
        const textSpy = vi.spyOn(jspdfInstance, 'text');

        await PDFGenerator.generatePDF(
            [layer],
            [mockImage]
        );

        expect(strokeSpy).toHaveBeenCalled();
        expect(rectSpy).toHaveBeenCalled();
        expect(textSpy).toHaveBeenCalled();
    });

    it('calculates dimensions correctly', () => {
        const result = PDFGenerator['calculateDimensions'](
            800, 600,    // original dimensions
            500, 400     // max dimensions
        );

        expect(result.width).toBe(500);
        expect(result.height).toBe(375); // maintains aspect ratio
    });

    it('handles image loading errors', async () => {
        // Mock Image to simulate error
        (window as any).Image = class {
            onload: () => void = () => {};
            onerror: (error: Error) => void = () => {};
            src: string = '';

            constructor() {
                setTimeout(() => this.onerror(new Error('Failed to load image')), 0);
            }
        } as any;

        await expect(PDFGenerator.generatePDF(
            [mockLayer],
            [mockImage]
        )).rejects.toThrow('Failed to load image');
    });
});
