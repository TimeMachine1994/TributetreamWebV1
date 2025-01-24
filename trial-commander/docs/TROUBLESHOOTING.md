# Troubleshooting Guide

## Table of Contents
1. [Performance Issues](#performance-issues)
2. [Memory Problems](#memory-problems)
3. [Canvas Rendering Issues](#canvas-rendering-issues)
4. [State Management Problems](#state-management-problems)
5. [Resource Loading Failures](#resource-loading-failures)
6. [Common Error Messages](#common-error-messages)

## Performance Issues

### Low FPS

**Symptoms**
- Choppy animations
- Slow response to interactions
- FPS counter showing < 30 FPS

**Possible Causes**
1. Too many annotations being rendered
2. Large images not properly optimized
3. Heavy state updates

**Solutions**
```typescript
// 1. Enable canvas optimization
const optimizer = new CanvasOptimizer(canvas, {
    useOffscreen: true,
    quality: 'balanced'
});

// 2. Implement viewport culling
optimizer.updateViewport({
    x: scrollX,
    y: scrollY,
    width: viewportWidth,
    height: viewportHeight
});

// 3. Batch state updates
batchManager.update(() => {
    // Combine multiple updates
});
```

### Slow Initial Loading

**Symptoms**
- Long white screen on startup
- Delayed image display
- High initial memory usage

**Solutions**
```typescript
// 1. Implement progressive loading
const loader = new LazyLoader({
    initialQuality: 'preview',
    progressiveUpgrade: true
});

// 2. Prioritize visible content
loader.setLoadPriority(visibleImages, 'high');
loader.setLoadPriority(offscreenImages, 'low');

// 3. Enable caching
loader.enableCache({
    maxSize: 100,
    persistent: true
});
```

## Memory Problems

### Memory Leaks

**Symptoms**
- Increasing memory usage over time
- Performance degradation
- Browser tab crashes

**Common Causes**
1. Uncleaned event listeners
2. Retained references to disposed components
3. Unclosed resources

**Solutions**
```typescript
// 1. Proper cleanup in components
onDestroy(() => {
    // Unsubscribe from stores
    unsubscribe();
    
    // Clean up resources
    memoryManager.cleanup();
    
    // Dispose canvases
    canvasPool.dispose();
    
    // Remove event listeners
    element.removeEventListener('event', handler);
});

// 2. Register resources for automatic cleanup
memoryManager.register('resource', {
    data: resourceData,
    onDispose: () => cleanup(),
    maxAge: 300000
});

// 3. Use weak references for caches
const cache = new WeakMap();
cache.set(key, value);
```

### High Memory Usage

**Symptoms**
- Slow performance
- Browser warnings
- Frequent garbage collection

**Solutions**
```typescript
// 1. Implement resource pooling
const pool = new ResourcePool({
    maxSize: 10,
    itemLifetime: 60000
});

// 2. Use streaming for large datasets
const stream = new DataStream({
    chunkSize: 1000,
    prefetchCount: 2
});

// 3. Clear unused resources
memoryManager.clearUnused({
    olderThan: 300000,
    unusedOnly: true
});
```

## Canvas Rendering Issues

### Blurry Images

**Symptoms**
- Fuzzy or pixelated display
- Poor quality on high DPI screens
- Blurry text rendering

**Solutions**
```typescript
// 1. Handle device pixel ratio
function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
}

// 2. Use appropriate image scaling
optimizer.setScaling({
    method: 'high',
    smoothing: true
});

// 3. Enable quality mode for text
ctx.textRendering = 'geometricPrecision';
```

### Annotation Rendering Issues

**Symptoms**
- Misaligned annotations
- Flickering during pan/zoom
- Missing annotations

**Solutions**
```typescript
// 1. Coordinate space transformation
function transformCoordinates(point, transform) {
    return {
        x: (point.x - transform.x) * transform.scale,
        y: (point.y - transform.y) * transform.scale
    };
}

// 2. Double buffering for smooth rendering
const buffer = new OffscreenCanvas(width, height);
const bufferCtx = buffer.getContext('2d');

// Draw to buffer first
bufferCtx.drawImage(/* ... */);

// Then copy to main canvas
ctx.drawImage(buffer, 0, 0);
```

## State Management Problems

### State Synchronization Issues

**Symptoms**
- Inconsistent UI state
- Out-of-sync components
- Unexpected behavior after updates

**Solutions**
```typescript
// 1. Use atomic updates
batchManager.transaction(async () => {
    await store1.update(/* ... */);
    await store2.update(/* ... */);
    await saveState();
});

// 2. Implement state validation
function validateState(state) {
    if (!isValid(state)) {
        throw new Error('Invalid state');
    }
    return state;
}

// 3. Add state logging
const debugStore = writable(initialState, (set) => {
    return store.subscribe(state => {
        console.log('State updated:', state);
        set(state);
    });
});
```

## Resource Loading Failures

### Image Load Failures

**Symptoms**
- Missing images
- Error placeholders
- Timeout errors

**Solutions**
```typescript
// 1. Implement retry logic
const loader = new LazyLoader({
    retries: 3,
    retryDelay: 1000,
    timeout: 10000
});

// 2. Add fallback handling
loader.onError(async (error, resource) => {
    if (error.type === 'timeout') {
        return await loader.loadFallback(resource);
    }
    return defaultPlaceholder;
});

// 3. Progressive enhancement
async function loadImage(url) {
    try {
        // Try loading optimized version
        return await loader.load(url, { optimized: true });
    } catch {
        // Fall back to original
        return await loader.load(url, { optimized: false });
    }
}
```

## Common Error Messages

### "Maximum call stack size exceeded"

**Cause**: Infinite recursion in state updates or rendering

**Solution**
```typescript
// 1. Add update guards
let updating = false;
function safeUpdate(fn) {
    if (updating) return;
    updating = true;
    try {
        fn();
    } finally {
        updating = false;
    }
}

// 2. Use debouncing
const debouncedUpdate = debounce((value) => {
    store.update(s => ({ ...s, value }));
}, 16);
```

### "Cannot read property 'x' of undefined"

**Cause**: Accessing properties before data is loaded

**Solution**
```typescript
// 1. Add null checks
function safeAccess(obj, ...path) {
    return path.reduce((acc, key) => 
        acc && acc[key], obj);
}

// 2. Use default values
const value = data?.property ?? defaultValue;

// 3. Add loading states
{#if loading}
    <LoadingSpinner />
{:else if error}
    <ErrorMessage {error} />
{:else}
    <Content {data} />
{/if}
```

### "Canvas context lost"

**Cause**: GPU context loss or memory pressure

**Solution**
```typescript
// 1. Handle context loss
canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    handleContextLoss();
});

// 2. Implement recovery
canvas.addEventListener('webglcontextrestored', () => {
    restoreContext();
    redraw();
});

// 3. Use context loss manager
const manager = new ContextLossManager(canvas, {
    onLoss: handleLoss,
    onRestore: handleRestore,
    maxRetries: 3
});
```

## Debugging Tools

### Performance Monitoring
```typescript
// Enable detailed monitoring
const monitor = new PerformanceMonitor({
    detailed: true,
    logLevel: 'debug'
});

// Add performance marks
monitor.mark('operationStart');
// ... operation ...
monitor.measure('operationDuration', 'operationStart');
```

### State Debugging
```typescript
// Enable state debugging
const debugStore = createDebugStore(store, {
    name: 'mainStore',
    logActions: true,
    persistLogs: true
});

// Add state snapshots
debugStore.snapshot('beforeOperation');
// ... operation ...
debugStore.snapshot('afterOperation');

// Compare snapshots
debugStore.diff('beforeOperation', 'afterOperation');
```

### Error Reporting
```typescript
// Configure error reporting
const reporter = new ErrorReporter({
    detailed: true,
    includeState: true,
    onError: async (error) => {
        await logToServer(error);
        notifyDevelopers(error);
    }
});

// Track error patterns
reporter.trackPattern({
    pattern: 'ContextLost',
    threshold: 3,
    timeWindow: 300000
});
```

## Support Resources

1. **Documentation**
   - API Reference: `/docs/API.md`
   - Performance Guidelines: `/docs/PERFORMANCE.md`
   - Implementation Guide: `/docs/IMPLEMENTATION.md`

2. **Issue Tracking**
   - GitHub Issues: Report bugs and feature requests
   - Project Board: Track issue status and priorities

3. **Development Tools**
   - Performance Profiler: `/tools/profiler`
   - Debug Console: Built-in browser tools
   - State Inspector: Development overlay
