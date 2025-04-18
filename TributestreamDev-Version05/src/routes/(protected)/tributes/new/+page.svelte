<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore, user } from '$lib/stores/auth.store';
  import { tributesStore } from '$lib/stores/tributes.store';
  
  // Form data
  let lovedOnesName = '';
  let lovedOnesDob = '';
  let lovedOnesDod = '';
  let pageHtml = '';
  let isSubmitting = false;
  let error: string | null = null;
  
  // Handle form submission
  async function handleSubmit() {
    isSubmitting = true;
    error = null;
    
    try {
      // Create a slugified name from the loved one's name
      const slugifiedName = lovedOnesName
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
      
      // Create the tribute data
      const tributeData = {
        created_by_user_id: $user?.id || 0,
        loved_ones_name: lovedOnesName,
        slugified_name: slugifiedName,
        page_html: pageHtml,
        loved_ones_dob: lovedOnesDob || null,
        loved_ones_dod: lovedOnesDod || null
      };
      
      // Create the tribute
      await tributesStore.createTribute(tributeData);
      
      // Redirect to the tributes list
      goto('/tributes');
    } catch (err) {
      console.error('Error creating tribute:', err);
      error = err instanceof Error ? err.message : 'Failed to create tribute';
    } finally {
      isSubmitting = false;
    }
  }
  
  // Handle cancel
  function handleCancel() {
    goto('/tributes');
  }
</script>

<svelte:head>
  <title>Create Tribute | TributeStream</title>
  <meta name="description" content="Create a new tribute" />
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
        <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900">Create New Tribute</h1>
      </div>
    </header>
    <main>
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="px-4 py-8 sm:px-0">
          <div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
            <div class="md:grid md:grid-cols-3 md:gap-6">
              <div class="md:col-span-1">
                <h3 class="text-lg font-medium leading-6 text-gray-900">Tribute Information</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Create a tribute page for your loved one. Fill in the details below to get started.
                </p>
              </div>
              <div class="mt-5 md:col-span-2 md:mt-0">
                <form on:submit|preventDefault={handleSubmit}>
                  {#if error}
                    <div class="mb-4 rounded-md bg-red-50 p-4">
                      <div class="flex">
                        <div class="flex-shrink-0">
                          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <div class="ml-3">
                          <h3 class="text-sm font-medium text-red-800">{error}</h3>
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
                      {isSubmitting ? 'Creating...' : 'Create Tribute'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>