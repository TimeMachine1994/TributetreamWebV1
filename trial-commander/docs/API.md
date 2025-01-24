# Trial Commander API Documentation

## Table of Contents
1. [Image Management](#image-management)
2. [Bates System](#bates-system)
3. [Annotation System](#annotation-system)
4. [Performance Optimization](#performance-optimization)
5. [Integration Components](#integration-components)

## Image Management

### ImageLoader
The `ImageLoader` class provides efficient image loading with caching and error handling.

```typescript
import { ImageLoader } from '@lib/ImageLoader';

const loader = new ImageLoader({
    cacheSize: 100, // Maximum number of cached images
    timeout: 30000  // Load timeout in milliseconds
});

// Load an image
const image = await loader.load('path/to/image.jpg');

// Preload multiple images
await loader.preload(['image1.jpg', 'image2.jpg']);

// Clear cache
loader.clearCache();
```

### NavigationManager
Handles image navigation and state management.

```typescript
import { NavigationManager } from '@lib/NavigationManager';

const navigator = new NavigationManager();

// Navigate between images
await navigator.next();
await navigator.previous();
await navigator.jumpTo('EXH001'); // Jump to specific Bates number
```

## Bates System

### BatesManager
Manages Bates numbering and lookup.

```typescript
import { BatesManager } from '@lib/utils/BatesManager';

const manager = new BatesManager({
    prefix: 'EXH',
    padding: 3,
    startNumber: 1
});

// Generate Bates number
const batesNumber = manager.generateNumber(); // Returns 'EXH001'

// Look up file by Bates number
const file = manager.getFile('EXH001');
```

### BatesStore
Reactive store for Bates number management.

```typescript
import { batesStore } from '@lib/stores/batesStore';
import { get } from 'svelte/store';

// Subscribe to changes
batesStore.subscribe(state => {
    console.log('Current Bates number:', state.current);
});

// Update current Bates number
batesStore.setCurrent('EXH001');
```

## Annotation System

### AnnotationLayer
Canvas-based annotation component.

```svelte
<script>
import AnnotationLayer from '@lib/components/AnnotationLayer.svelte';

let annotations = [];
let scale = 1;
</script>

<AnnotationLayer
    {annotations}
    {scale}
    on:annotationCreated={handleNew}
    on:annotationUpdated={handleUpdate}
/>
```

### AnnotationStore
State management for annotations with undo/redo support.

```typescript
import { annotationStore } from '@lib/stores/annotationStore';

// Add annotation
annotationStore.add({
    type: 'drawing',
    points: [[0, 0], [100, 100]],
    style: { color: '#ff0000', width: 2 }
});

// Undo/Redo
annotationStore.undo();
annotationStore.redo();
```

## Performance Optimization

### CanvasOptimizer
Optimizes canvas rendering performance.

```typescript
import { CanvasOptimizer } from '@lib/utils/CanvasOptimizer';

const optimizer = new CanvasOptimizer(canvas, {
    throttleFPS: 60,
    useOffscreen: true,
    quality: 'high'
});

// Start optimization
optimizer.start();

// Update viewport
optimizer.updateViewport({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    scale: 1
});
```

### MemoryManager
Manages memory usage and resource cleanup.

```typescript
import { MemoryManager } from '@lib/utils/MemoryManager';

const manager = new MemoryManager({
    maxMemoryUsage: 0.8, // 80% of available memory
    cleanupInterval: 60000 // Cleanup every minute
});

// Register resource
manager.register('image1', imageData);

// Clean up resources
manager.cleanup();
```

### BatchManager
Handles state updates efficiently.

```typescript
import { BatchManager } from '@lib/utils/BatchManager';

const batchManager = new BatchManager({
    batchSize: 10,
    debounceTime: 16
});

// Register store
batchManager.registerStore(myStore);

// Batch updates
batchManager.update(() => {
    // Multiple store updates here
    myStore.update(state => ({ ...state, value: 1 }));
    myStore.update(state => ({ ...state, value: 2 }));
});
```

### LazyLoader
Provides progressive and priority-based loading.

```typescript
import { LazyLoader } from '@lib/utils/LazyLoader';

const loader = new LazyLoader();

// Load with priority
await loader.load('resource.jpg', {
    priority: 'high',
    quality: 'preview'
});

// Update viewport for prefetching
loader.updateViewport({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    scale: 1
});
```

### PerformanceMonitor
Monitors application performance metrics.

```typescript
import { PerformanceMonitor } from '@lib/utils/PerformanceMonitor';

const monitor = new PerformanceMonitor({
    sampleInterval: 1000,
    historySize: 60,
    warningThresholds: {
        fps: 30,
        memoryUsage: 0.9,
        loadTime: 2000,
        renderTime: 16
    }
});

// Get metrics
const metrics = monitor.getMetrics();
metrics.subscribe(data => {
    console.log('Current FPS:', data.fps);
});

// Check performance
const { meets, warnings } = monitor.checkPerformance();
```

## Integration Components

### MainViewer
Main component integrating all features.

```svelte
<script>
import MainViewer from '@lib/components/MainViewer.svelte';
import { PerformanceViewer } from '@lib/components/PerformanceViewer.svelte';

let monitor = new PerformanceMonitor();
</script>

<MainViewer />
<PerformanceViewer {monitor} />
```

## Best Practices

1. **Memory Management**
   - Always clean up resources when components are destroyed
   - Use LazyLoader for large image sets
   - Monitor memory usage with PerformanceMonitor

2. **Performance Optimization**
   - Use BatchManager for bulk state updates
   - Enable CanvasOptimizer for complex annotations
   - Monitor performance metrics in development

3. **Error Handling**
   - Implement error boundaries in components
   - Use try-catch blocks with async operations
   - Handle loading failures gracefully

4. **State Management**
   - Use stores for shared state
   - Implement undo/redo for user actions
   - Batch related state updates

5. **Testing**
   - Write unit tests for all components
   - Include integration tests for workflows
   - Test performance under load

## Common Issues

1. **High Memory Usage**
   ```typescript
   // Bad
   const images = await Promise.all(urls.map(url => loader.load(url)));

   // Good
   const images = await loader.load(urls[0], { priority: 'high' });
   loader.preload(urls.slice(1), { priority: 'low' });
   ```

2. **Poor Performance**
   ```typescript
   // Bad
   annotations.forEach(a => store.update(state => [...state, a]));

   // Good
   batchManager.update(() => {
       store.update(state => [...state, ...annotations]);
   });
   ```

3. **Memory Leaks**
   ```typescript
   // Bad
   class Component {
       constructor() {
           this.subscription = store.subscribe(/* ... */);
       }
   }

   // Good
   class Component {
       constructor() {
           this.subscription = store.subscribe(/* ... */);
       }
       
       destroy() {
           this.subscription();
       }
   }
   ```

## Support

For issues and feature requests, please use the GitHub issue tracker. For urgent support, contact the development team through the official channels.
