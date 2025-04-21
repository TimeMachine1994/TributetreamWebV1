<script lang="ts">
  import { invalidate } from '$app/navigation';
  import type { UserInfo } from '$lib/types/auth.types';
  import Button from '$lib/components/ui/button.svelte';
  
  export let user: UserInfo;
  
  async function handleLogout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      
      if (response.ok) {
        // Reload the page to update auth state
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
</script>

<div class="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
  <h2 class="text-2xl font-bold mb-6 text-center">Your Profile</h2>
  
  <div class="space-y-4">
    <div class="bg-blue-50 p-4 rounded-md">
      <div class="flex items-center justify-center mb-4">
        <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
          <span class="text-white text-2xl font-bold">
            {user.username ? user.username.charAt(0).toUpperCase() : '?'}
          </span>
        </div>
      </div>
      
      <dl class="space-y-2">
        <div>
          <dt class="text-sm font-medium text-gray-500">Username</dt>
          <dd class="text-gray-900">{user.username}</dd>
        </div>
        
        <div>
          <dt class="text-sm font-medium text-gray-500">Email</dt>
          <dd class="text-gray-900">{user.email}</dd>
        </div>
        
        <div>
          <dt class="text-sm font-medium text-gray-500">User ID</dt>
          <dd class="text-gray-900">{user.id}</dd>
        </div>
      </dl>
    </div>
    
    <Button 
      type="button" 
      variant="outline" 
      className="w-full"
      on:click={handleLogout}
    >
      Logout
    </Button>
  </div>
</div>