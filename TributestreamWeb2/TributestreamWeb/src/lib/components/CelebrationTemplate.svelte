<script lang="ts">
  let { data } = $props();
    
    // Destructure the data passed from server
    const { template, slug } = data;
  </script>
  
  {#if template === 'celebration-v2'}
    <div class="celebration-container">
      <header class="celebration-header">
        <h1>Celebration of Life for {slug}</h1>
      </header>
      
      <main class="celebration-content">
        <!-- Add your celebration page components here -->
        <!-- This is where you'll render the user's content -->
      </main>
    </div>
  {/if}
  
  <style>
    .celebration-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
  
    .celebration-header {
      text-align: center;
      margin-bottom: 2rem;
    }
  
    .celebration-content {
      /* Add your styles */
    }
  </style>
  