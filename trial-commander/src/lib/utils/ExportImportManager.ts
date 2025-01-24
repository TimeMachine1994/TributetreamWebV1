import type { Layer, Annotation } from '../types';
import { annotationStore } from '../stores/annotationStore';
import { get } from 'svelte/store';

export interface ExportData {
    version: string;
    timestamp: string;
    layers: Layer[];
    metadata?: {
        creator?: string;
        project?: string;
        notes?: string;
    };
}

export class ExportImportManager {
    private static readonly CURRENT_VERSION = '1.0.0';

    /**
     * Export annotations to a JSON string
     */
    static exportToJSON(metadata?: ExportData['metadata']): string {
        const currentState = get(annotationStore);
        
        const exportData: ExportData = {
            version: this.CURRENT_VERSION,
            timestamp: new Date().toISOString(),
            layers: currentState.annotations.map(annotation => ({
                id: annotation.id,
                name: `Layer ${annotation.id}`,
                visible: true,
                locked: false,
                annotations: [annotation]
            })),
            metadata
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import annotations from a JSON string
     * @throws {Error} If validation fails
     */
    static importFromJSON(jsonString: string): Layer[] {
        try {
            const data = JSON.parse(jsonString) as ExportData;
            this.validateImportData(data);
            return data.layers;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Invalid import data: ${errorMessage}`);
        }
    }

    /**
     * Merge imported layers with existing layers
     */
    static mergeLayers(existingLayers: Layer[], importedLayers: Layer[]): Layer[] {
        const mergedLayers = [...existingLayers];
        const existingIds = new Set(existingLayers.map(l => l.id));

        for (const layer of importedLayers) {
            if (!existingIds.has(layer.id)) {
                mergedLayers.push(layer);
            } else {
                // Merge annotations from the imported layer into the existing layer
                const existingLayer = mergedLayers.find(l => l.id === layer.id);
                if (existingLayer) {
                    const existingAnnotationIds = new Set(
                        existingLayer.annotations.map(a => a.id)
                    );
                    
                    existingLayer.annotations.push(
                        ...layer.annotations.filter(a => !existingAnnotationIds.has(a.id))
                    );
                }
            }
        }

        return mergedLayers;
    }

    /**
     * Validate import data structure and version compatibility
     * @throws {Error} If validation fails
     */
    private static validateImportData(data: unknown): asserts data is ExportData {
        if (!data || typeof data !== 'object') {
            throw new Error('Import data must be an object');
        }

        const { version, timestamp, layers } = data as Partial<ExportData>;

        if (!version || !this.isVersionCompatible(version)) {
            throw new Error(`Unsupported version: ${version}`);
        }

        if (!timestamp || !this.isValidTimestamp(timestamp)) {
            throw new Error('Invalid timestamp');
        }

        if (!Array.isArray(layers)) {
            throw new Error('Layers must be an array');
        }

        // Validate each layer
        layers.forEach((layer, index) => {
            if (!layer.id || typeof layer.id !== 'string') {
                throw new Error(`Invalid layer ID at index ${index}`);
            }

            if (!Array.isArray(layer.annotations)) {
                throw new Error(`Invalid annotations array in layer ${layer.id}`);
            }

            // Validate each annotation
            layer.annotations.forEach((annotation, annoIndex) => {
                if (!this.isValidAnnotation(annotation)) {
                    throw new Error(
                        `Invalid annotation at index ${annoIndex} in layer ${layer.id}`
                    );
                }
            });
        });
    }

    /**
     * Check if the imported version is compatible with current version
     */
    private static isVersionCompatible(version: string): boolean {
        const [majorImport] = version.split('.');
        const [majorCurrent] = this.CURRENT_VERSION.split('.');
        return parseInt(majorImport) === parseInt(majorCurrent);
    }

    /**
     * Validate timestamp format
     */
    private static isValidTimestamp(timestamp: string): boolean {
        const date = new Date(timestamp);
        return date instanceof Date && !isNaN(date.getTime());
    }

    /**
     * Validate annotation structure
     */
    private static isValidAnnotation(annotation: unknown): annotation is Annotation {
        if (!annotation || typeof annotation !== 'object') {
            return false;
        }

        const { id, type, points, style } = annotation as Partial<Annotation>;

        return (
            typeof id === 'string' &&
            ['drawing', 'shape', 'text'].includes(type as string) &&
            Array.isArray(points) &&
            points.every(p => 
                typeof p === 'object' &&
                typeof p.x === 'number' &&
                typeof p.y === 'number'
            ) &&
            (!style || typeof style === 'object')
        );
    }
}
