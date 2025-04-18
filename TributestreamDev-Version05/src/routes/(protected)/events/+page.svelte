<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore, user, isAuthenticated } from '$lib/stores/auth.store';
  
  // Define event interface
  interface Event {
    id: number;
    title: string;
    description: string;
    status: string;
    date: string;
    location: string;
  }
  
  // Placeholder data for events
  let events: Event[] = [];
  let isLoading = true;
  let error: string | null = null;
  
  onMount(async () => {
    try {
      // In a real implementation, this would fetch events from an API
      // For now, we'll simulate a delay and then set empty data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      events = [];
      isLoading = false;
    } catch (err) {
      console.error('Error loading events:', err);
      error = err instanceof Error ? err.message : 'Failed to load events';
      isLoading = false;
    }
  });
  
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
  <title>Events | TributeStream</title>
  <meta name="description" content="Manage your events" />
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
            <a href="/tributes" class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
              Tributes
            </a>
            <a href="/events" class="inline-flex items-center border-b-2 border-blue-500 px-1 pt-1 text-sm font-medium text-gray-900">
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
        <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900">Events</h1>
      </div>
    </header>
    <main>
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="px-4 py-8 sm:px-0">
          <!-- Loading Indicator -->
          {#if isLoading}
            <div class="flex justify-center py-8">
              <svg class="h-8 w-8 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          <!-- Error Message -->
          {:else if error}
            <div class="rounded-md bg-red-50 p-4">
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
          <!-- Empty State -->
          {:else if events.length === 0}
            <div class="rounded-lg border-4 border-dashed border-gray-200 p-4 sm:p-6 lg:p-8">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No events</h3>
                <p class="mt-1 text-sm text-gray-500">Get started by creating a new event.</p>
                <div class="mt-6">
                  <button
                    type="button"
                    class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    New Event
                  </button>
                </div>
              </div>
            </div>
          <!-- Event List -->
          {:else}
            <div class="overflow-hidden bg-white shadow sm:rounded-md">
              <ul role="list" class="divide-y divide-gray-200">
                {#each events as event (event.id)}
                  <li>
                    <a href="/events/{event.id}" class="block hover:bg-gray-50">
                      <div class="px-4 py-4 sm:px-6">
                        <div class="flex items-center justify-between">
                          <p class="truncate text-sm font-medium text-blue-600">{event.title}</p>
                          <div class="ml-2 flex flex-shrink-0">
                            <p class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                              {event.status}
                            </p>
                          </div>
                        </div>
                        <div class="mt-2 sm:flex sm:justify-between">
                          <div class="sm:flex">
                            <p class="flex items-center text-sm text-gray-500">
                              {event.description}
                            </p>
                          </div>
                          <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd" />
                            </svg>
                            <p>
                              <time datetime={event.date}>{event.date}</time>
                            </p>
                          </div>
                        </div>
                      </div>
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      </div>
    </main>
  </div>
</div>