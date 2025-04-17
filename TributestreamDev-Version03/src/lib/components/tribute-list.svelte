<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { initializeTributeService, tributeService } from '$lib/services/tribute-service';
  import { authStore } from '$lib/services/auth-service';
  import type { Tribute, TributeCollection } from '$lib/types/tribute';

  // State
  let tributes: Tribute[] = [];
  let loading = true;
  let error: string | null = null;
  let serviceInitialized = false;

  // Initialize the tribute service when the component mounts
  onMount(async () => {
    try {
      // Initialize service only in browser
      if (!serviceInitialized && browser) {
        console.log('Initializing tribute service in tribute-list component');
        initializeTributeService();
        serviceInitialized = true;
      }
      
      // Check if the user is authenticated
      const isAuthenticated = $authStore.isAuthenticated;
      
      if (!isAuthenticated) {
        // If not authenticated, you might want to redirect to login
        // or just show public tributes
        console.log('User is not authenticated, showing public tributes only');
      }
      
      // Fetch tributes
      loading = true;
      const result = await tributeService.getTributes();
      console.log('API Response:', result);
      
      // Check if result has a tributes property (TributeCollection format)
      if (result && 'tributes' in result) {
        console.log('Found tributes array in response:', result.tributes);
        tributes = result.tributes;
      } else {
        console.log('Using result directly as tributes array');
        tributes = result as Tribute[];
      }
      
      // Log the tributes
      if (tributes.length > 0) {
        console.log('First tribute:', tributes[0]);
      }
      
      loading = false;
    } catch (err) {
      console.error('Error fetching tributes:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      loading = false;
    }
  });

  // Function to handle tribute deletion
  async function deleteTribute(id: number) {
    if (confirm('Are you sure you want to delete this tribute?')) {
      try {
        await tributeService.deleteTribute(id);
        // Remove the deleted tribute from the list
        tributes = tributes.filter(tribute => tribute.id !== id);
      } catch (err) {
        console.error('Error deleting tribute:', err);
        alert('Failed to delete tribute');
      }
    }
  }
</script>

<div class="tribute-list">
  <h2>Tributes</h2>
  
  {#if loading}
    <p>Loading tributes...</p>
  {:else if error}
    <p class="error">Error: {error}</p>
  {:else if tributes.length === 0}
    <p>No tributes found.</p>
  {:else}
    <ul>
      {#each tributes as tribute (tribute.id)}
        <li>
          <h3>{tribute.loved_one_name}</h3>
          <p>Created: {tribute.created_at ? 
                       new Date(tribute.created_at).toLocaleDateString() : 
                       'Date not available'}</p>
          
          <div class="actions">
            <a href="/celebration-of-life-for-{tribute.slug || ''}" class="btn-view">View</a>
            {#if $authStore.isAuthenticated}
              <a href="/dashboard/tributes/{tribute.id}/edit" class="btn-edit">Edit</a>
              <button
                class="btn-delete"
                on:click={() => deleteTribute(tribute.id)}
              >
                Delete
              </button>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
  
  {#if $authStore.isAuthenticated}
    <div class="create-new">
      <a href="/dashboard/tributes/new" class="btn-create">Create New Tribute</a>
    </div>
  {/if}
</div>

<style>
  .tribute-list {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #444;
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .btn-view, .btn-edit, .btn-delete, .btn-create {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
  }
  
  .btn-view {
    background-color: #4a90e2;
    color: white;
  }
  
  .btn-edit {
    background-color: #f5a623;
    color: white;
  }
  
  .btn-delete {
    background-color: #e74c3c;
    color: white;
    border: none;
  }
  
  .btn-create {
    background-color: #2ecc71;
    color: white;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    margin-top: 1.5rem;
    display: inline-block;
  }
  
  .error {
    color: #e74c3c;
    font-weight: 500;
  }
  
  .create-new {
    margin-top: 2rem;
    text-align: center;
  }
</style>
