<script lang="ts">
  import AuthGuard from '$lib/components/AuthGuard.svelte';
  import { getUser, logout } from '$lib/stores/auth.store.svelte';
  import type { UserData } from '$lib/auth/types';
  
  // Create local state for user data
  let userData = $state<UserData>(getUser());
  
  // Keep user data updated
  $effect(() => {
    userData = getUser();
    console.log('👑 Admin data loaded in admin dashboard!', userData);
  });
</script>

<AuthGuard>
  <div class="container mx-auto p-8">
    <h1 class="text-2xl font-bold mb-6">Administrator Dashboard</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="mb-4">
        <h2 class="text-lg font-semibold mb-2">Account Information</h2>
        <p><strong>ID:</strong> {userData.id}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        {#if userData.name}
          <p><strong>Name:</strong> {userData.name}</p>
        {/if}
        <p><strong>Role:</strong> {userData.role}</p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <!-- System Statistics Panel -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4">
          <span class="mr-2">📊</span>System Statistics
        </h2>
        <div class="bg-gray-50 p-4 rounded border">
          <p class="text-gray-600">Total Users: --</p>
          <p class="text-gray-600">Total Tributes: --</p>
          <p class="text-gray-600">Active Sessions: --</p>
          <p class="text-gray-600 mt-3 text-sm italic">System statistics will be populated here.</p>
        </div>
      </div>
      
      <!-- User Management Panel -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4">
          <span class="mr-2">👥</span>User Management
        </h2>
        <div class="bg-gray-50 p-4 rounded border">
          <p class="text-gray-600">Recent Users</p>
          <ul class="my-2 pl-4">
            <li>• User management controls</li>
            <li>• Role assignments</li>
            <li>• Account approvals</li>
          </ul>
          <p class="text-gray-600 mt-3 text-sm italic">User management interface will be integrated here.</p>
        </div>
      </div>
      
      <!-- Funeral Home Management Panel -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4">
          <span class="mr-2">🏢</span>Funeral Home Management
        </h2>
        <div class="bg-gray-50 p-4 rounded border">
          <p class="text-gray-600">Registered Homes</p>
          <ul class="my-2 pl-4">
            <li>• Funeral home directory</li>
            <li>• Package management</li>
            <li>• Service settings</li>
          </ul>
          <p class="text-gray-600 mt-3 text-sm italic">Funeral home management tools will be available here.</p>
        </div>
      </div>
    </div>
    
    <div class="mt-6">
      <button 
        class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
        onclick={() => {
          console.log('👋 Logging out from admin dashboard');
          logout();
        }}
      >
        Logout
      </button>
    </div>
  </div>
</AuthGuard>