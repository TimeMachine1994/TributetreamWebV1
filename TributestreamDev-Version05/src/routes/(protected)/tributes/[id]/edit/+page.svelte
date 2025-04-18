<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore, user } from '$lib/stores/auth.store';
  import { tributesStore, isLoading, error } from '$lib/stores/tributes.store';
  import type { Tribute } from '$lib/types/wordpress.types';
  
  // Get the tribute ID from the URL
  const tributeId = parseInt($page.params.id);
  
  // Form data
  let lovedOnesName = '';
  let lovedOnesDob = '';
  let lovedOnesDod = '';
  let pageHtml = '';
  let slugifiedName = '';
  let isSubmitting = false;
  let formError: string | null = null;
  
  onMount(async () => {
    try {
      // Load the tribute
      await tributesStore.loadTribute(tributeId);
      
      // Find the tribute in the store
      const tributes = $tributesStore.tributes;
      const tribute = tributes.find(t => t.tribute_id === tributeId);
      
      if (tribute) {
        // Populate the form with the tribute data
        lovedOnesName = tribute.loved_ones_name;
        lovedOnesDob = tribute.loved_ones_dob || '';
        lovedOnesDod = tribute.loved_ones_dod || '';
        pageHtml = tribute.page_html || '';
        slugifiedName = tribute.slugified_name;
      }
    } catch (err) {
      console.error('Error loading tribute:', err);
      formError = err instanceof Error ? err.message : 'Failed to load tribute';
    }
  });
  
  // Handle form submission
  async function handleSubmit() {
    isSubmitting = true;
    formError = null;
    
    try {
      // Create a slugified name from the loved one's name if it's changed
      if (lovedOnesName && !slugifiedName) {
        slugifiedName = lovedOnesName
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-');
      }
      
      // Create the tribute data
      const tributeData = {
        loved_ones_name: lovedOnesName,
        slugified_name: slugifiedName,
        page_html: pageHtml,
        loved_ones_dob: lovedOnesDob || null,
        loved_ones_dod: lovedOnesDod || null
      };
      
      // Update the tribute
      await tributesStore.updateTribute(tributeId, tributeData);
      
      // Redirect to the tribute details page
      goto(`/tributes/${tributeId}`);
    } catch (err) {
      console.error('Error updating tribute:', err);
      formError = err instanceof Error ? err.message : 'Failed to update tribute';
    } finally {
      isSubmitting = false;
    }
  }
  
  // Handle cancel
  function handleCancel() {
    goto(`/tributes/${tributeId}`);
  }
</script>

<svelte:head>
  <title>Edit Tribute | TributeStream</title>
  <meta name="description" content="Edit tribute details" />
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
        <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900">Edit Tribute</h1>
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
          <!-- Edit Form -->
          {:else}
            <div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">Tribute Information</h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Edit the tribute information for your loved one.
                  </p>
                </div>
                <div class="mt-5 md:col-span-2 md:mt-0">
                  <form on:submit|preventDefault={handleSubmit}>
                    {#if formError}
                      <div class="mb-4 rounded-md bg-red-50 p-4">
                        <div class="flex">
                          <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                            </svg>
                          </div>
                          <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800">{formError}</h3>
                          </div>
                        </div>
                      </div>
                    {/if}
                    
                    <div class="grid grid-cols-6 gap-6">
                      <div class="col-span-6 sm:col-span-4">
                        <label for="loved-ones-name" class="block text-sm font-medium text-gray-700">Loved One's Name</label>
                        <input
                          type="text"
                          name="loved-ones-name"
                          id="loved-ones-name"
                          bind:value={lovedOnesName}
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div class="col-span-6 sm:col-span-4">
                        <label for="slugified-name" class="block text-sm font-medium text-gray-700">URL Slug</label>
                        <input
                          type="text"
                          name="slugified-name"
                          id="slugified-name"
                          bind:value={slugifiedName}
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <p class="mt-2 text-sm text-gray-500">
                          This will be used in the URL for the tribute page. Leave blank to generate from the name.
                        </p>
                      </div>

                      <div class="col-span-6 sm:col-span-3">
                        <label for="loved-ones-dob" class="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                          type="date"
                          name="loved-ones-dob"
                          id="loved-ones-dob"
                          bind:value={lovedOnesDob}
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div class="col-span-6 sm:col-span-3">
                        <label for="loved-ones-dod" class="block text-sm font-medium text-gray-700">Date of Death</label>
                        <input
                          type="date"
                          name="loved-ones-dod"
                          id="loved-ones-dod"
                          bind:value={lovedOnesDod}
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div class="col-span-6">
                        <label for="page-html" class="block text-sm font-medium text-gray-700">Page Content</label>
                        <textarea
                          name="page-html"
                          id="page-html"
                          bind:value={pageHtml}
                          rows="5"
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Enter HTML content for the tribute page"
                        ></textarea>
                        <p class="mt-2 text-sm text-gray-500">
                          You can enter HTML content for the tribute page. This will be displayed on the tribute page.
                        </p>
                      </div>
                    </div>
                    
                    <div class="mt-5 flex justify-end space-x-3">
                      <button
                        type="button"
                        on:click={handleCancel}
                        class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </main>
  </div>
</div>