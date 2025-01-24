<script lang="ts">
import ImageViewer from './ImageViewer.svelte';
import AnnotationLayer from './AnnotationLayer.svelte';
import { batesStore } from '../stores/batesStore';
import { annotationStore } from '../stores/annotationStore';
import type { ImageLoader } from '../ImageLoader';
import type { NavigationManager } from '../NavigationManager';
import type { Point, Annotation } from '../types';
import { onMount, onDestroy } from 'svelte';

// Component props
export let imageLoader: ImageLoader;
export let navigationManager: NavigationManager;

// State management
let scale = 1;
let width = 900;
let height = 600;
let annotations: Annotation[] = [];
let currentAnnotation: Annotation | null = null;
let isDrawing = false;
let errorMessage: string | null = null;

let annotationStyle = {
    color: '#FF0000',
    width: 2,
    opacity: 1
};

// Subscribe to annotation store
let unsubscribe: () => void;
onMount(() => {
    unsubscribe = annotationStore.subscribe(store => {
        annotations = store.annotations;
    });
});

onDestroy(() => {
    if (unsubscribe) {
        unsubscribe();
    }
});

// Handle annotation events
function handleAnnotationStart() {
    isDrawing = true;
}

function handleAnnotationEnd() {
    isDrawing = false;
    if (currentAnnotation) {
        annotationStore.addAnnotation(currentAnnotation);
        currentAnnotation = null;
    }
}

// Error handling
function handleError(error: Error) {
    errorMessage = error.message;
    console.error('Component error:', error);
}

// Update annotation style
function updateAnnotationStyle(style: Partial<typeof annotationStyle>) {
    annotationStyle = { ...annotationStyle, ...style };
}

// Handle viewer events
function handleZoom(event: CustomEvent<number>) {
    scale = event.detail;
}

function handleResize(event: CustomEvent<{ width: number; height: number }>) {
    width = event.detail.width;
    height = event.detail.height;
}
</script>

<div class="viewer-container relative w-full h-full" role="main">
    {#if errorMessage}
        <div class="error-message absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
            {errorMessage}
            <button class="ml-2 underline" on:click={() => errorMessage = null}>Dismiss</button>
        </div>
    {/if}

    <div class="viewer-content relative w-full h-full">
        <ImageViewer
            {imageLoader}
            {navigationManager}
            on:error={e => handleError(e.detail)}
        />

        <AnnotationLayer
            {width}
            {height}
            {scale}
            {annotations}
            {currentAnnotation}
            {isDrawing}
            setStyle={updateAnnotationStyle}
            on:annotationStart={handleAnnotationStart}
            on:annotationEnd={handleAnnotationEnd}
            on:error={e => handleError(e.detail)}
        />
    </div>
</div>

<style lang="postcss">
.viewer-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
}

.viewer-content {
    width: 100%;
    height: 100%;
    position: relative;
}

.error-message {
    z-index: 1000;
}
</style>
