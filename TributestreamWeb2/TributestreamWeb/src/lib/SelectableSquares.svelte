<script lang="ts">
   
      // Add "selected" state to the clicked button
  
</script>
<!-- Container for the centered squares -->
<div class="flex justify-center items-center h-screen">
  <!-- Wrapper for the squares -->
  <div id="button-container" class="flex gap-6 w-3/5">
    <!-- Square 1 -->
    <div
      id="button-1"
      class="button flex-1 bg-transparent border-2 border-gray-300 rounded-lg p-4 text-center transform transition-all duration-300 shadow-lg"
    >
      <p class="text-gray-700">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.
      </p>
    </div>
    <!-- Square 2 -->
    <div
      id="button-2"
      class="button flex-1 bg-transparent border-2 border-gray-300 rounded-lg p-4 text-center transform transition-all duration-300 shadow-lg"
    >
      <p class="text-gray-700">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.
      </p>
    </div>
    <!-- Square 3 -->
    <div
      id="button-3"
      class="button flex-1 bg-transparent border-2 border-gray-300 rounded-lg p-4 text-center transform transition-all duration-300 shadow-lg"
    >
      <p class="text-gray-700">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.
      </p>
    </div>
  </div>
</div>



<style>
  /* Custom styles for hover and selected states */
  .button:hover {
    transform: scale(1.1);
    background-color: #93c5fd; /* Light blue on hover */
    border-color: #3b82f6; /* Blue border on hover */
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  }

  .button:active {
    transform: scale(0.95) translateY(2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) inset;
  }

  .pressed {
    transform: translateY(2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) inset;
  }
</style>
