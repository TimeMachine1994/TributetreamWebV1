<!-- src/routes/my-portal/users/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  interface PageData {
    user: { id: string; name: string; email: string } | null;
    accessDenied: boolean;
    error?: string;
  }
  
  let { data } = $props<{ data: PageData }>();
  
  // State
  let users = $state<any[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  
  // Load WordPress Backbone.js client and fetch users
  onMount(() => {
    if (browser && !data.accessDenied) {
      loadWordPressClient();
    }
  });
  
  async function loadWordPressClient() {
    try {
      // Load the WordPress API client script dynamically
      const script = document.createElement('script');
      script.src = 'https://wp.tributestream.com/wp-includes/js/wp-api.min.js';
      script.onload = initWpApi;
      script.onerror = () => {
        error = 'Failed to load WordPress API client';
        isLoading = false;
      };
      document.head.appendChild(script);
    } catch (err) {
      error = 'Error loading WordPress API client';
      isLoading = false;
    }
  }
  
  function initWpApi() {
    // Wait for the client to be ready
    // Use type assertion to tell TypeScript that window has wp property
    (window as any).wp.api.loadPromise.done(() => {
      fetchUsers();
    });
  }
  
  function fetchUsers() {
    try {
      // Create a collection of users
      const usersCollection = new (window as any).wp.api.collections.Users();
      
      // Fetch users
      usersCollection.fetch().done((fetchedUsers: any) => {
        users = fetchedUsers.toJSON();
        isLoading = false;
      }).fail((err: any) => {
        error = 'Failed to fetch users';
        isLoading = false;
        console.error('Error fetching users:', err);
      });
    } catch (err) {
      error = 'Error initializing users collection';
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>User Management | Tributestream</title>
  <meta name="description" content="Manage users and their roles in Tributestream." />
</svelte:head>

<div class="container min-h-screen px-4 py-16 mx-auto flex flex-col items-center justify-center">
  <div class="max-w-4xl w-full">
    <div class="bg-surface-100 rounded-lg shadow-lg overflow-hidden">
      <div class="p-6 md:p-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl md:text-4xl font-bold" style="color: #D5BA7F;">
            User Management
          </h1>
          
          <a 
            href="/my-portal"
            class="px-4 py-2 bg-surface-200 text-surface-600 rounded-md hover:bg-surface-300 transition-colors"
          >
            Back to Portal
          </a>
        </div>
        
        {#if data.accessDenied}
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Access denied. You need administrator privileges to view this page.</p>
          </div>
        {:else if isLoading}
          <div class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        {:else if error}
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white">
              <thead>
                <tr>
                  <th class="py-2 px-4 border-b text-left">ID</th>
                  <th class="py-2 px-4 border-b text-left">Username</th>
                  <th class="py-2 px-4 border-b text-left">Email</th>
                  <th class="py-2 px-4 border-b text-left">Roles</th>
                </tr>
              </thead>
              <tbody>
                {#each users as user}
                  <tr class="hover:bg-gray-50">
                    <td class="py-2 px-4 border-b">{user.id}</td>
                    <td class="py-2 px-4 border-b">{user.username}</td>
                    <td class="py-2 px-4 border-b">{user.email}</td>
                    <td class="py-2 px-4 border-b">
                      {#if user.roles && user.roles.length > 0}
                        <div class="flex flex-wrap gap-1">
                          {#each user.roles as role}
                            <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {role}
                            </span>
                          {/each}
                        </div>
                      {:else}
                        <span class="text-gray-400">No roles</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
                
                {#if users.length === 0}
                  <tr>
                    <td colspan="4" class="py-4 text-center text-gray-500">No users found</td>
                  </tr>
                {/if}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>