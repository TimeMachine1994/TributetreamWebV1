<script lang="ts">
  import AuthGuard from '$lib/components/AuthGuard.svelte';
  import { getUser, logout } from '$lib/stores/auth.store.svelte';
  import type { UserData } from '$lib/auth/types';
  
  // Create local state for user data
  let userData = $state<UserData>(getUser());
  
  // Keep user data updated
  $effect(() => {
    userData = getUser();
    console.log('🧑‍💼 Funeral Director Portal: User data updated', userData);
  });
</script>

<AuthGuard>
  <div class="container mx-auto p-8">
    <h1 class="text-2xl font-bold mb-6">Funeral Director Portal</h1>
    
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Account Information Panel -->
      <div class="bg-white rounded-lg shadow-md p-6 md:col-span-2">
        <div class="mb-4">
          <h2 class="text-lg font-semibold mb-2">Account Information</h2>
          <p><strong>ID:</strong> {userData.id}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          {#if userData.name}
            <p><strong>Name:</strong> {userData.name}</p>
          {/if}
          <p><strong>Role:</strong> {userData.role}</p>
        </div>
        
        <div class="mt-6">
          <button 
            class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
            onclick={logout}
          >
            Logout
          </button>
        </div>
      </div>
      
      <!-- Active Tributes Panel -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4">Active Tributes</h2>
        <div class="p-4 bg-gray-50 rounded border border-gray-200 text-center">
          <p class="text-gray-500">Your active tributes will appear here</p>
          <button class="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm">
            View All Tributes
          </button>
        </div>
      </div>
      
      <!-- Scheduled Services Panel -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4">Scheduled Services</h2>
        <div class="p-4 bg-gray-50 rounded border border-gray-200 text-center">
          <p class="text-gray-500">Your upcoming scheduled services will appear here</p>
          <button class="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm">
            View Calendar
          </button>
        </div>
      </div>
      
      <!-- Client Management Panel -->
      <div class="bg-white rounded-lg shadow-md p-6 md:col-span-2">
        <h2 class="text-lg font-semibold mb-4">Client Management</h2>
        <div class="p-4 bg-gray-50 rounded border border-gray-200 text-center">
          <p class="text-gray-500">Manage your client information and contacts</p>
          <div class="flex justify-center gap-3 mt-3">
            <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm">
              View All Clients
            </button>
            <button class="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded text-sm">
              Add New Client
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</AuthGuard>