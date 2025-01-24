import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ToolbarComponent from './ToolbarComponent.svelte';
import type { ToolType } from '../types';

describe('ToolbarComponent', () => {
    it('renders all tools', () => {
        const { getByTitle } = render(ToolbarComponent);
        
        expect(getByTitle('Pan Tool')).toBeTruthy();
        expect(getByTitle('Draw Tool')).toBeTruthy();
        expect(getByTitle('Shape Tool')).toBeTruthy();
        expect(getByTitle('Text Tool')).toBeTruthy();
    });

    it('handles tool selection', async () => {
        const { getByTitle, component } = render(ToolbarComponent);
        const mockToolChange = vi.fn();
        
        component.$on('toolChange', mockToolChange);
        
        const drawTool = getByTitle('Draw Tool');
        await fireEvent.click(drawTool);
        
        expect(mockToolChange).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: { type: 'draw' }
            })
        );
        expect(component.currentTool).toBe('draw');
    });

    it('updates color and dispatches style change', async () => {
        const { getByLabelText, component } = render(ToolbarComponent);
        const mockStyleChange = vi.fn();
        
        component.$on('styleChange', mockStyleChange);
        
        const colorInput = getByLabelText('Color') as HTMLInputElement;
        await fireEvent.input(colorInput, { target: { value: '#00FF00' } });
        
        expect(mockStyleChange).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: expect.objectContaining({
                    color: '#00FF00'
                })
            })
        );
    });

    it('updates line width and dispatches style change', async () => {
        const { getByLabelText, component } = render(ToolbarComponent);
        const mockStyleChange = vi.fn();
        
        component.$on('styleChange', mockStyleChange);
        
        const widthInput = getByLabelText(/Line Width/i) as HTMLInputElement;
        await fireEvent.input(widthInput, { target: { value: '5' } });
        
        expect(mockStyleChange).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: expect.objectContaining({
                    width: 5
                })
            })
        );
    });

    it('updates opacity and dispatches style change', async () => {
        const { getByLabelText, component } = render(ToolbarComponent);
        const mockStyleChange = vi.fn();
        
        component.$on('styleChange', mockStyleChange);
        
        const opacityInput = getByLabelText(/Opacity/i) as HTMLInputElement;
        await fireEvent.input(opacityInput, { target: { value: '0.5' } });
        
        expect(mockStyleChange).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: expect.objectContaining({
                    opacity: 0.5
                })
            })
        );
    });

    it('shows active state for selected tool', () => {
        const { getByTitle } = render(ToolbarComponent, {
            props: { currentTool: 'draw' }
        });
        
        const drawTool = getByTitle('Draw Tool');
        expect(drawTool.classList.contains('active')).toBe(true);
        expect(getByTitle('Pan Tool').classList.contains('active')).toBe(false);
    });

    it('maintains tool state between renders', async () => {
        const { getByTitle, component } = render(ToolbarComponent);
        
        const drawTool = getByTitle('Draw Tool');
        await fireEvent.click(drawTool);
        
        expect(component.currentTool).toBe('draw');
        
        component.$set({ color: '#0000FF' });
        expect(component.currentTool).toBe('draw');
    });
});
