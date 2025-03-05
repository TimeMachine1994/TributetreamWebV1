<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  import { getUnifiedStoreContext } from '$lib/stores/unified-store.svelte';
  import { processFormActionResult } from '$lib/utils/unified-form-helper';

  // Get the unified store context
  const store = getUnifiedStoreContext();

  // Get the initial data from the server
  const { data } = $props();
  
  // Local state for the search form and UI
  let query = $state(data.initialQuery || '');
  let isSearching = $state(false);
  let currentPage = $state(data.currentPage || 1);
  let errorMessage = $state(data.error || '');
  
  // Synchronize query with lovedOne name when appropriate
  $effect(() => {
    if (store.lovedOneInfo.fullName && !query) {
      query = store.lovedOneInfo.fullName;
    }
  });
  
  // Initialize the store search results with server data
  $effect(() => {
    if (data.initialResults && data.initialResults.length > 0) {
      store.searchResults = {
        tributes: data.initialResults,
        total_pages: data.totalPages || 1,
        currentPage: data.currentPage || 1,
        isLoading: false,
        error: null
      };
    }
  });
  
  // Update the query parameter in the URL when the query changes
  $effect(() => {
    if (typeof window !== 'undefined' && query) {
      const url = new URL(window.location.href);
      url.searchParams.set('q', query);
      window.history.replaceState({}, '', url.toString());
    }
  });
  
  // Handle search submission manually (separate from form action)
  async function handleSearch() {
    if (!query.trim()) return;
    
    isSearching = true;
    errorMessage = '';
    
    try {
      await store.searchTributes(query, 1, 10);
    } catch (error) {
      console.error('Search error:', error);
      errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    } finally {
      isSearching = false;
    }
  }
  
  // Navigate to a specific page of results
  async function changePage(newPage: number) {
    if (newPage < 1 || newPage > store.searchResults.total_pages) return;
    
    isSearching = true;
    currentPage = newPage;
    
    try {
      await store.searchTributes(query, newPage, 10);
    } catch (error) {
      console.error('Page navigation error:', error);
      errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    } finally {
      isSearching = false;
    }
  }
  
  // Run search when the component mounts if we have a query
  onMount(() => {
    // Only search if we don't already have results from SSR
    if (query && (!data.initialResults || data.initialResults.length === 0)) {
      handleSearch();
    }
  });
</script>

<div class="min-h-screen bg-[#CFCFCE] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
  <h1 class="text-4xl font-extrabold text-[#070707] mb-6">Search Tributes</h1>
  
  <!-- Search form with enhanced submission -->
  <form 
    method="POST" 
    action="?/search" 
    class="w-full max-w-lg flex mb-8"
    use:enhance={() => {
      isSearching = true;
      errorMessage = '';
      
      return ({ result, update }) => {
        isSearching = false;
        
        if (result.type === 'failure') {
          errorMessage = typeof result.data?.message === 'string' 
            ? result.data.message 
            : 'Search failed';
          console.error('Search error:', result.data);
        }
        
        if (result.type === 'success') {
          // Cast and properly type check the result data
          const resultData = result.data as {
            data?: {
              tributes?: any[];
              total_pages?: number;
            };
            page?: number;
          } || {};
          
          // Update the unified store with the search results
          store.searchResults = {
            tributes: resultData.data?.tributes || [],
            total_pages: resultData.data?.total_pages || 1,
            currentPage: (resultData.page || 1) as number,
            isLoading: false,
            error: null
          };
          
          currentPage = (resultData.page || 1) as number;
        }
        
        // Allow default update
        update();
      };
    }}
  >
    <input
      type="text"
      name="query"
      bind:value={query}
      placeholder="Search for a loved one..."
      class="flex-grow py-3 px-4 rounded-l-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D5BA7F] focus:border-[#D5BA7F] text-gray-700"
    />
    <input type="hidden" name="page" value={currentPage} />
    <button
      type="submit"
      class="px-6 py-3 bg-[#D5BA7F] text-black font-semibold rounded-r-md hover:bg-[#AD9254] focus:outline-none focus:ring-2 focus:ring-[#D5BA7F] transition"
    >
      Search
    </button>
  </form>

  <!-- Loading indicator -->
  {#if isSearching || store.searchResults.isLoading}
    <div class="text-lg text-[#070707] animate-pulse mb-4">Searching...</div>
  {/if}
  
  <!-- Error message -->
  {#if errorMessage || store.searchResults.error}
    <div class="w-full max-w-2xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p class="font-semibold">Error:</p>
      <p>{errorMessage || store.searchResults.error}</p>
    </div>
  {/if}
  
  <!-- Search results -->
  {#if store.searchResults.tributes.length > 0}
    <div class="w-full max-w-2xl space-y-4">
      {#each store.searchResults.tributes as tribute}
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
          <h2 class="text-xl font-bold text-[#070707] mb-2">{tribute.title}</h2>
          
          {#if tribute.memorialDate}
            <p class="text-gray-600 mb-3">
              Memorial Date: {new Date(tribute.memorialDate).toLocaleDateString()}
            </p>
          {/if}
          
          {#if tribute.memorialLocation}
            <p class="text-gray-600 mb-4">Location: {tribute.memorialLocation}</p>
          {/if}
          
          <a
            href={`/celebration-of-life-for-${tribute.slug}`}
            class="inline-block px-4 py-2 bg-[#D5BA7F] text-black font-semibold rounded hover:bg-[#AD9254] transition"
          >
            View Tribute
          </a>
        </div>
      {/each}
      
      <!-- Pagination controls -->
      {#if store.searchResults.total_pages > 1}
        <div class="flex justify-center mt-6 space-x-2">
          <button
            on:click={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
          >
            Previous
          </button>
          
          <span class="px-4 py-2 bg-white border border-gray-300 rounded">
            Page {currentPage} of {store.searchResults.total_pages}
          </span>
          
          <button
            on:click={() => changePage(currentPage + 1)}
            disabled={currentPage === store.searchResults.total_pages}
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      {/if}
    </div>
  {:else if !isSearching && !errorMessage && query}
    <p class="text-lg text-gray-700 mt-6">
      No tributes found for "<span class="font-semibold">{query}</span>"
    </p>
  {/if}
</div>
