<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { ImageLoader } from '../ImageLoader';
  import type { NavigationManager } from '../NavigationManager';
  import { batesStore, batesIndex } from '../stores/batesStore';

  export let imageLoader: ImageLoader;
  export let navigationManager: NavigationManager;

  let currentBatesNumber: string | null = null;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let currentImage: HTMLImageElement | null = null;
  
  // View state
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  // Constants
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 5;
  const ZOOM_SPEED = 0.1;

  onMount(async () => {
    ctx = canvas.getContext('2d')!;
    await loadCurrentImage();
    
    // Set initial canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  });

  onDestroy(() => {
    window.removeEventListener('resize', resizeCanvas);
  });

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    drawImage();
  }

  async function loadCurrentImage() {
    const imagePath = navigationManager.getCurrentImage();
    if (imagePath) {
      try {
        currentImage = await imageLoader.loadImage(imagePath);
        // Update current Bates number
        $batesStore.getBatesNumberForFile(imagePath);
        currentBatesNumber = $batesStore.getBatesNumberForFile(imagePath);
        resetView();
        drawImage();
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    }
  }

  // Initialize Bates index when images are loaded
  $: {
    const allImages = navigationManager.getAllImages();
    if (allImages && allImages.length > 0) {
      batesStore.initializeIndex(allImages);
    }
  }

  function resetView() {
    if (!currentImage || !canvas) return;
    
    // Calculate scale to fit image in canvas
    const scaleX = canvas.width / currentImage.width;
    const scaleY = canvas.height / currentImage.height;
    scale = Math.min(scaleX, scaleY);
    
    // Center image
    offsetX = (canvas.width - currentImage.width * scale) / 2;
    offsetY = (canvas.height - currentImage.height * scale) / 2;
  }

  function drawImage() {
    if (!ctx || !currentImage) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.drawImage(currentImage, 0, 0);
    ctx.restore();
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    
    const delta = -Math.sign(event.deltaY) * ZOOM_SPEED;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
    
    if (newScale !== scale) {
      // Calculate zoom center
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      // Adjust offset to zoom around mouse position
      offsetX = mouseX - (mouseX - offsetX) * (newScale / scale);
      offsetY = mouseY - (mouseY - offsetY) * (newScale / scale);
      
      scale = newScale;
      drawImage();
    }
  }

  function handleMouseDown(event: MouseEvent) {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isDragging) return;
    
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;
    
    offsetX += deltaX;
    offsetY += deltaY;
    
    lastX = event.clientX;
    lastY = event.clientY;
    
    drawImage();
  }

  function handleMouseUp() {
    isDragging = false;
  }

  async function nextImage() {
    if (navigationManager.nextImage()) {
      await loadCurrentImage();
    }
  }

  async function previousImage() {
    if (navigationManager.previousImage()) {
      await loadCurrentImage();
    }
  }

  $: canGoNext = navigationManager.hasNext();
  $: canGoPrevious = navigationManager.hasPrevious();
</script>

<div class="image-viewer">
  <canvas
    bind:this={canvas}
    on:wheel={handleWheel}
    on:mousedown={handleMouseDown}
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
    on:mouseleave={handleMouseUp}
  />
  
  {#if currentBatesNumber}
    <div class="bates-number">
      {currentBatesNumber}
    </div>
  {/if}
  
  <div class="controls">
    <button 
      on:click={previousImage} 
      disabled={!canGoPrevious}
      class:disabled={!canGoPrevious}
    >
      Previous
    </button>
    <button 
      on:click={nextImage} 
      disabled={!canGoNext}
      class:disabled={!canGoNext}
    >
      Next
    </button>
  </div>
</div>

<style>
  .image-viewer {
    width: 100%;
    height: 100%;
    position: relative;
    background: #f0f0f0;
    overflow: hidden;
  }

  .bates-number {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 1.1rem;
    z-index: 10;
  }

  canvas {
    width: 100%;
    height: 100%;
    cursor: grab;
  }

  canvas:active {
    cursor: grabbing;
  }

  .controls {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.8);
    padding: 0.5rem;
    border-radius: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    background: #007bff;
    color: white;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  button:hover:not(.disabled) {
    opacity: 0.8;
  }

  button.disabled {
    background: #ccc;
    cursor: not-allowed;
  }
</style>
