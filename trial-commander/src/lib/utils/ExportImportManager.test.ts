import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportImportManager } from './ExportImportManager';
import type { Layer, Annotation } from '../types';
import { get } from 'svelte/store';
import { annotationStore } from '../stores/annotationStore';

// Mock Svelte store
vi.mock('svelte/store', () => ({
    get: vi.fn()
}));

describe('ExportImportManager', () => {
    let mockAnnotation: Annotation;
    let mockLayer: Layer;

    beforeEach(() => {
        mockAnnotation = {
            id: '1',
            type: 'drawing',
            points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
            style: { color: '#000000', width: 2, opacity: 1 }
        };

        mockLayer = {
            id: '1',
            name: 'Test Layer',
            visible: true,
            locked: false,
            annotations: [mockAnnotation]
        };

        // Mock store state
        vi.mocked(get).mockReturnValue({
            annotations: [mockAnnotation],
            history: [],
            currentIndex: -1
        });
    });

    describe('exportToJSON', () => {
        it('exports annotations with correct format', () => {
            const metadata = { creator: 'Test User', project: 'Test Project' };
            const result = ExportImportManager.exportToJSON(metadata);
            const parsed = JSON.parse(result);

            expect(parsed).toEqual({
                version: '1.0.0',
                timestamp: expect.any(String),
                layers: [
                    {
                        id: '1',
                        name: 'Layer 1',
                        visible: true,
                        locked: false,
                        annotations: [mockAnnotation]
                    }
                ],
                metadata
            });
        });

        it('includes timestamp in ISO format', () => {
            const result = ExportImportManager.exportToJSON();
            const parsed = JSON.parse(result);
            
            expect(() => new Date(parsed.timestamp)).not.toThrow();
            expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });
    });

    describe('importFromJSON', () => {
        it('imports valid JSON data', () => {
            const exportData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                layers: [mockLayer]
            };

            const result = ExportImportManager.importFromJSON(JSON.stringify(exportData));
            expect(result).toEqual([mockLayer]);
        });

        it('throws error for invalid version', () => {
            const exportData = {
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                layers: [mockLayer]
            };

            expect(() => {
                ExportImportManager.importFromJSON(JSON.stringify(exportData));
            }).toThrow('Unsupported version');
        });

        it('throws error for invalid timestamp', () => {
            const exportData = {
                version: '1.0.0',
                timestamp: 'invalid-date',
                layers: [mockLayer]
            };

            expect(() => {
                ExportImportManager.importFromJSON(JSON.stringify(exportData));
            }).toThrow('Invalid timestamp');
        });

        it('throws error for invalid layer structure', () => {
            const exportData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                layers: [{ id: '1' }] // Missing required properties
            };

            expect(() => {
                ExportImportManager.importFromJSON(JSON.stringify(exportData));
            }).toThrow('Invalid annotations array');
        });

        it('throws error for invalid annotation structure', () => {
            const invalidAnnotation = {
                id: '1',
                type: 'invalid-type',
                points: [{ x: 0, y: 0 }]
            };

            const exportData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                layers: [{
                    ...mockLayer,
                    annotations: [invalidAnnotation]
                }]
            };

            expect(() => {
                ExportImportManager.importFromJSON(JSON.stringify(exportData));
            }).toThrow('Invalid annotation');
        });
    });

    describe('mergeLayers', () => {
        it('merges non-overlapping layers', () => {
            const layer1 = { ...mockLayer, id: '1' };
            const layer2 = { ...mockLayer, id: '2' };
            
            const result = ExportImportManager.mergeLayers([layer1], [layer2]);
            expect(result).toHaveLength(2);
            expect(result).toContainEqual(layer1);
            expect(result).toContainEqual(layer2);
        });

        it('merges annotations in overlapping layers', () => {
            const annotation1 = { ...mockAnnotation, id: '1' };
            const annotation2 = { ...mockAnnotation, id: '2' };
            
            const existingLayer = {
                ...mockLayer,
                id: '1',
                annotations: [annotation1]
            };
            
            const importedLayer = {
                ...mockLayer,
                id: '1',
                annotations: [annotation2]
            };

            const result = ExportImportManager.mergeLayers([existingLayer], [importedLayer]);
            
            expect(result).toHaveLength(1);
            expect(result[0].annotations).toHaveLength(2);
            expect(result[0].annotations).toContainEqual(annotation1);
            expect(result[0].annotations).toContainEqual(annotation2);
        });

        it('preserves existing annotations when merging', () => {
            const annotation1 = { ...mockAnnotation, id: '1' };
            const annotation2 = { ...mockAnnotation, id: '1' }; // Same ID
            
            const existingLayer = {
                ...mockLayer,
                annotations: [annotation1]
            };
            
            const importedLayer = {
                ...mockLayer,
                annotations: [annotation2]
            };

            const result = ExportImportManager.mergeLayers([existingLayer], [importedLayer]);
            
            expect(result).toHaveLength(1);
            expect(result[0].annotations).toHaveLength(1);
            expect(result[0].annotations[0]).toEqual(annotation1);
        });
    });
});
