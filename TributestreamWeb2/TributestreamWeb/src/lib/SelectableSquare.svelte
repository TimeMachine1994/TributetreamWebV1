<script>
    import { writable } from "svelte/store";
  
    // Store to track the selected square
    let selectedSquare = writable(null);
  
    // Function to handle square selection
    const handleSquareClick = (index) => {
      selectedSquare.set(index);
    };
  </script>
  
  <div class="flex flex-col items-center gap-4">
    <!-- Square container -->
    <div class="flex gap-4">
      {#each [0, 1, 2] as index}
        <div
          class="w-24 h-24 rounded-lg flex items-center justify-center border-2 border-gray-500 cursor-pointer hover:bg-gray-200 transition duration-300"
          class:bg-blue-500="($selectedSquare === index)"
          on:click={() => handleSquareClick(index)}
        >
          <!-- Add text or icons if needed -->
        </div>
      {/each}
    </div>
  
    <!-- Button -->
    <button
      class="mt-4 px-6 py-2 bg-gray-300 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
      disabled={$selectedSquare === null}
    >
      Continue
    </button>
  </div>
  
  <style>
    /* Tailwind handles most styles; minimal custom styles here if necessary */
  </style>
  