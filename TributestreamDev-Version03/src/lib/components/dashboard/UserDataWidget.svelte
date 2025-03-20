<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { tributePersistence } from '$lib/persistence/tribute-persistence';
  import type { FormData } from '$lib/api/tribute-api-client';
  
  export let userId: number;
  
  // Use the persistence layer's reactive stores
  const formDataStore = tributePersistence.getFormDataStore(userId);
  const tributesStore = tributePersistence.getUserTributesStore(userId);
  
  let loading = true;
  let error: string | null = null;
  
  // Derived data for the UI
  $: deceasedName = $formDataStore ? 
    `${$formDataStore['deceased-first-name'] || ''} ${$formDataStore['deceased-last-name'] || ''}`.trim() : 
    'Not available';
  
  $: directorName = $formDataStore ? 
    `${$formDataStore['director-first-name'] || ''} ${$formDataStore['director-last-name'] || ''}`.trim() : 
    'Not available';
    
  $: tributeCount = $tributesStore ? $tributesStore.length : 0;
  
  // Function to refresh data from the server
  async function refreshData() {
    loading = true;
    error = null;
    
    try {
      // Force refresh both stores
      await Promise.all([
        tributePersistence.getFormData(userId, { forceRefresh: true }),
        tributePersistence.getTributesByUser(userId, { forceRefresh: true })
      ]);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to refresh data';
    } finally {
      loading = false;
    }
  }
  
  // Initial data loading
  onMount(async () => {
    await refreshData();
  });
</script>

<div class="bg-card rounded-lg p-6 shadow-sm" transition:fade={{ duration: 200 }}>
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-xl font-semibold">Memorial Information</h3>
    <button 
      on:click={refreshData}
      class="text-sm px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex gap-2 items-center"
      disabled={loading}
    >
      {#if loading}
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Refreshing...</span>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Refresh</span>
      {/if}
    </button>
  </div>
  
  {#if error}
    <div class="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
      {error}
    </div>
  {/if}
  
  {#if $formDataStore}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <div class="text-sm text-muted-foreground">Loved One</div>
        <div class="font-medium">{deceasedName}</div>
      </div>
      
      <div class="space-y-2">
        <div class="text-sm text-muted-foreground">Funeral Director</div>
        <div class="font-medium">{directorName}</div>
      </div>
      
      <div class="space-y-2">
        <div class="text-sm text-muted-foreground">Memorial Location</div>
        <div class="font-medium">{$formDataStore['location-name'] || 'Not available'}</div>
      </div>
      
      <div class="space-y-2">
        <div class="text-sm text-muted-foreground">Memorial Date</div>
        <div class="font-medium">{$formDataStore['memorial-date'] || 'Not available'}</div>
      </div>
    </div>
    
    <div class="mt-6 pt-4 border-t border-border">
      <div class="text-sm text-muted-foreground mb-2">Tribute Pages ({tributeCount})</div>
      
      {#if $tributesStore && $tributesStore.length > 0}
        <ul class="space-y-2">
          {#each $tributesStore as tribute}
            <li class="flex justify-between items-center p-2 bg-muted/50 rounded-md">
              <span>{tribute.loved_one_name}</span>
              <a 
                href={`/celebration-of-life-for-${tribute.slug}`} 
                class="text-sm text-primary hover:underline"
              >
                View Page
              </a>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="text-muted-foreground text-sm">No tribute pages found.</div>
      {/if}
    </div>
  {:else if loading}
    <div class="py-4 flex justify-center">
      <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  {:else}
    <div class="py-4 text-center text-muted-foreground">
      No memorial information available.
      <a href="/fd-form" class="text-primary hover:underline">Create one now</a>.
    </div>
  {/if}
</div>