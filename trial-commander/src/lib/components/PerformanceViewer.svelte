<!-- Performance monitoring visualization component -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { PerformanceMonitor, PerformanceMetrics } from '../utils/PerformanceMonitor';

    export let monitor: PerformanceMonitor;
    export let expanded = false;

    let metrics: PerformanceMetrics;
    let unsubscribe: () => void;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let animationFrame: number;

    const CHART_HEIGHT = 100;
    const CHART_WIDTH = 200;
    const HISTORY_POINTS = 60; // Show last 60 samples
    const WARNING_COLOR = '#ff4444';
    const NORMAL_COLOR = '#44ff44';

    onMount(() => {
        // Subscribe to metrics updates
        unsubscribe = monitor.getMetrics().subscribe(value => {
            metrics = value;
            if (expanded) {
                requestAnimationFrame(drawCharts);
            }
        });

        // Initialize canvas
        ctx = canvas.getContext('2d')!;
        canvas.width = CHART_WIDTH;
        canvas.height = CHART_HEIGHT;

        // Start animation loop if expanded
        if (expanded) {
            startAnimation();
        }
    });

    onDestroy(() => {
        unsubscribe?.();
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    });

    function startAnimation() {
        const animate = () => {
            drawCharts();
            animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }

    function stopAnimation() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    }

    function drawCharts() {
        if (!ctx || !metrics) return;

        // Clear canvas
        ctx.clearRect(0, 0, CHART_WIDTH, CHART_HEIGHT);

        // Draw FPS chart
        const history = monitor.getHistory();
        const fpsData = history.map(h => h.metrics.fps);
        drawLineChart(fpsData, 60, WARNING_COLOR, NORMAL_COLOR);

        // Draw memory usage
        const memoryUsage = metrics.memory.used / metrics.memory.total;
        drawMemoryBar(memoryUsage);

        // Draw operation counts
        drawOperationStats();
    }

    function drawLineChart(data: number[], max: number, warningColor: string, normalColor: string) {
        if (!ctx) return;

        const width = CHART_WIDTH;
        const height = CHART_HEIGHT * 0.4;
        const step = width / (HISTORY_POINTS - 1);

        ctx.beginPath();
        ctx.strokeStyle = normalColor;
        ctx.lineWidth = 2;

        data.forEach((value, i) => {
            const x = i * step;
            const y = height - (value / max) * height;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    function drawMemoryBar(usage: number) {
        if (!ctx) return;

        const width = CHART_WIDTH;
        const height = 20;
        const y = CHART_HEIGHT * 0.5;

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(0, y, width, height);

        // Usage bar
        ctx.fillStyle = usage > 0.8 ? WARNING_COLOR : NORMAL_COLOR;
        ctx.fillRect(0, y, width * usage, height);

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(usage * 100)}% Memory`, width / 2, y + 15);
    }

    function drawOperationStats() {
        if (!ctx || !metrics) return;

        const y = CHART_HEIGHT * 0.7;
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';

        const { success, failed, pending } = metrics.operations;
        ctx.fillText(`✓ ${success} ⚠ ${failed} ⋯ ${pending}`, 10, y);
    }

    $: if (expanded) {
        startAnimation();
    } else {
        stopAnimation();
    }
</script>

<div class="performance-viewer" class:expanded>
    <div class="header" on:click={() => expanded = !expanded}>
        <span class="title">Performance Monitor</span>
        {#if metrics}
            <span class="fps" class:warning={metrics.fps < 30}>
                {metrics.fps} FPS
            </span>
        {/if}
    </div>

    {#if expanded}
        <div class="content">
            <canvas
                bind:this={canvas}
                width={CHART_WIDTH}
                height={CHART_HEIGHT}
            />
            
            <div class="metrics">
                {#if metrics}
                    <div class="metric">
                        <span>Load Time:</span>
                        <span class:warning={metrics.timing.loadTime > 2000}>
                            {metrics.timing.loadTime.toFixed(0)}ms
                        </span>
                    </div>
                    <div class="metric">
                        <span>Render Time:</span>
                        <span class:warning={metrics.timing.renderTime > 16}>
                            {metrics.timing.renderTime.toFixed(1)}ms
                        </span>
                    </div>
                    <div class="metric">
                        <span>Resources:</span>
                        <span>
                            {metrics.resources.images} images,
                            {metrics.resources.annotations} annotations
                        </span>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .performance-viewer {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 4px;
        color: white;
        font-family: monospace;
        z-index: 1000;
        min-width: 200px;
    }

    .header {
        padding: 0.5rem 1rem;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .title {
        font-weight: bold;
    }

    .content {
        padding: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .metrics {
        margin-top: 1rem;
    }

    .metric {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }

    .warning {
        color: #ff4444;
    }

    canvas {
        width: 100%;
        height: auto;
    }
</style>
