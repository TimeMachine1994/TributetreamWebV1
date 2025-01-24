<script lang="ts">
import { createEventDispatcher } from 'svelte';
import type { Layer, LayerEvents } from '../types';
import { v4 as uuidv4 } from 'uuid';

const dispatch = createEventDispatcher<{
    layerAdd: { layer: Layer };
    layerRemove: { layerId: string };
    layerUpdate: { layer: Layer };
    activeLayerChange: { layerId: string | null };
}>();

export let layers: Layer[] = [];
export let activeLayerId: string | null = null;

function addLayer() {
    const newLayer: Layer = {
        id: uuidv4(),
        name: `Layer ${layers.length + 1}`,
        visible: true,
        locked: false,
        annotations: []
    };
    
    layers = [...layers, newLayer];
    dispatch('layerAdd', { layer: newLayer });
    
    if (!activeLayerId) {
        setActiveLayer(newLayer.id);
    }
}

function removeLayer(layerId: string) {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    layers = layers.filter(l => l.id !== layerId);
    dispatch('layerRemove', { layerId });
    
    if (activeLayerId === layerId) {
        setActiveLayer(layers[0]?.id ?? null);
    }
}

function updateLayer(layerId: string, updates: Partial<Layer>) {
    const index = layers.findIndex(l => l.id === layerId);
    if (index === -1) return;
    
    const updatedLayer = { ...layers[index], ...updates };
    layers[index] = updatedLayer;
    layers = [...layers];
    
    dispatch('layerUpdate', { layer: updatedLayer });
}

function setActiveLayer(layerId: string | null) {
    if (activeLayerId === layerId) return;
    
    activeLayerId = layerId;
    dispatch('activeLayerChange', { layerId });
}

function toggleVisibility(layerId: string) {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
        updateLayer(layerId, { visible: !layer.visible });
    }
}

function toggleLock(layerId: string) {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
        updateLayer(layerId, { locked: !layer.locked });
    }
}

function renameLayer(layerId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const newName = input.value.trim();
    
    if (newName) {
        updateLayer(layerId, { name: newName });
    }
}

// Drag and drop reordering
let draggedLayer: Layer | null = null;

function handleDragStart(layer: Layer, event: DragEvent) {
    draggedLayer = layer;
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
    }
}

function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
    }
}

function handleDrop(targetLayer: Layer) {
    if (!draggedLayer || draggedLayer.id === targetLayer.id) return;
    
    const oldIndex = layers.findIndex(l => l.id === draggedLayer!.id);
    const newIndex = layers.findIndex(l => l.id === targetLayer.id);
    
    layers.splice(oldIndex, 1);
    layers.splice(newIndex, 0, draggedLayer);
    layers = [...layers];
    
    draggedLayer = null;
}
</script>

<div class="layer-manager bg-white rounded-lg shadow-lg p-4">
    <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Layers</h2>
        <button
            class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
            on:click={addLayer}
        >
            Add Layer
        </button>
    </div>
    
    <div class="layers-list space-y-2">
        {#each layers as layer (layer.id)}
            <div
                class="layer-item flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors"
                class:active={layer.id === activeLayerId}
                draggable={true}
                on:dragstart={e => handleDragStart(layer, e)}
                on:dragover={handleDragOver}
                on:drop={() => handleDrop(layer)}
            >
                <!-- Visibility Toggle -->
                <button
                    class="visibility-toggle"
                    on:click={() => toggleVisibility(layer.id)}
                    title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                    <span class="text-xl">{layer.visible ? '👁️' : '👁️‍🗨️'}</span>
                </button>
                
                <!-- Lock Toggle -->
                <button
                    class="lock-toggle"
                    on:click={() => toggleLock(layer.id)}
                    title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                >
                    <span class="text-xl">{layer.locked ? '🔒' : '🔓'}</span>
                </button>
                
                <!-- Layer Name -->
                <input
                    type="text"
                    class="flex-grow bg-transparent px-2 py-1 rounded border border-transparent focus:border-blue-500 outline-none"
                    value={layer.name}
                    on:blur={e => renameLayer(layer.id, e)}
                    on:keydown={e => {
                        if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                            e.target.blur();
                        }
                    }}
                />
                
                <!-- Layer Selection -->
                <button
                    class="select-layer p-1 rounded hover:bg-blue-100"
                    on:click={() => setActiveLayer(layer.id)}
                    title="Select Layer"
                >
                    <div class="w-4 h-4 rounded-full border-2"
                        class:border-blue-500={layer.id === activeLayerId}
                        class:bg-blue-500={layer.id === activeLayerId}
                    />
                </button>
                
                <!-- Delete Layer -->
                <button
                    class="delete-layer text-red-500 hover:text-red-600"
                    on:click={() => removeLayer(layer.id)}
                    title="Delete Layer"
                >
                    ✕
                </button>
            </div>
        {/each}
    </div>
</div>

<style lang="postcss">
.layer-manager {
    min-width: 250px;
    max-width: 350px;
}

.layer-item {
    cursor: grab;
}

.layer-item:active {
    cursor: grabbing;
}

.layer-item.active {
    background-color: theme(colors.blue.50);
}

input:focus {
    background-color: theme(colors.white);
}

button {
    @apply transition-colors duration-200;
}

.visibility-toggle, .lock-toggle {
    @apply opacity-75 hover:opacity-100;
}
</style>
