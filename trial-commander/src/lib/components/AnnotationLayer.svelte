<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { v4 as uuidv4 } from 'uuid';

import type { Point, Annotation } from '$lib/types';

export let width = 900;
export let height = 600;
export let scale = 1;
export let annotations: Annotation[] = [];
export let currentAnnotation: Annotation | null = null;
export let isDrawing = false;

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let currentStyle = {
  color: '#ff0000',
  width: 2,
  opacity: 1
};

onMount(() => {
  ctx = canvas.getContext('2d')!;
  setupCanvas();
  drawAnnotations();
});

function setupCanvas() {
  canvas.width = width;
  canvas.height = height;
  ctx.scale(scale, scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function startDrawing(event: MouseEvent) {
  isDrawing = true;
  const point = getCanvasPoint(event);
  
  currentAnnotation = {
    id: uuidv4(),
    type: 'drawing',
    points: [point],
    style: { ...currentStyle }
  };
}

function draw(event: MouseEvent) {
  if (!isDrawing || !currentAnnotation) return;
  
  const point = getCanvasPoint(event);
  currentAnnotation.points.push(point);
  
  // Clear and redraw
  ctx.clearRect(0, 0, width, height);
  drawAnnotations();
  drawCurrentAnnotation();
}

function stopDrawing() {
  if (currentAnnotation && currentAnnotation.points.length > 1) {
    annotations = [...annotations, currentAnnotation];
  }
  isDrawing = false;
  currentAnnotation = null;
}

function getCanvasPoint(event: MouseEvent): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / scale,
    y: (event.clientY - rect.top) / scale
  };
}

function drawAnnotations() {
  annotations.forEach(drawAnnotation);
}

function drawAnnotation(annotation: Annotation) {
  ctx.beginPath();
  ctx.strokeStyle = annotation.style.color || currentStyle.color;
  ctx.lineWidth = annotation.style.width || currentStyle.width;
  ctx.globalAlpha = annotation.style.opacity || currentStyle.opacity;
  
  const [first, ...rest] = annotation.points;
  ctx.moveTo(first.x, first.y);
  
  rest.forEach(point => {
    ctx.lineTo(point.x, point.y);
  });
  
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawCurrentAnnotation() {
  if (currentAnnotation) {
    drawAnnotation(currentAnnotation);
  }
}

// Expose methods for external control
export function setStyle(style: Partial<typeof currentStyle>) {
  currentStyle = { ...currentStyle, ...style };
}

export function clear() {
  annotations = [];
  ctx.clearRect(0, 0, width, height);
}

// Clean up
onDestroy(() => {
  canvas = null!;
  ctx = null!;
});
</script>

<canvas
  bind:this={canvas}
  on:mousedown={startDrawing}
  on:mousemove={draw}
  on:mouseup={stopDrawing}
  on:mouseleave={stopDrawing}
  class="cursor-crosshair"
/>

<style>
canvas {
  border: 1px solid #ccc;
  touch-action: none;
}
</style>
