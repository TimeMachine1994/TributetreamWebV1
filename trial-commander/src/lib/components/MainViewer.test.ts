import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import MainViewer from './MainViewer.svelte';
import type { ImageLoader } from '../ImageLoader';
import type { NavigationManager } from '../NavigationManager';
import { annotationStore } from '../stores/annotationStore';
import type { Annotation } from '../types';

describe('MainViewer', () => {
    let mockImageLoader: ImageLoader;
    let mockNavigationManager: NavigationManager;
    let mockAnnotations: Annotation[] = [];

    beforeEach(() => {
        // Setup mock image loader
        mockImageLoader = {
            cache: new Map(),
            cacheSize: 10,
            cacheTimeout: 5000,
            loadImage: vi.fn().mockResolvedValue(new Image()),
            clearCache: vi.fn()
        } as unknown as ImageLoader;

        // Setup mock navigation manager
        mockNavigationManager = {
            currentIndex: 0,
            images: ['test/image1.jpg', 'test/image2.jpg'],
            getCurrentImage: vi.fn().mockReturnValue('test/image.jpg'),
            nextImage: vi.fn().mockReturnValue(true),
            previousImage: vi.fn().mockReturnValue(true),
            hasNext: vi.fn().mockReturnValue(true),
            hasPrevious: vi.fn().mockReturnValue(true),
            getAllImages: vi.fn().mockReturnValue(['test/image1.jpg', 'test/image2.jpg']),
            jumpToImage: vi.fn(),
            setImages: vi.fn(),
            getCurrentIndex: vi.fn().mockReturnValue(0),
            getTotalImages: vi.fn().mockReturnValue(2)
        } as unknown as NavigationManager;

        // Reset mock annotations
        mockAnnotations = [];
        vi.spyOn(annotationStore, 'subscribe').mockImplementation((callback) => {
            callback({
                annotations: mockAnnotations,
                history: [],
                currentIndex: -1
            });
            return () => {};
        });
        vi.spyOn(annotationStore, 'addAnnotation').mockImplementation((annotation) => {
            mockAnnotations.push(annotation);
        });
    });

    it('renders without errors', () => {
        const { container } = render(MainViewer, {
            props: {
                imageLoader: mockImageLoader,
                navigationManager: mockNavigationManager
            }
        });
        expect(container).toBeTruthy();
    });

    it('handles error states correctly', async () => {
        const { container, getByText } = render(MainViewer, {
            props: {
                imageLoader: mockImageLoader,
                navigationManager: mockNavigationManager
            }
        });

        // Simulate error
        const error = new Error('Test error');
        const event = new CustomEvent('error', { detail: error });
        await fireEvent(container.querySelector('.viewer-content')!, event);

        // Check if error message is displayed
        expect(getByText('Test error')).toBeTruthy();

        // Check if dismiss button works
        const dismissButton = getByText('Dismiss');
        await fireEvent.click(dismissButton);
        expect(() => getByText('Test error')).toThrow();
    });

    it('syncs with annotation store', () => {
        render(MainViewer, {
            props: {
                imageLoader: mockImageLoader,
                navigationManager: mockNavigationManager
            }
        });

        expect(annotationStore.subscribe).toHaveBeenCalled();
    });

    it('handles annotation events correctly', async () => {
        const { container } = render(MainViewer, {
            props: {
                imageLoader: mockImageLoader,
                navigationManager: mockNavigationManager
            }
        });

        const annotationLayer = container.querySelector('.viewer-content')!;

        // Simulate annotation start
        await fireEvent(annotationLayer, new CustomEvent('annotationStart'));
        expect(container.querySelector('.annotation-layer')).toBeTruthy();

        // Simulate annotation end
        await fireEvent(annotationLayer, new CustomEvent('annotationEnd'));
        expect(container.querySelector('.annotation-layer.active')).toBeFalsy();
    });

    it('updates dimensions on resize', async () => {
        const { container } = render(MainViewer, {
            props: {
                imageLoader: mockImageLoader,
                navigationManager: mockNavigationManager
            }
        });

        const viewer = container.querySelector('.viewer-content')!;
        await fireEvent(viewer, new CustomEvent('resize', {
            detail: { width: 1000, height: 800 }
        }));

        const annotationLayer = container.querySelector('.annotation-layer');
        expect(annotationLayer?.getAttribute('width')).toBe('1000');
        expect(annotationLayer?.getAttribute('height')).toBe('800');
    });

    it('cleans up subscriptions on destroy', () => {
        const unsubscribeSpy = vi.fn();
        vi.spyOn(annotationStore, 'subscribe').mockReturnValue(unsubscribeSpy);

        const { component } = render(MainViewer, {
            props: {
                imageLoader: mockImageLoader,
                navigationManager: mockNavigationManager
            }
        });

        component.$destroy();
        expect(unsubscribeSpy).toHaveBeenCalled();
    });
});
