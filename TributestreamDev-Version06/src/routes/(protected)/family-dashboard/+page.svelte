<script lang="ts">
  import AuthGuard from '$lib/components/AuthGuard.svelte';
  import { getUser, logout } from '$lib/stores/auth.store.svelte';
  import type { UserData } from '$lib/auth/types';
  
  // Create local state for user data
  let userData = $state<UserData>(getUser());
  
  // Keep user data updated
  $effect(() => {
    userData = getUser();
    console.log('👨‍👩‍👧‍👦 User data loaded in family dashboard!', userData);
  });
</script>

<AuthGuard>
  <div class="container mx-auto p-8">
    <h1 class="text-2xl font-bold mb-6">Family Dashboard</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="mb-4">
        <h2 class="text-lg font-semibold mb-2">Account Information</h2>
        <p><strong>ID:</strong> {userData.id}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        {#if userData.name}
          <p><strong>Name:</strong> {userData.name}</p>
        {/if}
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold mb-4">Family Tribute Management</h2>
      <div class="bg-gray-50 p-4 rounded border">
        <p class="text-gray-600">✨ Family tribute options and shared access controls will appear here.</p>
      </div>
    </div>
    
    <div class="mt-6">
      <button 
        class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
        onclick={() => {
          console.log('👋 Logging out from family dashboard');
          logout();
        }}
      >
        Logout
      </button>
    </div>
  </div>
</AuthGuard>