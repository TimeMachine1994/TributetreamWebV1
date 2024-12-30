<!-- *****************************************************************************************
     +page.svelte (Svelte 5 / Dashboard)
     This file is the main Dashboard page in Svelte 5. It demonstrates:
       1. Using Runes ($state) for reactivity.
       2. Handling props via $props().
       3. Managing editing and saving logic for tribute objects.
       4. Tailwind CSS utility classes for styling.
       5. Extensive console logging to debug data flow.
****************************************************************************************** -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchWithAuth } from '$lib/utils/fetchWithAuth';

  /**
   * Svelte 5's new approach: $props(), $state, etc.
   * We can console.log to confirm we’re getting the correct server data (tributes, status).
   */
  const { data } = $props(); // The `load` function in +page.server.ts returns this
  console.log('[dashboard/+page.svelte] Initial data from +page.server.ts:', data);

  // Reactive state for tributePages and dashboardData
  let tributePages = $state([]);
  let dashboardData = $state([]);

  // Log the initial state values for debugging
  console.log('[dashboard/+page.svelte] Initial state: tributePages =', tributePages);
  console.log('[dashboard/+page.svelte] Initial state: dashboardData =', dashboardData);

  onMount(async () => {
    try {
      const response = await fetch('/api/tribute-pages');
      dashboardData = await response.json();
      tributePages = dashboardData.tributePages || [];
      console.log('Loaded tribute pages:', tributePages);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  });
 
</script>

<!-- Main Page Content -->
<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-4">Dashboard</h1>

  <!-- Debugging: Display initial props -->
  <div class="bg-gray-100 p-4 rounded mb-6">
    <h2 class="text-lg font-semibold">Server Data:</h2>
    <pre class="text-sm">{JSON.stringify(data, null, 2)}</pre>
  </div>

  <!-- Display the tribute pages -->
  {#if tributePages.length > 0}
    <div>
      {#each tributePages as tribute, index}
        <div
          class="p-4 mb-4 border rounded hover:bg-gray-100"
          on:click={() => logInteraction('Selected Tribute', tribute)}
        >
          <h2 class="text-xl font-semibold">{tribute.title}</h2>
          <p class="text-gray-600">Index: {index}</p>
        </div>
      {/each}
    </div>
  {:else}
    <p>No tribute pages available. Please check back later.</p>
  {/if}

  <!-- Debugging: Display fetched dashboard data -->
  <div class="bg-gray-50 p-4 rounded mt-6">
    <h2 class="text-lg font-semibold">Fetched Dashboard Data:</h2>
    <pre class="text-sm">{JSON.stringify(dashboardData, null, 2)}</pre>
  </div>
</div>
