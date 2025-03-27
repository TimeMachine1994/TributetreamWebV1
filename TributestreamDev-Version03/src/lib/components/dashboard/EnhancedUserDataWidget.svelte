<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { tributePersistence } from '$lib/persistence/tribute-persistence';
  import { eventsPersistence } from '$lib/persistence/events-persistence';
  import type { FormData } from '$lib/api/tribute-api-client';
  import type { Event } from '$lib/types/event';
  import { isEventLive, isEventUpcoming } from '$lib/types/event';
  
  export let userId: number;
  
  // Use the persistence layer's reactive stores
  const formDataStore = tributePersistence.getFormDataStore(userId);
  const tributesStore = tributePersistence.getUserTributesStore(userId);
  const activeEventsStore = eventsPersistence.getActiveEventsStore();
  
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
  
  // Function to format date and time for display
  function formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return 'Not available';
    
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  // Function to get event status label and class
  function getEventStatus(event: Event): { label: string; class: string } {
    if (isEventLive(event)) {
      return { 
        label: 'LIVE NOW', 
        class: 'bg-red-100 text-red-800 border-red-300' 
      };
    } else if (isEventUpcoming(event)) {
      return { 
        label: 'Upcoming', 
        class: 'bg-blue-100 text-blue-800 border-blue-300' 
      };
    } else {
      return { 
        label: 'Ended', 
        class: 'bg-gray-100 text-gray-800 border-gray-300' 
      };
    }
  }
  
  // Function to refresh data from the server
  async function refreshData() {
    loading = true;
    error = null;
    
    try {
      // Force refresh all stores
      await Promise.all([
        tributePersistence.getFormData(userId, { forceRefresh: true }),
        tributePersistence.getTributesByUser(userId, { forceRefresh: true }),
        eventsPersistence.getActiveEvents({ forceRefresh: true })
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
    
    <!-- Scheduled Events Section -->
    <div class="mt-6 pt-4 border-t border-border">
      <div class="text-sm text-muted-foreground mb-2">Scheduled Events</div>
      
      {#if $activeEventsStore && $activeEventsStore.length > 0}
        <ul class="space-y-3">
          {#each $activeEventsStore as event}
            {@const status = getEventStatus(event)}
            <li class="p-3 bg-muted/30 rounded-md border border-border">
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-medium">{event.location_name || 'Unknown Location'}</div>
                  <div class="text-sm text-muted-foreground mt-1">
                    {formatDateTime(event.start_time)} - {formatDateTime(event.end_time)}
                  </div>
                  {#if event.tribute_name}
                    <div class="text-sm mt-1">For: {event.tribute_name}</div>
                  {/if}
                </div>
                <span class={`text-xs px-2 py-1 rounded-full border ${status.class}`}>
                  {status.label}
                </span>
              </div>
              
              {#if event.location_address}
                <div class="text-xs text-muted-foreground mt-2">
                  {event.location_address}
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      {:else}
        <div class="text-muted-foreground text-sm p-3 bg-muted/30 rounded-md border border-border">
          No active events scheduled.
        </div>
      {/if}
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