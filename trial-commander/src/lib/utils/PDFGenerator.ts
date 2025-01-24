import jsPDF from 'jspdf';
import type { Layer, Annotation, Point } from '../types';

export interface PDFOptions {
    pageSize?: 'a4' | 'letter' | 'legal';
    orientation?: 'portrait' | 'landscape';
    margin?: number;
    includeMetadata?: boolean;
    includeBatesNumbers?: boolean;
}

export class PDFGenerator {
    private static readonly DEFAULT_OPTIONS: PDFOptions = {
        pageSize: 'letter',
        orientation: 'portrait',
        margin: 50,
        includeMetadata: true,
        includeBatesNumbers: true
    };

    /**
     * Generate PDF from layers and annotations
     */
    static async generatePDF(
        layers: Layer[],
        images: string[],
        batesNumbers?: string[],
        options: PDFOptions = {}
    ): Promise<Uint8Array> {
        const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
        const doc = new jsPDF({
            orientation: mergedOptions.orientation,
            unit: 'pt',
            format: mergedOptions.pageSize
        });

        // Set metadata
        if (mergedOptions.includeMetadata) {
            doc.setProperties({
                title: 'Document Annotations',
                subject: 'Exported annotations and layers',
                author: 'Trial Commander',
                creator: 'Trial Commander',
                keywords: 'annotations,layers,document'
            });
        }

        // Process each image and its annotations
        for (let i = 0; i < images.length; i++) {
            if (i > 0) {
                doc.addPage();
            }

            // Add image
            await this.addImageToPage(doc, images[i], mergedOptions);

            // Add visible annotations from each layer
            const visibleLayers = layers.filter(l => l.visible);
            for (const layer of visibleLayers) {
                this.addLayerAnnotations(doc, layer.annotations);
            }

            // Add Bates number if available
            if (mergedOptions.includeBatesNumbers && batesNumbers?.[i]) {
                this.addBatesNumber(doc, batesNumbers[i], mergedOptions);
            }
        }

        return new Uint8Array(doc.output('arraybuffer'));
    }

    /**
     * Add image to PDF page
     */
    private static async addImageToPage(
        doc: jsPDF,
        imagePath: string,
        options: PDFOptions
    ): Promise<void> {
        const img = await this.loadImage(imagePath);
        const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            doc.internal.pageSize.width - 2 * options.margin!,
            doc.internal.pageSize.height - 2 * options.margin!
        );

        doc.addImage(
            img,
            'JPEG',
            options.margin!,
            options.margin!,
            width,
            height
        );
    }

    /**
     * Add annotations from a layer to the PDF
     */
    private static addLayerAnnotations(doc: jsPDF, annotations: Annotation[]): void {
        for (const annotation of annotations) {
            switch (annotation.type) {
                case 'drawing':
                    this.addDrawingAnnotation(doc, annotation);
                    break;
                case 'shape':
                    this.addShapeAnnotation(doc, annotation);
                    break;
                case 'text':
                    this.addTextAnnotation(doc, annotation);
                    break;
            }
        }
    }

    /**
     * Add drawing annotation to PDF
     */
    private static addDrawingAnnotation(doc: jsPDF, annotation: Annotation): void {
        const { points, style } = annotation;
        if (points.length < 2) return;

        doc.setDrawColor(style.color || '#000000');
        doc.setLineWidth(style.width || 1);
        
        let first = true;
        for (const point of points) {
            if (first) {
                doc.moveTo(point.x, point.y);
                first = false;
            } else {
                doc.lineTo(point.x, point.y);
            }
        }
        doc.stroke();
    }

    /**
     * Add shape annotation to PDF
     */
    private static addShapeAnnotation(doc: jsPDF, annotation: Annotation): void {
        const { points, style } = annotation;
        if (points.length < 2) return;

        doc.setDrawColor(style.color || '#000000');
        doc.setLineWidth(style.width || 1);

        const [start, end] = points;
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);

        doc.rect(x, y, width, height);
    }

    /**
     * Add text annotation to PDF
     */
    private static addTextAnnotation(doc: jsPDF, annotation: Annotation): void {
        const { points, style } = annotation;
        if (points.length < 1) return;

        const [position] = points;
        doc.setTextColor(style.color || '#000000');
        doc.setFontSize(style.width || 12);
        doc.text(annotation.text || '', position.x, position.y);
    }

    /**
     * Add Bates number to PDF page
     */
    private static addBatesNumber(
        doc: jsPDF,
        batesNumber: string,
        options: PDFOptions
    ): void {
        const fontSize = 12;
        doc.setFontSize(fontSize);
        doc.text(
            batesNumber,
            doc.internal.pageSize.width - options.margin! - 100,
            doc.internal.pageSize.height - options.margin! + fontSize
        );
    }

    /**
     * Load image and return as HTMLImageElement
     */
    private static loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * Calculate dimensions maintaining aspect ratio
     */
    private static calculateDimensions(
        imgWidth: number,
        imgHeight: number,
        maxWidth: number,
        maxHeight: number
    ): { width: number; height: number } {
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        return {
            width: imgWidth * ratio,
            height: imgHeight * ratio
        };
    }
}
