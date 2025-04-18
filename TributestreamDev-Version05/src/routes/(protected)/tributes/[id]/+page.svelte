<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore, user } from '$lib/stores/auth.store';
  import { tributesStore, isLoading, error } from '$lib/stores/tributes.store';
  import type { Tribute } from '$lib/types/wordpress.types';
  
  // Get the tribute ID from the URL
  const tributeId = parseInt($page.params.id);
  
  // Tribute data
  let tribute: Tribute | null = null;
  
  onMount(async () => {
    try {
      // Load the tribute
      await tributesStore.loadTribute(tributeId);
      
      // Find the tribute in the store
      const tributes = $tributesStore.tributes;
      tribute = tributes.find(t => t.tribute_id === tributeId) || null;
    } catch (err) {
      console.error('Error loading tribute:', err);
    }
  });
  
  // Handle edit
  function handleEdit() {
    goto(`/tributes/${tributeId}/edit`);
  }
  
  // Handle delete
  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this tribute?')) {
      return;
    }
    
    try {
      await tributesStore.deleteTribute(tributeId);
      goto('/tributes');
    } catch (err) {
      console.error('Error deleting tribute:', err);
    }
  }
  
  // Handle back
  function handleBack() {
    goto('/tributes');
  }
</script>

<svelte:head>
  <title>{tribute?.loved_ones_name || 'Tribute'} | TributeStream</title>
  <meta name="description" content="View tribute details" />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <div class="py-10">
    <header>
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="md:flex md:items-center md:justify-between">
          <div class="min-w-0 flex-1">
            <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              {tribute?.loved_ones_name || 'Loading tribute...'}
            </h1>
          </div>
          <div class="mt-4 flex md:ml-4 md:mt-0">
            <button
              type="button"
              on:click={handleBack}
              class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Back to Tributes
            </button>
            <button
              type="button"
              on:click={handleEdit}
              class="ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              type="button"
              on:click={handleDelete}
              class="ml-3 inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </header>
    <main>
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="px-4 py-8 sm:px-0">
          <!-- Loading Indicator -->
          {#if $isLoading}
            <div class="flex justify-center py-8">
              <svg class="h-8 w-8 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
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
          <!-- Tribute Details -->
          {:else if tribute}
            <div class="overflow-hidden bg-white shadow sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg font-medium leading-6 text-gray-900">Tribute Details</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">Details about the tribute for {tribute.loved_ones_name}.</p>
              </div>
              <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl class="sm:divide-y sm:divide-gray-200">
                  <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Name</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{tribute.loved_ones_name}</dd>
                  </div>
                  <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">URL Slug</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{tribute.slugified_name}</dd>
                  </div>
                  <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {tribute.loved_ones_dob ? new Date(tribute.loved_ones_dob).toLocaleDateString() : 'Not specified'}
                    </dd>
                  </div>
                  <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Date of Death</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {tribute.loved_ones_dod ? new Date(tribute.loved_ones_dod).toLocaleDateString() : 'Not specified'}
                    </dd>
                  </div>
                  <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Page Content</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {#if tribute.page_html}
                        <div class="prose max-w-none">
                          {@html tribute.page_html}
                        </div>
                      {:else}
                        <p class="italic text-gray-500">No content provided</p>
                      {/if}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          <!-- No Tribute Found -->
          {:else}
            <div class="rounded-md bg-yellow-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-yellow-800">Tribute not found</h3>
                  <div class="mt-2 text-sm text-yellow-700">
                    <p>The tribute you're looking for could not be found. It may have been deleted or you may not have permission to view it.</p>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </main>
  </div>
</div>