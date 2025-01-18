<script lang="ts">
    let selectedSquare: number | null = $state(null);
import SelectableSquares from '$lib/SelectableSquares.svelte';
    // Function to handle square selection
    function handleSquareClick(index: number) {
        selectedSquare = index;
    }
</script>

<style>
  /* Custom CSS for the 3D glass effect */
  .glass-square {
      backdrop-filter: blur(10px) saturate(150%);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), 0 8px 30px rgba(0, 0, 0, 0.1) inset;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
  }
  .glass-square:hover {
      transform: scale(1.1) translateZ(10px);
      box-shadow: 0 8px 20px rgba(255, 255, 255, 0.4), 0 12px 40px rgba(0, 0, 0, 0.2);
  }
</style>

<!-- Squares Layout -->
<div class="flex justify-center gap-8 p-8">
    {#each [0, 1, 2] as index}
        <div
            class={`w-[20vw] h-[20vw] glass-square ${
                selectedSquare === index
                    ? 'border-opacity-60' // Highlight selected square
                    : 'border-opacity-30'
            } ${
                index === 0
                    ? selectedSquare === index
                        ? 'bg-gradient-to-br from-gray-400 to-gray-200 bg-opacity-40'
                        : 'bg-gradient-to-br from-gray-600 to-gray-400 bg-opacity-20'
                    : selectedSquare === index
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-200 bg-opacity-40'
                    : 'bg-gradient-to-br from-yellow-600 to-yellow-400 bg-opacity-20'
            }`}
            on:click={() => handleSquareClick(index)}
        ></div>
    {/each}
</div>
<SelectableSquares />
