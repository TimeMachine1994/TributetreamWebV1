<script lang="ts">
  import { onMount } from 'svelte';
  import { tributeStore } from '$lib/stores/tribute.store';
  
  // Pagination controls
  let page = 1;
  let perPage = 10;
  let searchTerm = '';
  
  // Load tributes on mount
  onMount(() => {
    loadTributes();
  });
  
  // Function to load tributes
  async function loadTributes() {
    await tributeStore.loadTributes(page, perPage, searchTerm);
  }
  
  // Function to handle page change
  function handlePageChange(newPage: number) {
    page = newPage;
    loadTributes();
  }
  
  // Function to handle search
  function handleSearch() {
    page = 1; // Reset to first page when searching
    loadTributes();
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-4">Tributes</h1>
  
  <!-- Search form -->
  <div class="mb-4">
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={searchTerm}
        placeholder="Search tributes..."
        class="px-4 py-2 border rounded-md flex-grow"
      />
      <button
        on:click={handleSearch}
        class="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Search
      </button>
    </div>
  </div>
  
  <!-- Loading state -->
  {#if tributeStore.isLoading}
    <div class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  {:else if tributeStore.error}
    <!-- Error state -->
    <div class="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
      <p>{tributeStore.error}</p>
    </div>
  {:else if tributeStore.tributes.length === 0}
    <!-- Empty state -->
    <div class="text-center py-8">
      <p class="text-muted-foreground">No tributes found</p>
    </div>
  {:else}
    <!-- Tributes list -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each tributeStore.tributes as tribute (tribute.id)}
        <div class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-2">{tribute.loved_one_name}</h2>
            <p class="text-sm text-muted-foreground mb-2">
              Created: {new Date(tribute.created_at).toLocaleDateString()}
            </p>
            <div class="flex justify-between items-center mt-4">
              <a 
                href="/tributes/{tribute.id}" 
                class="text-primary hover:underline"
              >
                View Details
              </a>
              <span class="text-xs bg-muted px-2 py-1 rounded-full">
                ID: {tribute.id}
              </span>
            </div>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Pagination -->
    {#if tributeStore.totalPages > 1}
      <div class="flex justify-center mt-8">
        <div class="flex gap-2">
          <button
            on:click={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            class="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          
          {#each Array(tributeStore.totalPages) as _, i}
            <button
              on:click={() => handlePageChange(i + 1)}
              class="px-3 py-1 border rounded-md {page === i + 1 ? 'bg-primary text-primary-foreground' : ''}"
            >
              {i + 1}
            </button>
          {/each}
          
          <button
            on:click={() => handlePageChange(Math.min(tributeStore.totalPages, page + 1))}
            disabled={page === tributeStore.totalPages}
            class="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    {/if}
  {/if}
</div>