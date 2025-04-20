<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { tributeStore } from '$lib/stores/tribute.store';
  
  // Get the tribute ID from the URL
  const tributeId = parseInt($page.params.id);
  
  // State for extended data
  let showExtendedData = false;
  let isEditing = false;
  let editedHtml = '';
  
  // Load tribute and extended data on mount
  onMount(async () => {
    try {
      await tributeStore.loadTributeById(tributeId);
      
      // Try to load extended data if tribute loaded successfully
      if (tributeStore.currentTribute) {
        try {
          await tributeStore.loadTributeData(tributeId);
        } catch (error) {
          // Extended data might not exist yet, which is fine
          console.log('No extended data found');
        }
      }
    } catch (error) {
      console.error('Error loading tribute:', error);
    }
  });
  
  // Function to toggle editing mode
  function toggleEdit() {
    if (!isEditing && tributeStore.currentTribute) {
      editedHtml = tributeStore.currentTribute.custom_html || '';
    }
    isEditing = !isEditing;
  }
  
  // Function to save edited tribute
  async function saveTribute() {
    if (!tributeStore.currentTribute) return;
    
    try {
      await tributeStore.updateTribute(tributeId, {
        custom_html: editedHtml
      });
      
      isEditing = false;
    } catch (error) {
      console.error('Error updating tribute:', error);
    }
  }
  
  // Function to delete tribute
  async function deleteTribute() {
    if (!confirm('Are you sure you want to delete this tribute?')) return;
    
    try {
      await tributeStore.deleteTribute(tributeId);
      window.location.href = '/tributes';
    } catch (error) {
      console.error('Error deleting tribute:', error);
    }
  }
  
  // Function to save extended data
  async function saveExtendedData() {
    if (!tributeStore.tributeExtendedData) {
      // Create new extended data
      const newData = {
        tribute_reference: tributeId,
        // Add default fields here
        notes: '',
        preferences: {},
        metadata: {
          last_updated: new Date().toISOString()
        }
      };
      
      await tributeStore.createOrReplaceTributeData(tributeId, newData);
    } else {
      // Update existing extended data
      const updatedData = {
        ...tributeStore.tributeExtendedData,
        metadata: {
          ...tributeStore.tributeExtendedData.metadata,
          last_updated: new Date().toISOString()
        }
      };
      
      await tributeStore.updateTributeData(tributeId, updatedData);
    }
  }
</script>

<div class="container mx-auto p-4">
  <!-- Back button -->
  <div class="mb-4">
    <a href="/tributes" class="text-primary hover:underline flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Back to Tributes
    </a>
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
  {:else if !tributeStore.currentTribute}
    <!-- Not found state -->
    <div class="text-center py-8">
      <p class="text-muted-foreground">Tribute not found</p>
    </div>
  {:else}
    <!-- Tribute details -->
    <div class="bg-card text-card-foreground rounded-lg shadow-sm p-6 mb-6">
      <div class="flex justify-between items-start mb-4">
        <h1 class="text-3xl font-bold">{tributeStore.currentTribute.loved_one_name}</h1>
        
        <div class="flex gap-2">
          <button
            on:click={toggleEdit}
            class="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          
          <button
            on:click={deleteTribute}
            class="px-3 py-1 bg-destructive text-destructive-foreground rounded-md text-sm"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p class="text-sm text-muted-foreground">ID</p>
          <p>{tributeStore.currentTribute.id}</p>
        </div>
        
        <div>
          <p class="text-sm text-muted-foreground">Slug</p>
          <p>{tributeStore.currentTribute.slug}</p>
        </div>
        
        <div>
          <p class="text-sm text-muted-foreground">Created At</p>
          <p>{new Date(tributeStore.currentTribute.created_at).toLocaleString()}</p>
        </div>
        
        <div>
          <p class="text-sm text-muted-foreground">Updated At</p>
          <p>{new Date(tributeStore.currentTribute.updated_at).toLocaleString()}</p>
        </div>
        
        <div>
          <p class="text-sm text-muted-foreground">User ID</p>
          <p>{tributeStore.currentTribute.user_id}</p>
        </div>
        
        <div>
          <p class="text-sm text-muted-foreground">Phone Number</p>
          <p>{tributeStore.currentTribute.phone_number}</p>
        </div>
        
        <div>
          <p class="text-sm text-muted-foreground">Number of Streams</p>
          <p>{tributeStore.currentTribute.number_of_streams}</p>
        </div>
      </div>
      
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-2">Custom HTML</h2>
        
        {#if isEditing}
          <div class="mb-4">
            <textarea
              bind:value={editedHtml}
              class="w-full h-64 p-2 border rounded-md font-mono text-sm"
            ></textarea>
          </div>
          
          <button
            on:click={saveTribute}
            class="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Save Changes
          </button>
        {:else}
          <div class="bg-muted p-4 rounded-md overflow-auto max-h-64">
            {#if tributeStore.currentTribute.custom_html}
              <div class="font-mono text-sm whitespace-pre-wrap">
                {tributeStore.currentTribute.custom_html}
              </div>
            {:else}
              <p class="text-muted-foreground italic">No custom HTML</p>
            {/if}
          </div>
        {/if}
      </div>
      
      <!-- Extended Data Section -->
      <div>
        <button
          on:click={() => showExtendedData = !showExtendedData}
          class="flex items-center gap-1 text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="transform: rotate({showExtendedData ? '90deg' : '0deg'}); transition: transform 0.2s;"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          Extended Data
        </button>
        
        {#if showExtendedData}
          <div class="mt-4 p-4 border rounded-md">
            {#if tributeStore.tributeExtendedData}
              <pre class="bg-muted p-4 rounded-md overflow-auto max-h-64 text-sm">
                {JSON.stringify(tributeStore.tributeExtendedData, null, 2)}
              </pre>
              
              <button
                on:click={saveExtendedData}
                class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Update Extended Data
              </button>
            {:else}
              <p class="text-muted-foreground italic mb-4">No extended data found</p>
              
              <button
                on:click={saveExtendedData}
                class="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Create Extended Data
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>