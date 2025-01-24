<script lang="ts">
import type { ToolType } from '../types';
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher<{
    toolChange: { type: ToolType };
    styleChange: { color: string; width: number; opacity: number };
}>();

export let currentTool: ToolType = 'pan';
export let color = '#FF0000';
export let lineWidth = 2;
export let opacity = 1;

const tools: { type: ToolType; label: string; icon: string }[] = [
    { type: 'pan', label: 'Pan Tool', icon: '🖐️' },
    { type: 'draw', label: 'Draw Tool', icon: '✏️' },
    { type: 'shape', label: 'Shape Tool', icon: '⬜' },
    { type: 'text', label: 'Text Tool', icon: 'T' }
];

function selectTool(type: ToolType) {
    currentTool = type;
    dispatch('toolChange', { type });
}

function updateColor(event: Event) {
    color = (event.target as HTMLInputElement).value;
    dispatchStyleChange();
}

function updateLineWidth(event: Event) {
    lineWidth = Number((event.target as HTMLInputElement).value);
    dispatchStyleChange();
}

function updateOpacity(event: Event) {
    opacity = Number((event.target as HTMLInputElement).value);
    dispatchStyleChange();
}

function dispatchStyleChange() {
    dispatch('styleChange', { color, width: lineWidth, opacity });
}
</script>

<div class="toolbar flex flex-col gap-4 bg-white p-4 shadow-lg rounded-lg">
    <!-- Tool Selection -->
    <div class="tool-buttons grid grid-cols-2 gap-2">
        {#each tools as tool}
            <button
                class="tool-button p-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                class:active={currentTool === tool.type}
                on:click={() => selectTool(tool.type)}
                title={tool.label}
            >
                <span class="text-xl">{tool.icon}</span>
                <span class="text-sm">{tool.label}</span>
            </button>
        {/each}
    </div>

    <!-- Style Controls -->
    <div class="style-controls space-y-4">
        <!-- Color Picker -->
        <div class="control-group">
            <label for="color" class="block text-sm font-medium mb-1">Color</label>
            <input
                type="color"
                id="color"
                bind:value={color}
                on:input={updateColor}
                class="w-full h-8 rounded cursor-pointer"
            />
        </div>

        <!-- Line Width -->
        <div class="control-group">
            <label for="lineWidth" class="block text-sm font-medium mb-1">
                Line Width: {lineWidth}px
            </label>
            <input
                type="range"
                id="lineWidth"
                min="1"
                max="20"
                step="1"
                bind:value={lineWidth}
                on:input={updateLineWidth}
                class="w-full"
            />
        </div>

        <!-- Opacity -->
        <div class="control-group">
            <label for="opacity" class="block text-sm font-medium mb-1">
                Opacity: {Math.round(opacity * 100)}%
            </label>
            <input
                type="range"
                id="opacity"
                min="0"
                max="1"
                step="0.1"
                bind:value={opacity}
                on:input={updateOpacity}
                class="w-full"
            />
        </div>
    </div>
</div>

<style lang="postcss">
.toolbar {
    min-width: 200px;
    border: 1px solid theme(colors.gray.200);
}

.tool-button {
    background-color: theme(colors.gray.100);
    border: 1px solid theme(colors.gray.300);
}

.tool-button:hover {
    background-color: theme(colors.gray.200);
}

.tool-button.active {
    background-color: theme(colors.blue.500);
    color: white;
    border-color: theme(colors.blue.600);
}

input[type="range"] {
    @apply appearance-none bg-gray-200 h-2 rounded-full;
}

input[type="range"]::-webkit-slider-thumb {
    @apply appearance-none w-4 h-4 rounded-full bg-blue-500 cursor-pointer;
}

input[type="range"]::-moz-range-thumb {
    @apply w-4 h-4 rounded-full bg-blue-500 cursor-pointer border-none;
}
</style>
