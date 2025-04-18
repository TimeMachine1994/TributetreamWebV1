<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore, user, isAuthenticated } from '$lib/stores/auth.store';
  import {
    tributesStore,
    tributes,
    isLoading,
    error,
    totalItems,
    totalPages,
    currentPage
  } from '$lib/stores/tributes.store';
  
  // Pagination
  let page = 1;
  let perPage = 10;
  let debugState = {
    loadingStarted: false,
    loadingCompleted: false,
    error: null as string | null,
    apiResponse: null as any
  };
  
  // Local loading state as a fallback
  let localIsLoading = true;
  
  // Subscribe to the isLoading store to track changes
  $: {
    console.log("isLoading changed:", $isLoading);
    // Update local loading state
    if ($isLoading === false) {
      localIsLoading = false;
    }
  }
  
  // Subscribe to the tributes store to track changes
  $: {
    console.log("tributes changed:", $tributes.length);
    // If we have tributes data, we're definitely not loading anymore
    if ($tributes.length >= 0) {
      localIsLoading = false;
    }
  }
  
  onMount(async () => {
    console.log("Tributes page mounted");
    console.log("Initial state:", {
      isLoading: $isLoading,
      error: $error,
      tributes: $tributes.length,
      isLoadingType: typeof $isLoading
    });
    
    debugState.loadingStarted = true;
    
    try {
      // Load tributes when the component mounts
      console.log("Starting to load tributes...");
      await tributesStore.loadTributes(page, perPage);
      console.log("Tributes loaded successfully");
      console.log("Loaded tributes:", $tributes);
      debugState.loadingCompleted = true;
      debugState.apiResponse = $tributes;
    } catch (err) {
      console.error("Error in tributes page onMount:", err);
      debugState.error = err instanceof Error ? err.message : String(err);
    }
    
    console.log("Final state:", {
      isLoading: $isLoading,
      error: $error,
      tributes: $tributes.length,
      debugState,
      isLoadingType: typeof $isLoading
    });
    
    // Force check the loading state after a short delay
    setTimeout(() => {
      console.log("Delayed check - isLoading:", $isLoading);
    }, 500);
  });
  
  // Handle pagination
  async function handlePageChange(newPage: number) {
    page = newPage;
    await tributesStore.loadTributes(page, perPage);
  }
  
  // Handle create tribute
  function handleCreateTribute() {
    goto('/tributes/new');
  }
  
  // Handle logout
  async function handleLogout() {
    try {
      await authStore.logout();
      goto('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
</script>

<svelte:head>
  <title>Tributes | TributeStream</title>
  <meta name="description" content="Manage your tributes" />
</svelte:head>

<div class="min-h-screen bg-gray-100">
  <nav class="bg-white shadow-sm">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between">
        <div class="flex">
          <div class="flex flex-shrink-0 items-center">
            <span class="text-xl font-bold text-blue-600">TributeStream</span>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a href="/dashboard" class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
              Dashboard
            </a>
            <a href="/tributes" class="inline-flex items-center border-b-2 border-blue-500 px-1 pt-1 text-sm font-medium text-gray-900">
              Tributes
            </a>
            <a href="/events" class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
              Events
            </a>
            <a href="/streams" class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
              Streams
            </a>
          </div>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <div class="relative ml-3">
            <div class="flex items-center">
              <span class="mr-4 text-sm font-medium text-gray-700">
                Welcome, {$user?.displayName || 'User'}
              </span>
              <button
                type="button"
                class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                on:click={handleLogout}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <div class="py-10">
    <header>
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900">Tributes</h1>
      </div>
    </header>
    <main>
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="px-4 py-8 sm:px-0">
          <!-- Loading Indicator -->
          {#if localIsLoading && $isLoading !== false}
            <div class="flex flex-col items-center justify-center py-8">
              <svg class="h-8 w-8 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div class="mt-4 text-sm text-gray-500">
                Loading tributes...
              </div>
              
              <!-- Debug information -->
              <div class="mt-4 rounded border border-gray-300 bg-gray-50 p-4 text-left">
                <h3 class="text-sm font-medium text-gray-700">Debug Information:</h3>
                <pre class="mt-2 overflow-auto text-xs text-gray-600">
Loading started: {debugState.loadingStarted}
Loading completed: {debugState.loadingCompleted}
Error: {debugState.error || 'None'}
Store loading state: {$isLoading}
Store error state: {$error || 'None'}
                </pre>
              </div>
            </div>
          <!-- Error Message -->
          {:else if $error}
            <div class="rounded-md bg-red-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">{$error}</h3>
                </div>
              </div>
            </div>
          <!-- Empty State -->
          {:else if $tributes.length === 0}
            <div class="rounded-lg border-4 border-dashed border-gray-200 p-4 sm:p-6 lg:p-8">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No tributes</h3>
                <p class="mt-1 text-sm text-gray-500">Get started by creating a new tribute.</p>
                <div class="mt-6">
                  <button
                    type="button"
                    class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    on:click={handleCreateTribute}
                  >
                    <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    New Tribute
                  </button>
                </div>
              </div>
            </div>
          <!-- Tribute List -->
          {:else}
            <div class="overflow-hidden bg-white shadow sm:rounded-md">
              <ul role="list" class="divide-y divide-gray-200">
                {#each $tributes as tribute (tribute.tribute_id)}
                  <li>
                    <a href="/tributes/{tribute.tribute_id}" class="block hover:bg-gray-50">
                      <div class="px-4 py-4 sm:px-6">
                        <div class="flex items-center justify-between">
                          <p class="truncate text-sm font-medium text-blue-600">{tribute.loved_ones_name}</p>
                          <div class="ml-2 flex flex-shrink-0">
                            <p class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                              Active
                            </p>
                          </div>
                        </div>
                        <div class="mt-2 sm:flex sm:justify-between">
                          <div class="sm:flex">
                            <p class="flex items-center text-sm text-gray-500">
                              {tribute.slugified_name}
                            </p>
                          </div>
                          <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd" />
                            </svg>
                            <p>
                              <time datetime={tribute.loved_ones_dod || 'N/A'}>
                                {tribute.loved_ones_dod ? new Date(tribute.loved_ones_dod).toLocaleDateString() : 'N/A'}
                              </time>
                            </p>
                          </div>
                        </div>
                      </div>
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
            
            <!-- Pagination -->
            {#if $totalPages > 1}
              <div class="mt-5 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div class="flex flex-1 justify-between sm:hidden">
                  <button
                    class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={$currentPage === 1}
                    on:click={() => handlePageChange($currentPage - 1)}
                  >
                    Previous
                  </button>
                  <button
                    class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={$currentPage === $totalPages}
                    on:click={() => handlePageChange($currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
                <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p class="text-sm text-gray-700">
                      Showing <span class="font-medium">{($currentPage - 1) * perPage + 1}</span> to <span class="font-medium">{Math.min($currentPage * perPage, $totalItems)}</span> of{' '}
                      <span class="font-medium">{$totalItems}</span> results
                    </p>
                  </div>
                  <div>
                    <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        disabled={$currentPage === 1}
                        on:click={() => handlePageChange($currentPage - 1)}
                      >
                        <span class="sr-only">Previous</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      
                      {#each Array.from({ length: Math.min(5, $totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return pageNum;
                      }) as pageNum}
                        <button
                          class={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            pageNum === $currentPage
                              ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                          on:click={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      {/each}
                      
                      <button
                        class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        disabled={$currentPage === $totalPages}
                        on:click={() => handlePageChange($currentPage + 1)}
                      >
                        <span class="sr-only">Next</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            {/if}
          {/if}
        </div>
      </div>
    </main>
  </div>
</div>