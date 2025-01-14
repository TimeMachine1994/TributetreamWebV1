<script lang="ts">
    import { 
      currentPage,
      formData,
      updateFormData,
      nextPage,
      previousPage
    } from '$lib/stores/calculatorStore';
  </script>
  
  <!-- You can use bind:value with stores directly -->
  <input 
    bind:value={$formData.yourName}
    placeholder="Your Name"
  />
  
  <button onclick={previousPage}>Back</button>
  <button onclick={nextPage}>Next</button>
  
  <!-- Access store values with $ prefix -->
  <div>Current Page: {$currentPage}</div>