<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import type { Tribute } from '$lib/types/tribute';
  
  // Define interfaces
  interface Notification {
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }
  
  // State using Svelte 5 runes
  let searchQuery = $state('');
  let searchResults = $state<Tribute[]>([]);
  let selectedTribute = $state<Tribute | null>(null);
  let htmlContent = $state('');
  let isLoading = $state(false);
  let isSaving = $state(false);
  let notification = $state<Notification>({ show: false, message: '', type: 'success' });
  let showPreview = $state(false);
  let previewViewport = $state<'desktop' | 'mobile'>('desktop');
  
  // Debounced search
  let searchTimeout: ReturnType<typeof setTimeout>;
  
  $effect(() => {
    clearTimeout(searchTimeout);
    if (searchQuery.length > 2) {
      isLoading = true;
      searchTimeout = setTimeout(async () => {
        await searchTributes();
      }, 300);
    } else {
      searchResults = [];
    }
  });
  
  // Search tributes
  async function searchTributes() {
    try {
      const response = await fetch(`/api/tributes/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        searchResults = data.tributes || [];
      } else {
        showNotification('Failed to search tributes', 'error');
      }
    } catch (error) {
      showNotification('An error occurred while searching', 'error');
    } finally {
      isLoading = false;
    }
  }
  
  // Select tribute
  async function selectTribute(tribute: Tribute) {
    selectedTribute = tribute;
    isLoading = true;
    
    try {
      const response = await fetch(`/api/tributes/${tribute.id}`);
      if (response.ok) {
        const data = await response.json();
        htmlContent = data.custom_html || '';
      } else {
        showNotification('Failed to load tribute details', 'error');
      }
    } catch (error) {
      showNotification('An error occurred while loading tribute', 'error');
    } finally {
      isLoading = false;
    }
  }
  
  // Save HTML content
  async function saveHtmlContent() {
    if (!selectedTribute) return;
    
    isSaving = true;
    
    try {
      const response = await fetch(`/api/tributes/${selectedTribute.id}/html`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ custom_html: htmlContent })
      });
      
      if (response.ok) {
        showNotification('Tribute HTML saved successfully', 'success');
      } else {
        showNotification('Failed to save tribute HTML', 'error');
      }
    } catch (error) {
      showNotification('An error occurred while saving', 'error');
    } finally {
      isSaving = false;
    }
  }
  
  // Toggle preview
  function togglePreview() {
    showPreview = !showPreview;
  }
  
  // Toggle preview viewport
  function toggleViewport() {
    previewViewport = previewViewport === 'desktop' ? 'mobile' : 'desktop';
  }
  
  // Show notification
  function showNotification(message: string, type: 'success' | 'error' = 'success') {
    notification = { show: true, message, type };
    setTimeout(() => {
      notification = { ...notification, show: false };
    }, 3000);
  }
</script>

<svelte:head>
  <title>Tribute HTML Editor</title>
</svelte:head>

<div class="container mx-auto">
  <h1 class="text-2xl font-bold mb-6">Tribute HTML Editor</h1>
  
  <!-- Search Section -->
  <div class="mb-8">
    <div class="flex items-center mb-4">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search tributes by name..."
        class="p-2 border rounded w-full max-w-md"
      />
      {#if isLoading && searchQuery.length > 2}
        <div class="ml-2">Loading...</div>
      {/if}
    </div>
    
    {#if searchResults.length > 0}
      <div class="bg-white shadow rounded p-4 max-h-60 overflow-y-auto">
        <ul>
          {#each searchResults as tribute}
            <li>
              <button
                on:click={() => selectTribute(tribute)}
                class="w-full text-left p-2 hover:bg-gray-100 rounded {selectedTribute?.id === tribute.id ? 'bg-blue-100' : ''}"
              >
                {tribute.loved_one_name}
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {:else if searchQuery.length > 2 && !isLoading}
      <div class="text-gray-500">No tributes found matching "{searchQuery}"</div>
    {/if}
  </div>
  
  <!-- Editor Section -->
  {#if selectedTribute}
    <div class="bg-white shadow rounded p-6">
      <h2 class="text-xl font-semibold mb-4">Editing: {selectedTribute.loved_one_name}</h2>
      
      <!-- Editor/Preview Toggle -->
      <div class="flex justify-between mb-4">
        <div class="flex space-x-2">
          <button
            on:click={togglePreview}
            class="px-3 py-1 rounded border {!showPreview ? 'bg-blue-100 border-blue-300' : 'bg-gray-100'}"
          >
            {showPreview ? 'Edit HTML' : 'Code View'}
          </button>
          
          {#if showPreview}
            <button
              on:click={toggleViewport}
              class="px-3 py-1 rounded border bg-gray-100"
            >
              {previewViewport === 'desktop' ? 'Desktop View' : 'Mobile View'}
            </button>
          {/if}
        </div>
        
        <button
          on:click={saveHtmlContent}
          disabled={isSaving}
          class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      <!-- Editor/Preview Content -->
      <div class="border rounded">
        {#if showPreview}
          <div class="p-4 bg-gray-50">
            <div class="{previewViewport === 'mobile' ? 'max-w-sm mx-auto border shadow-md' : 'w-full'}">
              <iframe
                title="HTML Preview"
                srcdoc={htmlContent}
                class="w-full min-h-[500px] border-0"
                sandbox="allow-same-origin"
              ></iframe>
            </div>
          </div>
        {:else}
          <textarea
            bind:value={htmlContent}
            class="w-full h-96 p-3 border-0 font-mono text-sm"
            placeholder="Enter HTML content here..."
          ></textarea>
        {/if}
      </div>
    </div>
  {:else if searchQuery.length > 0}
    <div class="bg-gray-100 p-6 rounded text-center">
      <p>Select a tribute from the search results to edit its HTML content</p>
    </div>
  {:else}
    <div class="bg-gray-100 p-6 rounded text-center">
      <p>Search for a tribute by name to get started</p>
    </div>
  {/if}
  
  <!-- Notification -->
  {#if notification.show}
    <div
      transition:fade
      class="fixed bottom-4 right-4 p-4 rounded shadow-lg {notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white"
    >
      {notification.message}
    </div>
  {/if}
</div>