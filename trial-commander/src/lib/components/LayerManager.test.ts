import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import LayerManager from './LayerManager.svelte';
import type { Layer } from '../types';

describe('LayerManager', () => {
    let mockLayers: Layer[];
    
    beforeEach(() => {
        mockLayers = [
            {
                id: '1',
                name: 'Layer 1',
                visible: true,
                locked: false,
                annotations: []
            },
            {
                id: '2',
                name: 'Layer 2',
                visible: true,
                locked: false,
                annotations: []
            }
        ];
    });

    it('renders all layers', () => {
        const { getByDisplayValue } = render(LayerManager, {
            props: { layers: mockLayers, activeLayerId: '1' }
        });
        
        expect(getByDisplayValue('Layer 1')).toBeTruthy();
        expect(getByDisplayValue('Layer 2')).toBeTruthy();
    });

    it('adds new layer', async () => {
        const { getByText, component } = render(LayerManager, {
            props: { layers: [...mockLayers] }
        });
        
        const mockLayerAdd = vi.fn();
        component.$on('layerAdd', mockLayerAdd);
        
        await fireEvent.click(getByText('Add Layer'));
        
        expect(mockLayerAdd).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: expect.objectContaining({
                    layer: expect.objectContaining({
                        name: 'Layer 3',
                        visible: true,
                        locked: false
                    })
                })
            })
        );
    });

    it('removes layer', async () => {
        const { getAllByTitle, component } = render(LayerManager, {
            props: { layers: [...mockLayers] }
        });
        
        const mockLayerRemove = vi.fn();
        component.$on('layerRemove', mockLayerRemove);
        
        const deleteButtons = getAllByTitle('Delete Layer');
        await fireEvent.click(deleteButtons[0]);
        
        expect(mockLayerRemove).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: { layerId: '1' }
            })
        );
    });

    it('toggles layer visibility', async () => {
        const { getAllByTitle, component } = render(LayerManager, {
            props: { layers: [...mockLayers] }
        });
        
        const mockLayerUpdate = vi.fn();
        component.$on('layerUpdate', mockLayerUpdate);
        
        const visibilityButtons = getAllByTitle('Hide Layer');
        await fireEvent.click(visibilityButtons[0]);
        
        expect(mockLayerUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: {
                    layer: expect.objectContaining({
                        id: '1',
                        visible: false
                    })
                }
            })
        );
    });

    it('toggles layer lock', async () => {
        const { getAllByTitle, component } = render(LayerManager, {
            props: { layers: [...mockLayers] }
        });
        
        const mockLayerUpdate = vi.fn();
        component.$on('layerUpdate', mockLayerUpdate);
        
        const lockButtons = getAllByTitle('Lock Layer');
        await fireEvent.click(lockButtons[0]);
        
        expect(mockLayerUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: {
                    layer: expect.objectContaining({
                        id: '1',
                        locked: true
                    })
                }
            })
        );
    });

    it('renames layer', async () => {
        const { getByDisplayValue, component } = render(LayerManager, {
            props: { layers: [...mockLayers] }
        });
        
        const mockLayerUpdate = vi.fn();
        component.$on('layerUpdate', mockLayerUpdate);
        
        const input = getByDisplayValue('Layer 1') as HTMLInputElement;
        input.value = 'Renamed Layer';
        await fireEvent.blur(input);
        
        expect(mockLayerUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: {
                    layer: expect.objectContaining({
                        id: '1',
                        name: 'Renamed Layer'
                    })
                }
            })
        );
    });

    it('sets active layer', async () => {
        const { getAllByTitle, component } = render(LayerManager, {
            props: { layers: [...mockLayers], activeLayerId: null }
        });
        
        const mockActiveLayerChange = vi.fn();
        component.$on('activeLayerChange', mockActiveLayerChange);
        
        const selectButtons = getAllByTitle('Select Layer');
        await fireEvent.click(selectButtons[0]);
        
        expect(mockActiveLayerChange).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: { layerId: '1' }
            })
        );
    });

    it('handles drag and drop reordering', async () => {
        const { container } = render(LayerManager, {
            props: { layers: [...mockLayers] }
        });
        
        const layerItems = container.querySelectorAll('.layer-item');
        const firstLayer = layerItems[0];
        const secondLayer = layerItems[1];
        
        // Simulate drag and drop
        await fireEvent.dragStart(firstLayer);
        await fireEvent.dragOver(secondLayer);
        await fireEvent.drop(secondLayer);
        
        const updatedLayerNames = Array.from(container.querySelectorAll('input'))
            .map(input => input.value);
        
        expect(updatedLayerNames).toEqual(['Layer 2', 'Layer 1']);
    });
});
